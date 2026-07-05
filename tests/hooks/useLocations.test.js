import { renderHook, act } from '@testing-library/react';
import { useLocations } from '@/hooks/useLocations';
import { getRegions, getCitiesByRegion } from '@/api/locations';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/api/locations', () => ({
  getRegions: vi.fn(),
  getCitiesByRegion: vi.fn(),
}));

describe('useLocations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch regions on mount', async () => {
    const mockRegions = [{ id: 1, name: 'Metropolitana' }];
    getRegions.mockResolvedValueOnce(mockRegions);

    const { result } = renderHook(() => useLocations());

    await act(async () => {
      await Promise.resolve();
    });

    expect(getRegions).toHaveBeenCalledTimes(1);
    expect(result.current.regions).toEqual(mockRegions);
    expect(result.current.loadingRegions).toBe(false);
  });

  it('should fetch cities if initialRegionId is provided', async () => {
    getRegions.mockResolvedValueOnce([]);
    const mockCities = [{ id: 10, name: 'Santiago' }];
    getCitiesByRegion.mockResolvedValueOnce(mockCities);

    const { result } = renderHook(() => useLocations('1'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(getCitiesByRegion).toHaveBeenCalledWith('1');
    expect(result.current.cities).toEqual(mockCities);
  });

  it('should fetch cities when fetchCities is called manually', async () => {
    getRegions.mockResolvedValueOnce([]);
    const mockCities = [{ id: 20, name: 'Las Condes' }];
    getCitiesByRegion.mockResolvedValueOnce(mockCities);

    const { result } = renderHook(() => useLocations());

    await act(async () => {
      await result.current.fetchCities('2');
    });

    expect(getCitiesByRegion).toHaveBeenCalledWith('2');
    expect(result.current.cities).toEqual(mockCities);
  });
});
