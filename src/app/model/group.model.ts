export interface Group {
  id: string;
  name: string;
  capacity?: number | null;
  clientCount?: number;
  coach_id: string;
  [key: string]: any;
}
