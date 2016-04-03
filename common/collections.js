ReactionCore.Collections.InventoryVariants = InventoryVariants = this.InventoryVariants = new Mongo.Collection("InventoryVariants");

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.RentalCart);

ReactionCore.Collections.Orders.attachSchema([ReactionCore.Schemas.RentalCart, ReactionCore.Schemas.RentalOrder]);

ReactionCore.Collections.Shops.attachSchema(ReactionCore.Schemas.RentalShop);

ReactionCore.Collections.InventoryVariants.attachSchema(ReactionCore.Schemas.InventoryVariants);

ReactionCore.Schemas.Shop = ReactionCore.Schemas.RentalShop;

// ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.RentalProduct,
//   { selector: { type: "rental"}});
//
// ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.RentalProductVariant,
//     { selector: { type: "rentalVariant"}});
