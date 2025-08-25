export interface Thread {
  id: string;
  group_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  author_name?: string; // optional, will fetch from users
  author_last_name?: string;
  author_role?: 'coach' | 'client';
}
