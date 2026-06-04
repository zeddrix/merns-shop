import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginUserSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().optional()
  })
  .refine((data) => !data.password || data.password.length >= 6, {
    message: 'Password must be at least 6 characters',
    path: ['password']
  });

export const productReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().min(1, 'Comment is required')
});

export const orderItemSchema = z.object({
  name: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  image: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  product: z.string().min(1)
});

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, 'Order must include at least one item'),
  shippingAddress: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1)
  }),
  paymentMethod: z.string().min(1),
  itemsPrice: z.coerce.number().nonnegative(),
  taxPrice: z.coerce.number().nonnegative(),
  shippingPrice: z.coerce.number().nonnegative(),
  totalPrice: z.coerce.number().nonnegative()
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ProductReviewInput = z.infer<typeof productReviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
