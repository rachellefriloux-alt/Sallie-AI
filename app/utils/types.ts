export interface VideoTrack {
  id: string;
  title: string;
  uri: string;
  duration?: number;
  thumbnail?: string;
  artist?: string;
  album?: string;
  genre?: string;
  description?: string;
  metadata?: Record<string, any>;
}
