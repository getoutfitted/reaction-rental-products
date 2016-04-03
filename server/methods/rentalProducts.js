/**
 * Reaction Product Methods
 */
/* eslint new-cap: 0 */
/* eslint no-loop-func: 0 */
/* eslint quotes: 0 */

/**
 * @array toDenormalize
 * @summary contains a list of fields, which should be denormalized
 * @type {string[]}
 */
const toDenormalize = [
  "price",
  "inventoryQuantity",
  "lowInventoryWarningThreshold",
  "inventoryPolicy",
  "inventoryManagement"
];

/**
 * @function createTitle
 * @description Recursive method which trying to find a new `title`, given the
 * existing copies
 * @param {String} newTitle - product `title`
 * @param {String} productId - current product `_id`
 * @return {String} title - modified `title`
 */
function createTitle(newTitle, productId) {
  // exception product._id needed for cases then double triggering happens
  let title = newTitle || "";
  let titleCount = ReactionCore.Collections.Products.find({
    title: title,
    _id: {
      $nin: [productId]
    }
  }).count();
  // current product "copy" number
  let titleNumberSuffix = 0;
  // product handle prefix
  let titleString = title;
  // copySuffix "-copy-number" suffix of product
  let copySuffix = titleString.match(/-copy-\d+$/) || titleString.match(/-copy$/);
  // if product is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    titleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    titleString = title.replace(/\d+$/, '').replace(/-$/, '');
  }

  // if we have more than one product with the same handle, we should mark
  // it as "copy" or increment our product handle if it contain numbers.
  if (titleCount > 0) {
    // if we have product with name like "product4", we should take care
    // about its uniqueness
    if (titleNumberSuffix > 0) {
      title = `${titleString}-${titleNumberSuffix + titleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      title = `${titleString}-copy${ titleCount > 1 ? "-" + titleCount : ""}`;
    }
  }

  // we should check again if there are any new matches with DB
  if (ReactionCore.Collections.Products.find({
    title: title
  }).count() !== 0) {
    title = createTitle(title, productId);
  }
  return title;
}

/**
 * @function createHandle
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {String} productHandle - product `handle`
 * @param {String} productId - current product `_id`
 * @return {String} handle - modified `handle`
 */
function createHandle(productHandle, productId) {
  let handle = productHandle || "";
  // exception product._id needed for cases then double triggering happens
  let handleCount = ReactionCore.Collections.Products.find({
    handle: handle,
    _id: {
      $nin: [productId]
    }
  }).count();
  // current product "copy" number
  let handleNumberSuffix = 0;
  // product handle prefix
  let handleString = handle;
  // copySuffix "-copy-number" suffix of product
  let copySuffix = handleString.match(/-copy-\d+$/) || handleString.match(/-copy$/);

  // if product is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    handleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    handleString = handle.replace(/\d+$/, '').replace(/-$/, '');
  }

  // if we have more than one product with the same handle, we should mark
  // it as "copy" or increment our product handle if it contain numbers.
  if (handleCount > 0) {
    // if we have product with name like "product4", we should take care
    // about its uniqueness
    if (handleNumberSuffix > 0) {
      handle = `${handleString}-${handleNumberSuffix + handleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      handle = `${handleString}-copy${ handleCount > 1
        ? '-' + handleCount : ''}`;
    }
  }

  // we should check again if there are any new matches with DB
  if (ReactionCore.Collections.Products.find({
    handle: handle
  }).count() !== 0) {
    handle = createHandle(handle, productId);
  }

  return handle;
}

/**
 * @function copyMedia
 * @description copy images links to cloned variant from original
 * @param {String} newId - [cloned|original] product _id
 * @param {String} variantOldId - old variant _id
 * @param {String} variantNewId - - cloned variant _id
 * @return {Number} ReactionCore.Collections.Media#update result
 */
function copyMedia(newId, variantOldId, variantNewId) {
  ReactionCore.Collections.Media.find({
    "metadata.variantId": variantOldId
  }).forEach(function (fileObj) {
    let newFile = fileObj.copy();
    return newFile.update({
      $set: {
        "metadata.productId": newId,
        "metadata.variantId": variantNewId
      }
    });
  });
}

