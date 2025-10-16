import { z } from 'zod';

export const createAdSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif'),
  categoryId: z.number().int('ID de catégorie invalide'),
});

export const extendAdSchema = z.object({
  adId: z.number().int('ID d\'annonce invalide'),
});