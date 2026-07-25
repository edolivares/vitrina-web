import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '@/components/layout/Sidebar';

vi.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: null }),
}));

vi.mock('@/hooks/useLocations', () => ({
  useLocations: () => ({
    regions: [{ id: 13, name: 'Región Metropolitana', shortName: 'Metropolitana' }],
    cities: [{ id: 13101, name: 'Santiago' }],
    loadingRegions: false,
    loadingCities: false,
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderSidebar(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Sidebar />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe('Sidebar - origen del filtro geográfico', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn(),
      },
    });
  });

  it('no muestra un radio activo cuando está seleccionado Todo Chile', () => {
    renderSidebar('/');

    expect(screen.queryByText('Radio de búsqueda')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Usar mi ubicación' })
    ).toBeInTheDocument();
  });

  it('muestra el radio con una comuna de origen explícita', () => {
    renderSidebar(
      '/?regionId=13&cityId=13101&comuna=Santiago&originCityId=13101&radius=50'
    );

    expect(screen.getByText('Radio de búsqueda')).toBeInTheDocument();
    expect(screen.getByText('Desde Santiago')).toBeInTheDocument();
  });

  it('solicita permiso GPS solo al pulsar Usar mi ubicación', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
        },
      });
    });

    renderSidebar('/');

    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    await waitFor(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        'locationMode=gps'
      );
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        'lat=-33.4489'
      );
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        'lng=-70.6693'
      );
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        'radius=200'
      );
    });
  });

  it('mantiene Todo Chile cuando el usuario rechaza el permiso GPS', async () => {
    navigator.geolocation.getCurrentPosition.mockImplementation(
      (_success, error) => {
        error({ code: 1 });
      }
    );

    renderSidebar('/');

    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(
      await screen.findByText(
        'Necesitamos tu permiso para buscar publicaciones cerca de ti.'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('location-search')).not.toHaveTextContent('lat=');
    expect(screen.queryByText('Radio de búsqueda')).not.toBeInTheDocument();
  });
});
