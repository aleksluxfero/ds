export enum DreamType {
  Normal = 'normal',
  Lucid = 'lucid',
  FalseAwakening = 'false_awakening',
  SleepParalysis = 'sleep_paralysis',
  Vivid = 'vivid'
}

export interface Dream {
  id: number;
  title: string;
  content: string;
  date: number | null; // Stored as timestamp, or null if unknown
  tags: string[];
  type: DreamType;
}