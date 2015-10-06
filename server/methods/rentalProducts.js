function checkAvailability(reservedDates, requestedDates) {
  for (let date of requestedDates) {
    let min = 0;
    let max = reservedDates.length - 1;

    while (min <= max) {
      let guess = Math.floor((min + max) / 2);

      if (+reservedDates[guess] === +date) {
        return false;
      }
      // Else
      if (+reservedDates[guess] < +date) {
        min = guess + 1;
      } else {
        max = guess - 1;
      }
    }
  }
  return true;
}

Meteor.methods({
  /*
   * Push an event to a specific variant
   * params:
   *   variantId - the id of the variant to which we are adding a product event
   *   eventDoc - An object containing the information for the event
   */
  createProductEvent: function(variantId, eventDoc) {
    var Products, product;
    check(variantId, String);
    check(eventDoc, {
      title: String,
      location: Match.Optional({
        address1: Match.Optional(String),
        address2: Match.Optional(String),
        city: Match.Optional(String),
        region: Match.Optional(String),
        postal: Match.Optional(String),
        country: Match.Optional(String),
        coords: Match.Optional({
          x: Number,
          y: Number
        }),
        metafields: Match.Optional(Object)
      }),
      description: Match.Optional(String)
    });
    if (!ReactionCore.hasPermission('createProductEvent')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    _.defaults(eventDoc, {
      _id: Random.id(),
      createdAt: new Date()
    });
    Products = ReactionCore.Collections.Products;
    product = Products.findOne({
      "variants._id": variantId
    });
    if (product != null ? product.variants : void 0) {
      return Products.update({
        "_id": product._id,
        "variants._id": variantId
      }, {
        $push: {
          "variants.$.events": eventDoc
        }
      }, {
        validate: false
      });
    } else {
      throw new Meteor.Error(400, "Variant " + variantId + " not found");
    }
  },

  /*
   * Push an event to a specific variant
   * only need to supply updated information
  #
   * returns array of available (inventory) variant ids
   */
  checkInventoryAvailability: function(productId, variantId, reservationRequest, quantity) {
    var i, inventoryVariants, item, iter, len, message, product, requestedDates, requestedVariants, variant;
    check(productId, String);
    check(variantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    check(quantity, Match.Optional(Number));
    quantity = quantity || 1;
    requestedVariants = [];
    requestedDates = [];
    message = '';
    iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate('days');
    while (iter.hasNext()) {
      requestedDates.push(iter.next().toDate());
    }
    product = Products.findOne(productId);
    variant = _.findWhere(product.variants, {
      _id: variantId
    });
    inventoryVariants = _.where(product.variants, {
      parentId: variantId
    });
    if (inventoryVariants.length > 0) {
      for (i = 0, len = inventoryVariants.length; i < len; i++) {
        item = inventoryVariants[i];
        if (checkAvailability(item.unavailableDates, requestedDates)) {
          requestedVariants.push(item._id);
          if (requestedVariants.length >= quantity) {
            break;
          }
        }
      }
    } else {
      if (checkAvailability(variant.unavailableDates, requestedDates)) {
        requestedVariants.push(variant._id);
      }
    }
    return requestedVariants;
  }
});
