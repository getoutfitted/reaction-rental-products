ReactionCore.MethodHooks.beforeMethods({
  'orders/inventoryAdjust': function (options) {
    check(options.arguments, [Match.Any]);
    const orderId = options.arguments[0];
    if (!orderId) { return true; }

    Meteor.call('rentalProducts/inventoryAdjust', orderId);

    return false;
  }
});
