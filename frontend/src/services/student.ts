import API from "./api";

export const getStudentsByBatch = async (batch: string) => {
  const response = await API.get('/students', { params: { batch } });
  return response.data;
};