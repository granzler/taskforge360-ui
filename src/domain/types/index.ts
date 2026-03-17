export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Status = 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface ApiError {
  code: string;
  message: string;
  type: string;
}

export interface ApiErrorResponse {
  traceId: string;
  errors: ApiError[];
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiError[]; traceId?: string };
