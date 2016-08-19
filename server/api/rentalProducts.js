import RentalProducts from '../../lib/api';


RentalProducts.server = {};

RentalProducts.server.permissions = [
  "admin",
  "owner",
  "dashboard/rental-products",
  "reaction-rental-products"
];

export default RentalProducts;
