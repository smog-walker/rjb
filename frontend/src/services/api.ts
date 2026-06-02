import axios from 'axios';

const API_BASE_URL = __API_BASE_URL__ || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Student {
  id: number;
  student_id: string;
  name: string;
  major: string;
  grade: number;
  math_level: number;
  programming_level: number;
  english_level: number;
  total_study_time: number;
  completed_courses: number;
}

export interface StudentProfile {
  id: number;
  student_id: number;
  logical_thinking: number;
  problem_solving: number;
  learning_speed: number;
  attention: number;
  creativity: number;
  math_level: number;
  programming_level: number;
  english_level: number;
  learning_style: string;
  cognitive_style: string;
  best_time: string;
  common_mistakes: string;
  weakness_areas: string;
  error_patterns: string;
  learning_motivation: string;
  difficulty_preference: string;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  total_study_time: number;
  completed_topics: string;
  mastery_level: string;
}

export interface ResourceType {
  value: string;
  label: string;
  description: string;
}

export interface GeneratedResource {
  course_document?: string;
  mind_map?: any;
  quiz_bank?: any[];
  ppt_content?: any[];
  video_script?: any[];
  code_case?: any;
  reading_material?: any[];
}

export interface LearningPlan {
  day: number;
  date: string;
  total_hours: number;
  topics: {
    topic: string;
    duration: number;
    resources: string[];
    learning_style: string;
  }[];
}

export interface EvaluationResult {
  student_id: number | string;
  student_name: string;
  evaluation_period?: string;
  overall_score: number;
  overall_level: string;
  dimensions: {
    investment: {
      total_time_minutes: number;
      daily_average_minutes: number;
      time_score: number;
      frequency_score: number;
      level: string;
    };
    mastery: {
      average_score: number;
      topic_count: number;
      excellent_topics: string[];
      weak_topics: string[];
      level: string;
    };
    efficiency: {
      efficiency_score: number;
      average_mastery: number;
      level: string;
    };
  };
  error_analysis?: any;
  ai_commentary: string;
  improvement_suggestions: string[];
  generated_at?: string;
}

export const studentApi = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: number) => api.get<Student>(`/students/${id}`),
  create: (data: Omit<Student, 'id'>) => api.post<Student>('/students', data),
  update: (id: number, data: Partial<Student>) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user: { id: number; username: string; role: string; student_id?: number | null };
    }>('/auth/login', data),
  register: (data: { username: string; password: string; role: 'admin' | 'teacher' | 'student'; student_id?: number }) =>
    api.post<{ id: number; username: string; role: string; student_id?: number | null; request_id?: string }>(
      '/auth/register',
      data
    ),
  me: () =>
    api.get<{
      user: { sub: number; username: string; role: string; student_id?: number | null };
      request_id: string;
    }>('/auth/me'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.patch<{ status: 'ok'; request_id: string }>('/auth/password', data),
};

export const profileApi = {
  generate: (studentId: number) => api.post<StudentProfile>(`/student-profiles/${studentId}/generate`),
  getById: (studentId: number) => api.get<StudentProfile>(`/student-profiles/${studentId}`),
  update: (studentId: number, data: Partial<StudentProfile>) => api.patch<StudentProfile>(`/student-profiles/${studentId}`, data),
  updateProgress: (studentId: number, topic: string, score: number) => 
    api.post(`/student-profiles/${studentId}/progress`, { topic, score }),
};

export const resourceApi = {
  generate: (data: { student_id: number; course_name: string; topic: string; resource_types: string[] }) => 
    api.post('/resource-generator/generate', data),
  generateAll: (student_id: number, course_name: string, topic: string) =>
    api.post('/resource-generator/generate-all', { student_id, course_name, topic }),
  getTypes: () => api.get<{ types: ResourceType[]; total: number }>('/resource-generator/resource-types'),
};

export const learningPathApi = {
  generate: (data: { student_id: number; course_name: string; topics: string[]; target_days: number }) =>
    api.post('/learning-path/generate', data),
  updateProgress: (data: { student_id: number; completed_topics: string[]; mastery_updates: Record<string, number> }) =>
    api.post('/learning-path/update-progress', data),
  getRecommendations: (student_id: number) => api.get(`/learning-path/recommendations/${student_id}`),
};

export const tutoringApi = {
  ask: (data: { student_id: number; question: string; topic?: string }) =>
    api.post('/smart-tutoring/ask', data),
  getTips: (student_id: number) => api.get(`/smart-tutoring/tips/${student_id}`),
};

export const evaluationApi = {
  assess: (student_id: number, period_days?: number) =>
    api.get<EvaluationResult>(`/evaluation/assess/${student_id}`, { params: { period_days } }),
  adjust: (student_id: number, evaluation_result: EvaluationResult) =>
    api.post(`/evaluation/adjust/${student_id}`, evaluation_result),
  getProgress: (student_id: number) => api.get(`/evaluation/progress/${student_id}`),
};

export const agentApi = {
  chat: (data: { student_id: number; role: string; question: string }) =>
    api.post('/agent/chat', data),
};

export const courseApi = {
  recommend: (student_id: number) => api.get(`/course-recommend/recommend/${student_id}`),
};

export default api;
