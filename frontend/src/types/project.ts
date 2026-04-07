export interface Project {
  _id: string;
  title: string;
  description: string;
  domain: string;
  techStack: string[];
  keywords: string[];
  summary: string;
  fileUrls: string[];
  uploadedBy: {
    role: 'FACULTY' | 'STUDENT';
    id: {
      _id: string;
      name: string;
    };
  };
  year: number;
  tags: string[];
  createdAt: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  year: number;
  // files are sent as FormData
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  domain?: string;
  techStack?: string[];
  keywords?: string[];
  summary?: string;
  tags?: string[];
}