import { Mongo } from 'meteor/mongo';
import * as Schemas from './schemas';
import { Orders, Cart, Shops } from '/lib/collections';

export const InventoryVariants = new Mongo.Collection("InventoryVariants");
Cart.attachSchema(Schemas.RentalCart);
Orders.attachSchema([Schemas.RentalCart, Schemas.RentalOrder]);
// Shops.attachSchema(ReactionCore.Schemas.RentalShop);
InventoryVariants.attachSchema(Schemas.InventoryVariants);

// ReactionCore.Schemas.Shop = ReactionCore.Schemas.RentalShop;
