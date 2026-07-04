import apiClient from './apiClient';

export async function getRegions() {
  const response = await apiClient.get('/api/locations/regions');
  return response.data.data;
}

export async function getCitiesByRegion(regionId) {
  const response = await apiClient.get(`/api/locations/regions/${regionId}/cities`);
  return response.data.data;
}
