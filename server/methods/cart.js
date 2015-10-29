Meteor.methods({
  'rentalProducts/setRentalPeriod': function (cartId, startTime, endTime) {
    check(cartId, String);
    check(startTime, Date);
    check(endTime, Date);
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    // Make sure that cart is owned by current user.
    if (cart.userId !== Meteor.userId()) {
      return false;
    }

    // If cart has items in it - update the price for those items
    if (cart.items.length > 0) {
      // Update price of each item in cart based on rental lengthInDays
      _.map(cart.items, function (item) {
        if (item.type === 'rental') {
          ReactionCore.Log.info('Updating item price');
          ReactionCore.Log.info(item.variants.price);
          item.variants.price = item.variants.pricePerDay * cart.rentalDays;
          ReactionCore.Log.info(item.variants.price);
        }
        return item;
      });
    }

    const rental = moment(startTime).twix(endTime);
    Cart.update({
      _id: cartId
    }, {
      $set: {
        startTime: startTime,
        endTime: endTime,
        rentalMonths: rental.count('months'),
        rentalWeeks: rental.count('weeks'),
        rentalDays: rental.count('days'),
        rentalHours: rental.count('hours'),
        rentalMinutes: rental.count('minutes')
      }
    });
  },

  'rentalProducts/setRentalLength': function (cartId, rentalLength, units) {
    check(cartId, String);
    check(rentalLength, Number);
    check(units, Match.OneOf('months', 'weeks', 'days', 'hours', 'minutes'));
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    if (cart.userId !== Meteor.userId()) {
      return false;
    }

    let opts = {};
    const fieldToSet = 'rental' + units[0].toUpperCase() + units.substr(1); // Make sure that units is correct
    opts[fieldToSet] = rentalLength;

    Cart.update({
      _id: cartId
    }, {
      $set: updateObj
    });
  }
});
