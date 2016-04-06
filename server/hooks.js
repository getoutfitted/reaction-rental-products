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
