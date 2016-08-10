import { RentalProducts as commonRentalProducts } from '../lib/api';

export const RentalProducts = commonRentalProducts;

RentalProducts.server = {};

RentalProducts.server.permissions = [
  "admin",
  "owner",
  "dashboard/rental-products",
  "reaction-rental-products"
];
