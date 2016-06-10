ReactionCore.MethodHooks.beforeMethods({
  "orders/inventoryAdjust": function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call("rentalProducts/inventoryAdjust", orderId);

    return options;
    // Returned false before, but there is no longer an `adjust inventory method in core`
    // so this is probably never called any more.
  }
});

ReactionCore.MethodHooks.afterMethods({
  "cart/addToCart": function (options) {
    check(options.arguments[0], String);
    check(options.arguments[1], String);
    const variantId = options.arguments[1];
    const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId() });
    if (!cart) {
      return options;
    }
    if (cart.items && cart.items.length > 0) {
      _.map(cart.items, function (item) {
        if (item.variants._id === variantId
          && (item.variants.functionalType === "rentalVariant"
            || item.variants.functionalType === "bundleVariant") // TODO: future if item.type === rental
          && cart.rentalDays) {
            // TODO: update qty to verified rental qty available
          // Set price to calculated rental price;
          let priceBucket = _.find(item.variants.rentalPriceBuckets, (bucket) => {
            return bucket.duration === cart.rentalDays;
          });
          if (priceBucket) {
            item.variants.price = priceBucket.price;
          } else {
            // remove from cart
            // Throw error
          }
        }
        return item;
      });
    } else {
      cart.items = [];
    }

    ReactionCore.Collections.Cart.update({
      _id: cart._id
    }, {
      $set: {
        items: cart.items
      }
    });
    return options; // Continue with other hooks;
    // was returning true before. After chatting with @paulgrever we decided it was proabably better to return
    // the options object
  }
});
