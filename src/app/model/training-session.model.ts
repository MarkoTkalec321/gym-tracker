export interface TrainingSession {
  id: string;
  group_id: string;
  date: string; // yyyy-mm-dd
  start_time: string; // HH:MM:SS
  duration: string; // interval comes back as string in Supabase JS
  created_at?: string;
  name?: string;
  gym?: string;
}
