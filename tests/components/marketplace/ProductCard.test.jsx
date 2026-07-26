import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from '@/components/marketplace/ProductCard';

vi.mock('react-lazy-load-image-component', () => ({
  LazyLoadImage: ({ src, placeholderSrc, alt }) => (
    <img src={src} data-placeholder-src={placeholderSrc} alt={alt} />
  ),
}));

describe('ProductCard - carga diferida de la portada', () => {
  it('usa el base64 de la primera imagen como placeholder', () => {
    render(
      <MemoryRouter>
        <ProductCard
          post={{
            id: 'post-1',
            title: 'Bicicleta',
            price: 180000,
            condition: 'Usado',
            comuna: 'Santiago',
            relativeTime: 'hoy',
            images: ['https://example.com/bicicleta.webp'],
            coverImage: {
              url: 'https://example.com/bicicleta.webp',
              placeholder: 'data:image/webp;base64,UklGRg==',
            },
          }}
          formatPrice={(price) => `$${price}`}
        />
      </MemoryRouter>
    );

    const image = screen.getByRole('img', { name: 'Bicicleta' });
    expect(image).toHaveAttribute('src', 'https://example.com/bicicleta.webp');
    expect(image).toHaveAttribute(
      'data-placeholder-src',
      'data:image/webp;base64,UklGRg=='
    );
  });
});
