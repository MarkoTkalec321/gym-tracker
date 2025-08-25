import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {environment} from "../config/environment";
import {BehaviorSubject, from, map} from "rxjs";
import {TrainingSession} from "../model/training-session.model";
import {Thread} from "../model/thread.model";

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private membershipSubject = new BehaviorSubject<any>(null);
  membership$ = this.membershipSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // --- RPC wrapper ---
  rpc(fn: string, params: object) {
    return this.supabase.rpc(fn, params);
  }

  async getMembershipDataAndRefresh(userId: string) {
    const {data, error} = await this.supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    this.membershipSubject.next(data);

    return data;
  }

  async getClientsByGroup(groupId: string) {
    const { data, error } = await this.supabase
      .from('group_clients')
      .select(`
      client_id,
      clients (
        id,
        user_id,
        first_name,
        last_name,
        date_of_birth
      )
    `)
      .eq('group_id', groupId);

    if (error) throw error;

    // flatten the results so you just return clients[]
    return data.map(gc => gc.clients);
  }

  async getGroupsByCoach(coachId: string) {
    const { data, error } = await this.supabase
      .from('groups')
      .select('*')
      .eq('coach_id', coachId);

    if (error) throw error;
    return data || [];
  }

  async getCoachByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('coaches')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  }

  async createGroup(group: { name: string; capacity?: number; coach_id: string }) {
    console.log('Supabase: creating group', group);
    const { error } = await this.supabase
      .from('groups')
      .insert([group]);
    if (error) throw error;
  }

  async addClientToGroup(clientId: string, groupId: string) {
    const { data, error } = await this.supabase
      .from('group_clients')
      .insert({
        client_id: clientId,
        group_id: groupId
      });

    if (error) throw error;
    return data;
  }

  async getAllClientsWithGroups() {
    const { data, error } = await this.supabase
      .from('clients')
      .select(`
      *,
      group_clients (
        group_id,
        groups (
          id,
          name
        )
      )
    `);

    if (error) {
      console.error('Error fetching clients with groups:', error);
      return [];
    }

    // Map each client to have a `groups` array
    return data.map((client: any) => ({
      ...client,
      groups: client.group_clients?.map((gc: any) => gc.groups) || []
    }));
  }

  async removeClientFromGroup(clientId: string, groupId: string) {
    const { error } = await this.supabase
      .from('group_clients')
      .delete()
      .match({ client_id: clientId, group_id: groupId });

    if (error) {
      console.error('Error removing client from group:', error.message);
      throw error;
    }
  }

  async getGroupClients(groupId: string) {
    const { data, error } = await this.supabase
      .from('group_clients')
      .select('*')
      .eq('group_id', groupId);

    return { data, error };
  }

  async createTrainingSession(sessionData: Omit<TrainingSession, 'id' | 'created_at'>): Promise<{ data: TrainingSession | null, error: any }> {
    try {
      // Ensure the duration is in the correct format for PostgreSQL interval
      const formattedSessionData = {
        ...sessionData,
        // If duration is in HH:MM format, convert to HH:MM:SS
        duration: this.formatDuration(sessionData.duration)
      };

      const { data, error } = await this.supabase
        .from('training_sessions')
        .insert([formattedSessionData])
        .select('*')
        .single(); // Use .single() to get a single object instead of array

      if (error) {
        console.error('Supabase error:', error);
        return { data: null, error };
      }

      // Return the data directly since .single() returns an object
      return { data: data as TrainingSession, error: null };
    } catch (error) {
      console.error('Unexpected error in createTrainingSession:', error);
      return { data: null, error };
    }
  }

  private formatDuration(duration: string): string {
    // If already in HH:MM:SS format, return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
      return duration;
    }

    // If in HH:MM format, add :00 for seconds
    if (/^\d{2}:\d{2}$/.test(duration)) {
      return `${duration}:00`;
    }

    // If just a number (assuming hours), format as HH:00:00
    if (/^\d+$/.test(duration)) {
      const hours = parseInt(duration);
      return `${hours.toString().padStart(2, '0')}:00:00`;
    }

    // Default to 1 hour if format is unrecognized
    return '01:00:00';
  }

  async getTrainingSessionsByGroup(groupId: string) {
    const { data, error } = await this.supabase
      .from('training_sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching training sessions:', error);
      return [];
    }

    return data || [];
  }

  async deleteTrainingSession(sessionId: string) {
    const {error} = await this.supabase
      .from('training_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  subscribeGroups(callback: () => void) {
    return this.supabase
      .channel('groups-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, callback)
      .subscribe();
  }

  subscribeThreads(groupId: string, callback: () => void) {
    return this.supabase
      .channel(`threads-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads', filter: `group_id=eq.${groupId}` },
        callback
      )
      .subscribe();
  }

  subscribeGroupMembers(groupId: string, callback: () => void) {
    return this.supabase
      .channel(`group_clients-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_clients', filter: `group_id=eq.${groupId}` },
        callback
      )
      .subscribe();
  }

  async createThread(threadData: { group_id: string; title: string; content: string; author_id: string }) {
    const { error } = await this.supabase
      .from('threads')
      .insert(threadData);

    if (error) throw error;
    return true;
  }

  async getThreadsWithAuthors(groupId: string): Promise<{ data: Thread[]; error: any }> {
    try {
      // 1. Get threads
      const { data: threads, error } = await this.supabase
        .from('threads')
        .select('id, group_id, author_id, title, content, created_at, updated_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error || !threads) return { data: [], error };

      const authorIds = threads.map(t => t.author_id);

      // 2. Get all coaches whose user_id is in authorIds
      const { data: coaches } = await this.supabase
        .from('coaches')
        .select('user_id, first_name, last_name')
        .in('user_id', authorIds);

      const coachMap = new Map(coaches?.map(c => [c.user_id, c]));

      // 3. Map threads to authors
      const threadsWithAuthors: Thread[] = threads.map(t => {
        if (coachMap.has(t.author_id)) {
          const c = coachMap.get(t.author_id)!;
          return {
            ...t,
            author_name: c.first_name,
            author_last_name: c.last_name,
            author_role: 'coach'
          };
        }
        // Otherwise assume client
        return {
          ...t,
          author_name: 'Unknown',
          author_last_name: '',
          author_role: 'client'
        };
      });

      return { data: threadsWithAuthors, error: null };
    } catch (e) {
      console.error('Error in getThreadsWithAuthors:', e);
      return { data: [], error: e };
    }
  }

  async deleteThread(threadId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('threads')
      .delete()
      .eq('id', threadId);

    return { error };
  }

  getCommentsForThread$(threadId: string) {
    return from(
      this.rpc('get_comments_for_thread', { thread: threadId }) // use the wrapper
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ?? [];
      })
    );
  }





  addComment(threadId: string, content: string, userId: string) {
    return this.supabase
      .from('comments')
      .insert({ thread_id: threadId, author_id: userId, content })
      .select()
      .single();
  }

  async createFriendRequest(requesterId: string, receiverId: string) {
    const { data, error } = await this.supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendFriendRequest(requesterId: string, receiverId: string) {
    const { data, error } = await this.rpc('send_friend_request', {
      p_requester: requesterId,
      p_receiver: receiverId
    });

    if (error) {
      // Convert Postgres errors to friendly messages
      if (error.code === 'P0001') throw new Error(error.message);
      throw error;
    }

    return data;
  }

  async getFriends(userId: string) {
    const { data, error } = await this.supabase
      .from('friendships')
      .select('requester_id, receiver_id')
      .or(`and(requester_id.eq.${userId},status.eq.accepted),and(receiver_id.eq.${userId},status.eq.accepted)`);

    if (error) throw error;

    // Extract friend IDs (exclude current user)
    return data.map(f => (f.requester_id === userId ? f.receiver_id : f.requester_id));
  }


  async getFriendProfiles(friendIds: string[]) {
    const { data, error } = await this.supabase
      .from('profiles_unified')
      .select('user_id, first_name, last_name, role') // include whatever you need
      .in('user_id', friendIds);

    if (error) throw error;

    return data.map(u => ({
      uid: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role
    }));
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles_unified')
      .select('user_id, first_name, last_name, role')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      uid: data.user_id,
      name: `${data.first_name} ${data.last_name}`,
      role: data.role
    };
  }

  async getClients() {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*');

    if (error) throw error;
    return data;
  }

  // Delete a client by ID
  async deleteClient(clientId: string) {
    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;
  }

  async addFavorite(exerciseName: string) {
    const { data: { user } } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User not logged in');
    }

    const { data, error } = await this.supabase
      .from('favorites')
      .insert([{ user_id: user.id, exercise_name: exerciseName }]);

    if (error) {
      // return error so caller can handle it
      return { error };
    }

    return { data };
  }

  async addExercisesToSession(sessionId: string, exerciseNames: string[]) {
    if (!exerciseNames || exerciseNames.length === 0) return;

    const rows = exerciseNames.map(name => ({
      training_session_id: sessionId,
      exercise_name: name
      // sets/reps can be added later if needed
    }));

    const { data, error } = await this.supabase
      .from('training_session_exercises')
      .insert(rows);

    if (error) throw error;
    return data;
  }


  removeChannel(sub: any) {
    this.supabase.removeChannel(sub);
  }

}
