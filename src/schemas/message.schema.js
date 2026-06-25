import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string().optional(),
  chatId: z.string(),
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje es demasiado largo'),
  senderId: z.string(),
  createdAt: z.string()
});

export const chatSchema = z.object({
  id: z.string(),
  postId: z.number(),
  postTitle: z.string(),
  postPrice: z.number(),
  postImage: z.string(),
  sellerId: z.string(),
  sellerName: z.string(),
  buyerId: z.string(),
  buyerName: z.string(),
  lastMessage: z.string().optional(),
  updatedAt: z.string()
});
