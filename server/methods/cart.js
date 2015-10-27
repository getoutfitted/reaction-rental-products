Meteor.methods({
  'rentalProducts/setRentalPeriod': function (cartId, startTime, endTime) {
    check(cartId, String);
    check(startTime, Date);
    check(endTime, Date);
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    if (cart.userId !== Meteor.userId()) {
      return false;
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
