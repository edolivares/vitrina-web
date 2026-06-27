import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string().optional(),
  chatId: z.string().uuid(),
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje es demasiado largo'),
  sender: z.string().uuid(),
  createdAt: z.string()
});

export const chatSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  postTitle: z.string(),
  postPrice: z.number(),
  postImage: z.string(),
  seller: z.string().uuid(),
  sellerName: z.string(),
  buyer: z.string().uuid(),
  buyerName: z.string(),
  lastMessage: z.string().optional(),
  updatedAt: z.string()
});
