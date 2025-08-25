import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../service/auth.service';
import { GroupClientsComponent } from '../dialog/group-clients/group-clients.component';
import { GroupDialogComponent } from '../dialog/group-dialog/group-dialog.component';
import { SupabaseService } from '../service/supabase.service';
import { BehaviorSubject, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { AddClientsComponent } from '../dialog/add-clients/add-clients.component';
import { TrainingSessionDialogComponent } from '../dialog/training-session-dialog/training-session-dialog.component';
import { Group } from "../model/group.model";
import {
  TrainingSessionsDialogViewComponent
} from "../dialog/training-sessions-dialog-view/training-sessions-dialog-view.component";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput, Calendar } from "@fullcalendar/core";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { TrainingSession } from "../model/training-session.model";

@Component({
  selector: 'app-coach',
  templateUrl: './coach.component.html',
  styleUrls: ['./coach.component.scss']
})
export class CoachComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  // Form
  groupForm!: FormGroup;

  // State management
  private readonly destroy$ = new Subject<void>();
  private readonly _groups$ = new BehaviorSubject<Group[]>([]);
  readonly groups$ = this._groups$.asObservable();

  // Track calendar initialization
  private isCalendarInitialized = false;
  private pendingEvents: EventInput[] = [];

  // Calendar configuration
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    displayEventEnd: true
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  ngAfterViewInit(): void {
    // Mark calendar as initialized after view init
    setTimeout(() => {
      this.isCalendarInitialized = true;

      // Add any pending events
      if (this.pendingEvents.length > 0 && this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        this.pendingEvents.forEach(event => calendarApi.addEvent(event));
        this.pendingEvents = [];
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [null, [Validators.min(1)]]
    });
  }

  private async loadInitialData(): Promise<void> {
    try {
      await this.loadGroups();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  private async loadGroups(): Promise<void> {
    try {
      const user = await this.authService.getUser();
      if (!user) {
        console.error('No logged in user');
        return;
      }

      const groups = await this.supabaseService.getGroupsByCoach(user.id);

      // Load client counts in parallel
      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          const { data: groupClients, error } = await this.supabaseService.getGroupClients(group.id);
          return {
            ...group,
            clientCount: !error ? (groupClients?.length || 0) : 0
          };
        })
      );

      this._groups$.next(groupsWithCounts);
      await this.refreshCalendarEvents(groupsWithCounts);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }

  private async refreshCalendarEvents(groups: Group[]): Promise<void> {
    try {
      const allEvents = await this.loadAllTrainingSessions(groups);

      // Check if calendar is ready
      if (this.isCalendarInitialized && this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();

        // Clear and add all events
        calendarApi.removeAllEvents();
        allEvents.forEach(event => calendarApi.addEvent(event));
      } else {
        // Store events to be added when calendar is ready
        this.pendingEvents = allEvents;
      }
    } catch (error) {
      console.error('Failed to refresh calendar events:', error);
    }
  }

  private async loadAllTrainingSessions(groups: Group[]): Promise<EventInput[]> {
    // Load sessions in parallel
    const sessionPromises = groups.map(group =>
      this.loadGroupSessions(group).catch(error => {
        console.error(`Failed to load sessions for group ${group.id}:`, error);
        return [];
      })
    );

    const sessionArrays = await Promise.all(sessionPromises);
    return sessionArrays.flat();
  }

  private async loadGroupSessions(group: Group): Promise<EventInput[]> {
    const sessions = await this.supabaseService.getTrainingSessionsByGroup(group.id);
    return sessions
      .map((session: TrainingSession) => this.convertSessionToEvent(session, group))
      .filter((event): event is EventInput => event !== null);
  }

  private convertSessionToEvent(session: TrainingSession, group: Group): EventInput | null {
    try {
      const startDateTime = this.parseDateTime(session.date, session.start_time);
      if (!startDateTime) return null;

      const endDateTime = this.calculateEndTime(startDateTime, session.duration);

      return {
        id: session.id,
        title: `${group.name} - ${session.name || 'Training'}${session.gym ? ' @ ' + session.gym : ''}`,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        extendedProps: {
          groupId: group.id,
          sessionId: session.id,
          gym: session.gym
        }
      };

    } catch (error) {
      console.error('Failed to convert session to event:', error);
      return null;
    }
  }

  private parseDateTime(dateStr: string, timeStr: string): Date | null {
    try {
      // Handle both date formats: yyyy-mm-dd and ISO string
      const dateOnly = dateStr.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);

      // Handle time with or without seconds
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0]) || 0;
      const minutes = parseInt(timeParts[1]) || 0;
      const seconds = parseInt(timeParts[2]) || 0;

      const dateTime = new Date(year, month - 1, day, hours, minutes, seconds);

      if (isNaN(dateTime.getTime())) {
        console.error('Invalid date/time:', { dateStr, timeStr });
        return null;
      }

      return dateTime;
    } catch (error) {
      console.error('Failed to parse date/time:', error);
      return null;
    }
  }

  private calculateEndTime(startTime: Date, duration?: string): Date {
    if (!duration) {
      // Default to 1 hour if no duration specified
      return new Date(startTime.getTime() + 60 * 60 * 1000);
    }

    if (duration.startsWith('PT')) {
      // ISO 8601 duration format (e.g., PT1H30M45S)
      const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!isoMatch) {
        return new Date(startTime.getTime() + 60 * 60 * 1000);
      }

      const [, hours = '0', minutes = '0', seconds = '0'] = isoMatch;

      const durationMs =
        ((parseInt(hours) * 60 + parseInt(minutes)) * 60 + parseInt(seconds)) * 1000;

      return new Date(startTime.getTime() + durationMs);

    } else {
      // HH:MM:SS format
      const hhmmssMatch = duration.match(/(\d+):(\d+):?(\d+)?/);
      if (!hhmmssMatch) {
        return new Date(startTime.getTime() + 60 * 60 * 1000);
      }

      const [, hours = '0', minutes = '0', seconds = '0'] = hhmmssMatch;

      const durationMs =
        ((parseInt(hours) * 60 + parseInt(minutes)) * 60 + parseInt(seconds)) * 1000;

      return new Date(startTime.getTime() + durationMs);
    }
  }


  async openCreateGroupDialog(): Promise<void> {
    try {
      const dialogRef = this.dialog.open(GroupDialogComponent, {
        width: '500px',
        disableClose: false
      });

      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) return;

      const user = await this.authService.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data: coach, error } = await this.supabaseService.getCoachByUserId(user.id);
      if (error || !coach) {
        console.error('Failed to get coach:', error);
        return;
      }

      const groupToCreate = { ...result, coach_id: coach.user_id };
      const createResult = await this.supabaseService.createGroup(groupToCreate);


      // Reload groups and refresh calendar
      await this.loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  }

  openAddClientsDialog(): void {
    const dialogRef = this.dialog.open(AddClientsComponent, {
      width: '800px',
      height: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false
    });

    // Subscribe to real-time updates
    const clientAddedSub = dialogRef.componentInstance.clientAdded$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedGroup: any) => {
        this.updateGroupClientCount(updatedGroup.id, updatedGroup.clientCount);
      });

    // Handle dialog close
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result) => {
        clientAddedSub.unsubscribe();

        if (result?.updatedGroupId) {
          await this.refreshGroupClientCount(result.updatedGroupId);
        }
      });
  }

  private updateGroupClientCount(groupId: string, clientCount: number): void {
    const groups = this._groups$.getValue();
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? { ...group, clientCount }
        : group
    );
    this._groups$.next(updatedGroups);
  }

  private async refreshGroupClientCount(groupId: string): Promise<void> {
    try {
      const { data: groupClients, error } = await this.supabaseService.getGroupClients(groupId);
      if (error) throw error;

      this.updateGroupClientCount(groupId, groupClients?.length || 0);
    } catch (error) {
      console.error('Failed to refresh client count:', error);
    }
  }

  async openGroupClients(groupId: string): Promise<void> {
    this.dialog.open(GroupClientsComponent, {
      data: { groupId },
      width: '600px'
    });
  }

  async openTrainingSessionsDialogView(groupId: string): Promise<void> {
    this.dialog.open(TrainingSessionsDialogViewComponent, {
      data: { groupId },
      width: '700px'
    });
  }

  async openCreateTrainingSessionDialog(): Promise<void> {
    try {
      const dialogRef = this.dialog.open(TrainingSessionDialogComponent, {
        width: '600px',
        autoFocus: false
      });

      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) return;

      // Call the service method
      const createResult = await this.supabaseService.createTrainingSession(result);

      // Check for both possible error locations
      if (createResult.error) {
        console.error('Failed to create training session:', createResult.error);
        return;
      }

      if (!createResult.data) {
        console.error('No data returned from createTrainingSession');
        return;
      }

      const session = createResult.data;

      // Add the new event to calendar immediately
      await this.addSessionToCalendar(session);

      // Force change detection to ensure UI updates
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error in openCreateTrainingSessionDialog:', error);
    }
  }

  private async addSessionToCalendar(session: TrainingSession): Promise<void> {
    const groups = this._groups$.getValue();
    const group = groups.find(g => g.id === session.group_id);

    if (!group) {
      console.error('Group not found for session:', session);
      // If group not found, reload groups and try again
      await this.loadGroups();
      return;
    }

    const event = this.convertSessionToEvent(session, group);

    if (!event) {
      console.error('Failed to convert session to event');
      return;
    }

    // Ensure calendar is ready and add event
    if (this.isCalendarInitialized && this.calendarComponent) {
      try {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.addEvent(event);

        // Force calendar to re-render
        calendarApi.render();

        console.log('Event added to calendar:', event);
      } catch (error) {
        console.error('Error adding event to calendar:', error);
      }
    } else {
      // If calendar not ready, add to pending events
      this.pendingEvents.push(event);
      console.log('Calendar not ready, event added to pending queue');
    }
  }
}
