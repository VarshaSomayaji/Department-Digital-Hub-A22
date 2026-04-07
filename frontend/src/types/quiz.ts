export interface Question {
  question: string;
  options: string[];
  correctOption: number; // index of correct option (0-based)
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  batch: string;
  faculty: {
    _id: string;
    name: string;
  };
  questions: Question[];
  duration: number; // in minutes
  startTime: string; // ISO date
  endTime: string; // ISO date
  results: Array<{
    student: {
      _id: string;
      name: string;
      rollNo?: string;
    };
    score: number;
    submittedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  subject: string;
  batch: string;
  questions: Question[];
  duration: number;
  startTime: string;
  endTime: string;
}

export interface UpdateQuizData extends Partial<CreateQuizData> {}

export interface QuizSubmission {
  quizId: string;
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
  }>;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed?: boolean;
}