import API from './api';

export interface DepartmentStats {
  totalStudents: number;
  totalFaculty: number;
  totalProjects: number;
}

export const getDepartmentStats = async (): Promise<DepartmentStats> => {
  const response = await API.get('/department/stats');
  return response.data;
};