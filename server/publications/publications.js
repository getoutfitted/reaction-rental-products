import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Reaction, Logger } from '/server/api';
import { Products } from '/lib/collections';
import RentalProducts from '../api';
import { InventoryVariants } from '../../lib/collections';


Meteor.publish("rentalProducts", function () {
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, Reaction.getShopId())) {
    return Products.find({
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
    Logger.info("ignoring null request on ParentProduct subscription");
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, Reaction.getShopId())) {
    const product = Products.findOne(productId);
    return Products.find(product.ancestors[0]);
  }
  Logger.warn("ParentProduct subscription requested by unauthorized user");
  return this.ready();
});

Meteor.publish("inventoryVariantsById", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    Logger.info("ignoring null request on inventoryVariantsById subscription");
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, RentalProducts.server.permissions, Reaction.getShopId())) {
    return InventoryVariants.find({
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
    Logger.info("ignoring null request on productReservationStatus subscription");
    return this.ready();
  }
  return InventoryVariants.find({
    productId: productId,
    active: true,
    "workflow.status": "active"
  }, {
    fields: {productId: 1, unavailableDates: 1, numberOfDatesBooked: 1, active: 1, "workflow.status": 1},
    sort: {unavailableDates: -1}
  });
});
