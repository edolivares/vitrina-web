import { useState, useEffect, useCallback } from 'react';
import { getRegions, getCitiesByRegion } from '@/api/locations';

/**
 * Hook personalizado para manejar la consulta y selección geográfica (Regiones y Comunas en cascada).
 * Carga las regiones al montarse y actualiza las comunas al seleccionar o proveer una región.
 * 
 * @param {string|number} [initialRegionId=''] - ID de región inicial.
 * @returns {Object} Estados geográficos y funciones de consulta:
 * @returns {Array<Object>} regions - Listado de regiones disponibles.
 * @returns {Array<Object>} cities - Listado de comunas de la región seleccionada.
 * @returns {boolean} loadingRegions - Estado de carga de las regiones.
 * @returns {boolean} loadingCities - Estado de carga de las comunas.
 * @returns {Error|null} error - Objeto de error si la petición falló.
 * @returns {Function} fetchCities - Función para forzar la carga manual de comunas de una región.
 * @returns {Function} fetchRegions - Función para volver a consultar las regiones.
 */
export function useLocations(initialRegionId = '') {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todas las regiones de Chile desde la API.
   * 
   * @type {Function}
   */
  const fetchRegions = useCallback(async () => {
    setLoadingRegions(true);
    setError(null);
    try {
      const data = await getRegions();
      setRegions(data);
    } catch (err) {
      console.error('Error cargando regiones:', err);
      setError(err);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  /**
   * Carga todas las comunas asociadas a una región específica.
   * 
   * @type {Function}
   * @param {string|number} regionId - ID de la región.
   */
  const fetchCities = useCallback(async (regionId) => {
    if (!regionId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    setError(null);
    try {
      const data = await getCitiesByRegion(regionId);
      setCities(data);
    } catch (err) {
      console.error('Error cargando comunas:', err);
      setError(err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (initialRegionId) {
      fetchCities(initialRegionId);
    } else {
      setCities([]);
    }
  }, [initialRegionId, fetchCities]);

  return {
    regions,
    cities,
    loadingRegions,
    loadingCities,
    error,
    fetchCities,
    fetchRegions,
  };
}
