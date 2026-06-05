import { z } from 'zod';
export {
  loginUserSchema,
  registerUserSchema,
  type LoginUserInput,
  type RegisterUserInput
} from '../../shared/validators/auth.js';

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

export const productVariantSchema = z.object({
  sku: z.string().trim().min(1),
  label: z.string().trim().min(1),
  storageGb: z.coerce.number().positive().optional(),
  screenInches: z.coerce.number().positive().optional(),
  ramGb: z.coerce.number().positive().optional(),
  listPrice: z.coerce.number().positive(),
  price: z.coerce.number().nonnegative(),
  countInStock: z.coerce.number().int().nonnegative(),
  image: z.string().min(1).optional()
});

export const orderItemSchema = z.object({
  name: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  image: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  product: z.string().min(1),
  variantSku: z.string().min(1),
  variantLabel: z.string().min(1)
});

export const createOrderItemInputSchema = z.object({
  product: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  variantSku: z.string().min(1)
});

export const createOrderSchema = z.object({
  orderItems: z.array(createOrderItemInputSchema).min(1, 'Order must include at least one item'),
  shippingAddress: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1)
  }),
  paymentMethod: z.string().min(1),
  itemsPrice: z.coerce.number().nonnegative().optional(),
  taxPrice: z.coerce.number().nonnegative().optional(),
  shippingPrice: z.coerce.number().nonnegative().optional(),
  totalPrice: z.coerce.number().nonnegative().optional()
});

export const payOrderSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  update_time: z.string().min(1),
  payer: z.object({
    email_address: z.string().email()
  })
});

export const updateUserAdminSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  isAdmin: z.boolean().optional()
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1),
    image: z.string().min(1),
    brand: z.string().trim().min(1),
    category: z.string().trim().min(1),
    subcategory: z.string().trim().min(1),
    modelKey: z.string().trim().min(1),
    releaseYear: z.coerce.number().int().min(2015).max(2030),
    condition: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1),
    variants: z.array(productVariantSchema).min(1, 'At least one variant is required')
  })
  .refine(
    (data) => {
      const skus = data.variants.map((v) => v.sku);
      return new Set(skus).size === skus.length;
    },
    { message: 'Variant SKUs must be unique', path: ['variants'] }
  )
  .refine((data) => data.variants.every((v) => v.price < v.listPrice), {
    message: 'Sale price must be less than list price',
    path: ['variants']
  });

export type ProductReviewInput = z.infer<typeof productReviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PayOrderInput = z.infer<typeof payOrderSchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
