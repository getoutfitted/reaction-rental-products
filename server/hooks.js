ReactionCore.MethodHooks.beforeMethods({
  "orders/inventoryAdjust": function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call("rentalProducts/inventoryAdjust", orderId);

    return false; // Don't move on with the original call.
  }
});

ReactionCore.MethodHooks.afterMethods({
  "cart/addToCart": function (options) {
    check(options.arguments[0], String);
    check(options.arguments[1], String);

    const variantId = options.arguments[1];
    const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId });
    if (!cart) {
      return true;
    }
    if (cart.items && cart.items.length > 0) {
      _.map(cart.items, function (item) {
        if (item.variants._id === variantId
          && item.variants.functionalType === "rentalVariant" // TODO: future if item.type === rental
          && cart.rentalDays) {
            // TODO: update qty to verified rental qty available
          // Set price to calculated rental price;
          item.variants.price = item.variants.pricePerDay * cart.rentalDays;
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
    return true; // Continue with other hooks;
    // TODO: Figure out what I should be returning
  }
});
