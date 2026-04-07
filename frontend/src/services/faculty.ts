import API from './api';

export const getFaculty = async () => {
  const response = await API.get('/auth/dropdown?role=FACULTY'); // assuming this endpoint exists
  return response.data;
};