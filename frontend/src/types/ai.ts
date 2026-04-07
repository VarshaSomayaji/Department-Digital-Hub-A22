export interface DoubtRequest {
  question: string;
  context?: string;
}

export interface DoubtResponse {
  answer: string;
}

export interface SummarizeRequest {
  text: string;
}

export interface SummarizeResponse {
  summary: string;
}