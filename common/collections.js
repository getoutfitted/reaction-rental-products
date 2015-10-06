ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.RentalProduct);

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.RentalCart);

ReactionCore.Collections.Orders.attachSchema([ReactionCore.Schemas.RentalCart, ReactionCore.Schemas.RentalOrder]);
