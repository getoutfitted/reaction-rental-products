import { Mongo } from 'meteor/mongo';
import * as Schemas from './schemas';
import { Orders, Cart, Shops, Products } from '/lib/collections';

export const InventoryVariants = new Mongo.Collection("InventoryVariants");
Cart.attachSchema(Schemas.RentalCart);
Orders.attachSchema([Schemas.RentalCart, Schemas.RentalOrder]);
// Shops.attachSchema(ReactionCore.Schemas.RentalShop);
Products.attachSchema(Schemas.RentalProduct,
  { selector: { type: "simple" } });
Products.attachSchema(Schemas.RentalProductVariant,
  { selector: { type: "variant" } });
InventoryVariants.attachSchema(Schemas.InventoryVariants);

// ReactionCore.Schemas.Shop = ReactionCore.Schemas.RentalShop;
