Meteor.publish("rentalProducts", function () {
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Products.find({functionalType: "rental"});
  }
  return this.ready();
});