/**
 * @function denormalize
 * @description With flattened model we do not want to get variant docs in
 * `products` publication, but we need some data from variants to display price,
 * quantity, etc. That's why we are denormalizing these properties into product
 * doc. Also, this way should have a speed benefit comparing the way where we
 * could dynamically build denormalization inside `products` publication.
 * @summary update product denormalized properties if variant was updated or
 * removed
 * @param {String} id - product _id
 * @param {String} field - type of field. Could be:
 * "price",
 * "inventoryQuantity",
 * "inventoryManagement",
 * "inventoryPolicy",
 * "lowInventoryWarningThreshold"
 * @since 0.11.0
 * @return {Number} - number of successful update operations. Should be "1".
 */
function denormalize(id, field) {
  const doc = ReactionCore.Collections.Products.findOne(id);
  let variants;
  if (doc.type === "simple") {
    variants = ReactionCore.getTopVariants(id);
  } else if (doc.type === "variant" && doc.ancestors.length === 1) {
    variants = ReactionCore.getVariants(id);
  }
  let update = {};

  switch (field) {
  case "inventoryPolicy":
  case "inventoryQuantity":
  case "inventoryManagement":
    Object.assign(update, {
      isSoldOut: isSoldOut(variants),
      isLowQuantity: isLowQuantity(variants),
      isBackorder: isBackorder(variants)
    });
    break;
  case "lowInventoryWarningThreshold":
    Object.assign(update, {
      isLowQuantity: isLowQuantity(variants)
    });
    break;
  default: // "price" is object with range, min, max
    const priceObject = ReactionCore.getProductPriceRange(id);
    Object.assign(update, {
      price: priceObject
    });
  }
  ReactionCore.Collections.Products.update(id, {
    $set: update
  }, {
    selector: {
      type: "simple"
    }
  });
}

/**
 * isSoldOut
 * @description We are stop accepting new orders if product marked as
 * `isSoldOut`.
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
function isSoldOut(variants) {
  return variants.every(variant => {
    if (variant.inventoryManagement && variant.inventoryPolicy) {
      return ReactionCore.getVariantQuantity(variant) === 0;
    }
    return false;
  });
}

/**
 * isLowQuantity
 * @description If at least one of the variants is less than the threshold,
 * then function returns `true`
 * @param {Array} variants - array of child variants
 * @return {boolean} low quantity or not
 */
function isLowQuantity(variants) {
  return variants.some(variant => {
    const quantity = ReactionCore.getVariantQuantity(variant);
    // we need to keep an eye on `inventoryPolicy` too and qty > 0
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= variant.lowInventoryWarningThreshold;
    }
    // TODO: need to test this function with real data
    return false;
  });
}

/**
 * isBackorder
 * @description Is products variants is still available to be ordered after
 * summary variants quantity is zero
 * @param {Array} variants - array with variant objects
 * @return {boolean} is backorder allowed or now for a product
 */
function isBackorder(variants) {
  return variants.every(variant => {
    return !variant.inventoryPolicy && variant.inventoryManagement &&
      variant.inventoryQuantity === 0;
  });
}

/**
 * flushQuantity
 * @description if variant `inventoryQuantity` not zero, function update it to
 * zero. This needed in case then option with it's own `inventoryQuantity`
 * creates to top-level variant. In that case top-level variant should display
 * sum of his options `inventoryQuantity` fields.
 * @param {String} id - variant _id
 * @return {Number} - collection update results
 */
function flushQuantity(id) {
  const variant = ReactionCore.Collections.Products.findOne(id);
  // if variant already have descendants, quantity should be 0, and we don't
  // need to do all next actions
  if (variant.inventoryQuantity === 0) {
    return 1; // let them think that we have one successful operation here
  }

  return ReactionCore.Collections.Products.update({
    _id: id
  }, {
    $set: {
      inventoryQuantity: 0
    }
  }, {
    selector: {
      type: "variant"
    }
  });
}

