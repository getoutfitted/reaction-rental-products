function adjustLocalToDenverTime(time) {
  let here = moment(time);
  let denver = here.clone().tz("America/Denver");
  denver.add(here.utcOffset() - denver.utcOffset(), "minutes");
  return denver.toDate();
}

/**
 *  RentalProduct Methods
 */

/**
 * checkAvailability
 * @description Basic binary search to see if requested dates are available for a given inventory item
 * @param {[Date]} reservedDates - Array of dates that have been reserved for a particular item
 * @param {[Date]} requestedDates - Array of dates that have been requested for reservation
 * @return {Boolean} - availability of item
 */

Meteor.methods({
  /*
   * Push an event to a specific variant
   * only need to supply updated information
   * returns array of available (inventory) variant ids
   */
  "rentalProducts/checkInventoryAvailability": function (variantId, reservationRequest, quantity = 1, searchLeastBookedFirst = true) {
    check(variantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    check(quantity, Number);
    check(searchLeastBookedFirst, Match.Optional(Boolean));

    let InventoryVariants = ReactionCore.Collections.InventoryVariants;

    let requestedVariants = [];
    let requestedDates = [];
    let sortDirection = searchLeastBookedFirst ? 1 : -1;

    let iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate("days");

    while (iter.hasNext()) {
      requestedDates.push(adjustLocalToDenverTime(iter.next()));
    }

    // Sort by length of inventory variants unavailableDates array
    let inventoryVariants = InventoryVariants.find(
      {
        productId: variantId,
        active: true
      }, {sort: {
        numberOfDatesBooked: sortDirection
      }}
    ).fetch();

    if (inventoryVariants.length > 0) {
      // if this variant has multiple inventory
      for (let uid of inventoryVariants) {
        // Check to see if any of the dates requested are unavailable
        // if so, this item is unavailable for requested time period
        if (RentalProducts.checkAvailability(uid.unavailableDates, requestedDates)) {
          requestedVariants.push(uid._id);
          if (requestedVariants.length >= quantity) {
            break;
          }
        }
      }
    // TODO: Update single inventory existing on variant for future
    } else if (RentalProducts.checkAvailability(variant.unavailableDates, requestedDates)) {
      // else if there is only one of this variant
      requestedVariants.push(variant._id);
    }
    // return requested variants array  (an array consisting of available variantIds)
    return requestedVariants;
  },

  /*
   * TODO: Move inventory event creation to AdvancedFulfillment
   * 	Push an event to a specific inventoryVariant
   *  params:
   *   inventoryVariantId - the id of the variant to which we are adding a product event
   *   eventDoc - An object containing the information for the event
   */
  "rentalProducts/createInventoryEvent": function (inventoryVariantId, eventDoc) {
    check(inventoryVariantId, String);

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

    if (!ReactionCore.hasPermission("createProductEvent")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    _.defaults(eventDoc, {
      _id: Random.id(),
      createdAt: new Date()
    });

    InventoryVariants = ReactionCore.Collections.InventoryVariants;

    const inventoryVariant = InventoryVariants.findOne({
      _id: inventoryVariantId
    });

    if (inventoryVariant) {
      return InventoryVariants.update(
        {_id: inventoryVariantId },
        { $push: { events: eventDoc } }, { validate: false });
    }

    throw new Meteor.Error(400, "Variant " + inventoryVariantId + " not found");
  },

//
//  DEPRECATED METHODS
//
//
//
//
//
//
  /**
   * rentalProducts/setProductTypeToRental
   * @param   {String} productId - Product Id to update
   * @returns {undefined} - on the client
   */

  "rentalProducts/setProductType": function (productId, productType) {
    check(productId, String);
    check(productType, String);
    // user needs create product permission to change type.
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const product = ReactionCore.Collections.Products.findOne(productId);
    // if product type is rental, setup variants.
    if (productType === "rental") {
      let variants = ReactionCore.Collections.Products.find({
        ancestors: { $in: [productId] },
        type: "variant"
      }).fetch();

      _.each(variants, function (variant) {
        let childVariants = ReactionCore.Collections.Products.find({
          ancestors: { $in: [variant._id] },
          type: "variant"
        }).fetch();
        // Set type to rental variant;
        variant.type = "rentalVariant";

        // XXX: This is sketchy and needs to change to a schema validation, but the validation is complicated
        if (!variant.price || variant.price === 0) {
          variant.price = 0.01;
        }
        _.defaults(variant, {pricePerDay: variant.price});
        if (variant.pricePerDay === 0) {
          variant.pricePerDay = variant.price;
        }

        // If this variant is a parent, no inventory children. Only inventory children childmost variants
        if (childVariants.length === 0) {
          let existingInventoryVariantQty = ReactionCore.Collections.InventoryVariants.find({productId: variant._id}).count();
          let count = variant.inventoryQuantity - existingInventoryVariantQty;
          if (count > 0) {
            _(variant.inventoryQuantity - existingInventoryVariantQty).times(function (n) {
              let inventoryVariant = {};
              inventoryVariant.productId = variant._id;
              inventoryVariant.barcode = variant.sku + "-" + (n + existingInventoryVariantQty); // GetOutfitted.helpers.paddedNumber(n + count);
              inventoryVariant.sku = variant.sku;
              inventoryVariant.color = variant.color;
              inventoryVariant.size = variant.size;

              ReactionCore.Collections.InventoryVariants.insert(inventoryVariant);
            });
          }
        }
        ReactionCore.Collections.Products.update({_id: variant._id}, {$set: variant});
        ReactionCore.Collections.Products.findOne({_id: variant._id});
      });
      return ReactionCore.Collections.Products.update({_id: productId}, {$set: {type: "rental"}});
    }
    let variants = ReactionCore.Collections.Products.find({
      ancestors: { $in: [productId] }
    }).fetch();
    _.each(variants, function (variant) {
      ReactionCore.Collections.Products.update({_id: variant._id}, {$set: {type: "variant"}});
    });
    return ReactionCore.Collections.Products.update({_id: productId}, {$set: {type: "simple"}});
  }
});
