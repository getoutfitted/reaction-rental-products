Meteor.methods({
  /**
   * rentalProducts/createInventoryVariant
   * @summary initalizes inventoryVariant
   * @param {String} productId - the variant/product _id that owns this inventoryVariant
   * @param {Object} [inventoryVariant] - inventoryVariant object
   * @return {String} new inventoryVariant _id
   */
  "rentalProducts/createInventoryVariant": function (productId, inventoryVariant = {}, qty = 1) {
    check(productId, String);
    check(inventoryVariant, Match.Optional(Object));
    check(qty, Match.Optional(Number));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    let inventoryVariantIds = [];
    let barcode = inventoryVariant.barcode;
    const baseBarcode = inventoryVariant.barcode;

    _(qty).times(function (i) {
      const inventoryVariantId = Random.id();

      if (barcode && qty > 1) {
        barcode = baseBarcode + "-" + i;
      }

      const assembledInventoryVariant = Object.assign(inventoryVariant || {}, {
        _id: inventoryVariantId,
        productId: productId,
        barcode: barcode
      });

      ReactionCore.Collections.InventoryVariants.insert(assembledInventoryVariant,
        (error, result) => {
          if (result) {
            ReactionCore.Log.info(
              `rentalProducts/createInventoryVariant: created inventoryVariant: ${
                inventoryVariantId} for ${productId}`
            );
          }
          if (error) {
            ReactionCore.Log.error(`rentalProducts/createInventoryVariant error
              while creating inventory variant: ${inventoryVariantId} for ${productId}`, error);
          }
        }
      );
      inventoryVariantIds.push(inventoryVariantId); // Questionable to keep this out of the callback, but otherwise
    });                                 // return would also need to be in callback.
    return inventoryVariantIds;
  },

  /**
   * rentalProducts/updateInventoryVariantField
   * @summary updates single inventoryVariant field
   * @param {String} inventoryVariantId - _id of inventoryVariant we are updating
   * @param {String} field - key to update
   * @param {*} value - update property value
   * @return {Number} returns update result
   */
  "rentalProducts/updateInventoryVariantField": function (inventoryVariantId, field, value) {
    check(inventoryVariantId, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let stringValue = EJSON.stringify(value);
    let update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    // we need to use sync mode here, to return correct error and result to UI
    const result = ReactionCore.Collections.InventoryVariants.update(inventoryVariantId, {
      $set: update
    });
    return result;
  },

  /**
   * rentalProducts/deleteInventoryVariant
   * @summary delete one or more inventoryVariants
   * @param {String|Array} inventoryVariantId - productId to delete
   * @returns {Number} returns number of removed products
   */
  "rentalProducts/deleteInventoryVariant": function (inventoryVariantId) {
    check(inventoryVariantId, Match.OneOf(Array, String));
    // must have admin permission to delete
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let inventoryVariantIds;

    if (!Array.isArray(inventoryVariantId)) {
      inventoryVariantIds = [inventoryVariantId];
    } else {
      inventoryVariantIds = inventoryVariantId;
    }

    const numRemoved = ReactionCore.Collections.InventoryVariants.remove({
      _id: {
        $in: inventoryVariantIds
      }
    });

    if (numRemoved > 0) {
      return numRemoved;
    }
    throw new Meteor.Error(304, "Something went wrong, no inventoryVariants were deleted!");
  },

  "rentalProducts/reserveInventoryVariantForDates": function (inventoryVariantId, reservationRequest) {
    check(inventoryVariantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let inventoryVariant = ReactionCore.Collections.InventoryVariants.findOne(inventoryVariantId);
    let requestedDates = [];
    let iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate("days");
    while (iter.hasNext()) { requestedDates.push(iter.next().toDate()); }

    if (inventoryVariant
      && RentalProducts.checkAvailability(inventoryVariant.unavailableDates, requestedDates)) {
      let reservedDates = InventoryVariants.findOne({
        _id: inventoryVariant._id
      }, {fields: {unavailableDates: 1}}).unavailableDates;

      // We take the time to insert unavailable dates in ascending date order
      // find the position that we should insert the reserved dates
      positionToInsert = _.sortedIndex(reservedDates, requestedDates[0]);

      // insert datesToReserve into the correct variants at the correct position
      return InventoryVariants.update({_id: inventoryVariant._id}, {
        $inc: {
          numberOfDatesBooked: requestedDates.length
        },
        $push: {
          unavailableDates: {
            $each: requestedDates,
            $position: positionToInsert
          }
        }
      });
    } else if (inventoryVariant) {
      throw new Meteor.Error(409, `Could not insert reservation ${reservationRequest} `
        + `for Inventory Variant: ${inventoryVariantId} - There is a conflict with an existing reservation.`);
    }
    throw new Meteor.Error(404, `Could not insert reservation ${reservationRequest} `
      + `for Inventory Variant: ${inventoryVariantId} - Inventory Variant not found!`);
  },
  /**
   * rentalProducts/registerInventory
   * @summary check a product and update Inventory collection with inventory documents.
   * @param {Object} product - valid ReactionCore.Schemas.Product object
   * @return {Number} - returns the total amount of new inventory created
   */
  "rentalProducts/registerInventory": function (product) {
    let type;
    switch (product.type) {
    case "variant":
      check(product, ReactionCore.Schemas.ProductVariant);
      type = "variant";
      break;
    default:
      check(product, ReactionCore.Schemas.Product);
      type = "simple";
    }
    // user needs createProduct permission to register new inventory
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // this.unblock();

    let totalNewInventory = 0;
    const productId = type === "variant" ? product.ancestors[0] : product._id;
    const variants = ReactionCore.getVariants(productId);

    // we'll check each variant to see if it has been fully registered
    for (let variant of variants) {
      let inventoryVariants = ReactionCore.Collections.InventoryVariants.find({
        productId: variant._id
      });
      // we'll return this as well
      let inventoryVariantCount = inventoryVariants.count();
      // if the variant exists already we remove it from the inventoryVariants
      // so that we don't process it as an insert
      if (inventoryVariantCount < variant.inventoryQuantity) {
        let newQty = variant.inventoryQuantity || 0;
        let i = inventoryVariantCount + 1;

        ReactionCore.Log.info(
          `inserting ${newQty - inventoryVariantCount
          } new inventory variants ${variant._id}`
        );

        const bulk = ReactionCore.Collections.InventoryVariants._collection.rawCollection().initializeUnorderedBulkOp();
        while (i <= newQty) {
          let id = ReactionCore.Collections.InventoryVariants._makeNewID();
          let sku = variant.sku || "";
          bulk.insert({
            _id: id,
            productId: variant._id,
            shopId: product.shopId,
            createdAt: new Date,
            updatedAt: new Date,
            unavailableDates: [],
            unavailableDetails: [],
            events: [],
            active: true,
            sku: sku,
            barcode: sku + "_" + i,
            workflow: { // we add this line because `batchInsert` doesn't know
              status: "active" // about SimpleSchema, so `defaultValue` will not
            }
          });
          i++;
        }

        // took from: http://guide.meteor.com/collections.html#bulk-data-changes
        let execute = Meteor.wrapAsync(bulk.execute, bulk);
        let inventoryItem = execute();
        let inserted = inventoryItem.nInserted;

        if (!inserted) { // or maybe `inventory.length === 0`?
          // throw new Meteor.Error("Inventory Anomaly Detected. Abort! Abort!");
          return totalNewInventory;
        }
        ReactionCore.Log.debug(`registered ${inserted}`);
        totalNewInventory += inserted;
      }
    }
    // returns the total amount of new inventory created
    return totalNewInventory;
  }
});
