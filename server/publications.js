Meteor.publish("rentalProducts", function () {
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Products.find({
      functionalType: {$in: ["rentalVariant", "rental"]}
    }, {
      sort: {"ancestors.0": 1, "color": 1, "numberSize": -1}
    });
  }
  return this.ready();
});

Meteor.publish("ParentProduct", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on ParentProduct subscription");
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, ReactionCore.getShopId())) {
    const product = ReactionCore.Collections.Products.findOne(productId);
    return ReactionCore.Collections.Products.find(product.ancestors[0]);
  }
  ReactionCore.Log.warn("ParentProduct subscription requested by unauthorized user");
  return this.ready();
});

Meteor.publish("inventoryVariantsById", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on inventoryVariantsById subscription");
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.InventoryVariants.find({
      productId: productId
    }, {
      sort: {barcode: -1}
    });
  }
  return this.ready();
});

Meteor.publish("productReservationStatus", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on productReservationStatus subscription");
    return this.ready();
  }
  return ReactionCore.Collections.InventoryVariants.find({
    productId: productId,
    active: true,
    "workflow.status": "active"
  }, {
    fields: {productId: 1, unavailableDates: 1, numberOfDatesBooked: 1, active: 1, "workflow.status": 1},
    sort: {unavailableDates: -1}
  });
});