/**
 * checkAvailability
 * @description Basic binary search to see if requested dates are available for a given inventory item
 * @param {[Date]} reservedDates - Array of dates that have been reserved for a particular item
 * @param {[Date]} requestedDates - Array of dates that have been requested for reservation
 * @return {Boolean} - availability of item
 */
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
  },

  /*
   * Push an event to a specific inventoryVariant
   * params:
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

  /*
   * Push an event to a specific variant
   * only need to supply updated information
  #
   * returns array of available (inventory) variant ids
   */
  "rentalProducts/checkInventoryAvailability": function (variantId, reservationRequest, quantity = 1) {
    check(variantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    check(quantity, Number);
    let InventoryVariants = ReactionCore.Collections.InventoryVariants;

    let requestedVariants = [];
    let requestedDates = [];

    // TODO: Add shipping, return, and cleaning buffers into dates to reserve
    // @PaulGreever
    let iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate("days");

    while (iter.hasNext()) { requestedDates.push(iter.next().toDate()); }

    let inventoryVariants = InventoryVariants.find({productId: variantId}).fetch();

    if (inventoryVariants.length > 0) {
      // if this variant has multiple inventory
      for (let uid of inventoryVariants) {
        // Check to see if any of the dates requested are unavailable
        // if so, this item is unavailable for requested time period
        if (checkAvailability(uid.unavailableDates, requestedDates)) {
          requestedVariants.push(uid._id);
          if (requestedVariants.length >= quantity) {
            break;
          }
        }
      }
    // TODO: Update single inventory existing on variant for future
    } else if (checkAvailability(variant.unavailableDates, requestedDates)) {
      // else if there is only one of this variant
      requestedVariants.push(variant._id);
    }
    // return requested variants array  (an array consisting of available variantIds)
    return requestedVariants;
  },

  /**
   * rentalProducts/cloneVariant
   * @summary clones a product variant into a new variant
   * @description the method copies variants, but will also create and clone
   * child variants (options)
   * @param {String} productId - the productId we're whose variant we're
   * cloning
   * @param {String} variantId - the variantId that we're cloning
   * @todo rewrite @description
   * @return {String} - cloned variant _id
   */
  "rentalProducts/cloneRentalVariant": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // user needs createProduct permission to clone
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const variants = ReactionCore.Collections.Products.find({
      $or: [{
        _id: variantId
      }, {
        ancestors: {
          $in: [variantId]
        }
      }],
      type: "rentalVariant"
    }).fetch();

    // exit if we're trying to clone a ghost (variant that doesn't exist)
    if (variants.length === 0) {
      return;
    }

    const variantNewId = Random.id(); // for the parent variant
    // we need to make sure that top level variant will be cloned first, his
    // descendants later.
    // we could use this way in future: http://stackoverflow.com/questions/
    // 9040161/mongo-order-by-length-of-array, by now following are allowed
    // @link http://underscorejs.org/#sortBy
    const sortedVariants = _.sortBy(variants, doc => doc.ancestors.length);

    sortedVariants.map(variant => {
      const oldId = variant._id;
      let type = "child";
      let clone = {};
      if (variantId === variant._id) {
        type = "parent";
        Object.assign(clone, variant, {
          _id: variantNewId,
          title: ""
        });
      } else {
        const parentIndex = variant.ancestors.indexOf(variantId);
        const ancestorsClone = variant.ancestors.slice(0);
        // if variantId exists in ancestors, we override it by new _id
        !!~parentIndex && ancestorsClone.splice(parentIndex, 1, variantNewId);
        Object.assign(clone, variant, {
          _id: Random.id(),
          ancestors: ancestorsClone,
          optionTitle: "",
          title: ""
        });
      }
      delete clone.updatedAt;
      delete clone.createdAt;
      delete clone.inventoryQuantity;
      copyMedia(productId, oldId, clone._id);

      return ReactionCore.Collections.Products.insert(clone, {
        validate: false
      }, (error, result) => {
        if (result) {
          if (type === "child") {
            ReactionCore.Log.info(
              `products/cloneVariant: created sub child clone: ${
                clone._id} from ${variantId}`
            );
          } else {
            ReactionCore.Log.info(
              `products/cloneVariant: created clone: ${
                clone._id} from ${variantId}`
            );
          }
        }
        if (error) {
          ReactionCore.Log.error(
            `products/cloneVariant: cloning of ${variantId} was failed: ${
              error}`
          );
        }
      });
    });
  }
});
