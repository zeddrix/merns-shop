import { z } from 'zod';

export const shippingAddressSchema = z.object({
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  country: z.string().trim().min(1, 'Country is required')
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
