import { z } from 'zod';

export const postSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),
  price: z.number({ invalid_type_error: 'El precio debe ser un número' })
    .int('El precio debe ser un número entero')
    .positive('El precio debe ser mayor a cero'),
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
  regionId: z.string().min(1, 'Debe seleccionar una región'),
  cityId: z.string().min(1, 'Debe seleccionar una comuna'),
  images: z.array(z.object({
    id: z.string().nullable().optional(),
    url: z.string().url('URL de imagen inválida'),
    sortOrder: z.number().optional(),
  }))
    .min(1, 'Debe subir al menos una imagen')
    .max(5, 'No puede subir más de 5 imágenes'),
  condition: z.enum(['Nuevo', 'Usado'], {
    errorMap: () => ({ message: 'Debe seleccionar si el artículo es nuevo o usado' }),
  })
});

export const filterSchema = z.object({
  search: z.string().optional(),
  regionId: z.string().optional(),
  comuna: z.string().optional(),
  radius: z.number().min(0).max(500).default(200).optional(),
  minPrice: z.union([z.string(), z.number()]).optional(),
  maxPrice: z.union([z.string(), z.number()]).optional(),
  condition: z.string().optional(),
  seller: z.union([z.string().uuid(), z.literal('')]).optional()
});
