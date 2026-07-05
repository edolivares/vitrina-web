import apiClient from './apiClient';

/**
 * Obtiene la lista completa de todas las regiones de Chile registradas en la base de datos.
 * 
 * @returns {Promise<Array<Object>>} Listado de objetos región con su ID y nombres.
 */
export async function getRegions() {
  const response = await apiClient.get('/api/locations/regions');
  return response.data.data;
}

/**
 * Obtiene la lista de comunas/ciudades asociadas a una región específica de Chile.
 * 
 * @param {string|number} regionId - Identificador único de la región.
 * @returns {Promise<Array<Object>>} Listado de comunas de la región.
 */
export async function getCitiesByRegion(regionId) {
  const response = await apiClient.get(`/api/locations/regions/${regionId}/cities`);
  return response.data.data;
}
