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

  it('conserva el placeholder base64 de la primera imagen', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 'post-1',
            title: 'Bicicleta',
            price: 180000,
            condition: 'USED',
            cityName: 'Santiago',
            userId: 'seller-1',
            createdAt: '2026-07-25T12:00:00.000Z',
            coverImage: {
              url: 'https://example.com/bicicleta.webp',
              placeholder: 'data:image/webp;base64,UklGRg==',
            },
          },
        ],
      },
    });

    const [post] = await getPosts();

    expect(post.coverImage).toEqual({
      url: 'https://example.com/bicicleta.webp',
      placeholder: 'data:image/webp;base64,UklGRg==',
    });
    expect(post.images).toEqual(['https://example.com/bicicleta.webp']);
  });
});
