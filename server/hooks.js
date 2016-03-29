ReactionCore.MethodHooks.beforeMethods({
  'cart/addToCart': function (options) {
    check(options.arguments, [Match.Any]);
    console.log(this);
    console.log(options);
    const product = ReactionCore.Collections.Products.findOne(options.arguments[0]);
    const cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId });
    console.log(cart);
    // mutate price of object if rental
    if (product.type === 'rental') {
      if (!cart.rentalDays) {
        cart.rentalDays = 1;
      }
      options.arguments[2] = _.omit(options.arguments[2], ['unavailableDates', 'active']);
      options.arguments[2].price = options.arguments[2].pricePerDay * cart.rentalDays;
    }
    return true;
  },
  'orders/inventoryAdjust': function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call('rentalProducts/inventoryAdjust', orderId);

    return false;
  }
});
