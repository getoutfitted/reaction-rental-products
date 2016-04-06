ReactionCore.MethodHooks.beforeMethods({
  // "cart/addToCart": function (options) {
  //   check(options.arguments, [Match.Any]);
  //   const product = ReactionCore.Collections.Products.findOne(options.arguments[0]);
  //   const variant = ReactionCore.Collections.Products.findOne(options.arguments[1]);
  //   const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId });
  //
  //   // If we can"t find the product or the cart, continue with `cart/addToCart`
  //   if (!product || !cart) {
  //     return true;
  //   }
  //
  //   // mutate price of object if rental
  //   // TODO: find new way to do this
  //   if (product.functionalType === "rental") {
  //     if (!cart.rentalDays) {
  //       ReactionCore.Log.warn("Cart did not have rental days");
  //       return true;
  //       // cart.rentalDays = 1;
  //     }
  //     console.log(variant.pricePerDay);
  //     console.log(cart.rentalDays);
  //   }
  //   return true;
  // },
  "orders/inventoryAdjust": function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call("rentalProducts/inventoryAdjust", orderId);

    return false;
  }
});

ReactionCore.MethodHooks.afterMethods({
  "cart/addToCart": function (options) {
    check(options.arguments[0], String);
    check(options.arguments[1], String);
    // console.log(options);
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
  }
});
