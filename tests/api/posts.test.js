import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from '@/api/apiClient';
import { getPosts } from '@/api/posts';

describe('getPosts - filtros geográficos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockResolvedValue({
      data: {
        data: [],
      },
    });
  });

  it('envía una comuna de origen separada de la región seleccionada', async () => {
    await getPosts({
      regionId: '13',
      originCityId: '13101',
      radius: 50,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/posts?regionId=13&originCityId=13101&radius=50'
    );
  });

  it('envía las coordenadas GPS junto con el radio', async () => {
    await getPosts({
      radius: 10,
      lat: -33.4489,
      lng: -70.6693,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/posts?radius=10&lat=-33.4489&lng=-70.6693'
    );
  });
});
