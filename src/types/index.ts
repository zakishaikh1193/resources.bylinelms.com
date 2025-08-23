export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  school: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'presentation' | 'interactive' | 'assessment';
  subject: string;
  grade: number;
  author: Teacher;
  createdAt: string;
  tags: string[];
  fileUrl?: string;
  previewImage?: string;
  status: 'submitted' | 'review' | 'approved' | 'published' | 'draft';
  likes: number;
  comments: number;
}

export interface GradeRow {
  id: string;
  grade: number;
  title: string;
  color: string;
  resources: Resource[];
}

export interface GradeColumn {
  id: string;
  grade: number;
  title: string;
  color: string;
  resources: Resource[];
}

export type ViewMode = 'view' | 'edit';