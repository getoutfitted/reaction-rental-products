Meteor.methods({
  /**
   * rentalProducts/createInventoryVariant
   * @summary initalizes inventoryVariant
   * @param {String} productId - the variant/product _id that owns this inventoryVariant
   * @param {Object} [inventoryVariant] - inventoryVariant object
   * @return {String} new inventoryVariant _id
   */
  "rentalProducts/createInventoryVariant": function (productId, inventoryVariant) {
    check(parentId, String);
    check(inventoryVariant, Match.Optional(Object));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const inventoryVariantId = Random.id();

    const assembledInventoryVariant = Object.assign(inventoryVariant || {}, {
      _id: inventoryVariantId,
      productId: productId
    });

    ReactionCore.Collections.InventoryVariants.insert(assembledInventoryVariant,
      (error, result) => {
        if (result) {
          ReactionCore.Log.info(
            `rentalProducts/createInventoryVariant: created inventoryVariant: ${
              inventoryVariantId} for ${productId}`
          );
        }
      }
    );

    return inventoryVariantId;
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
    const result = ReactionCore.Collections.Products.update(inventoryVariantId, {
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

    if (!Array.isArray(inventoryVariant)) {
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
  }
});
