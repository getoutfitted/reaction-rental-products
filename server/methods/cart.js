import moment from "moment";
import "moment-timezone";
import "twix";

function adjustLocalToDenverTime(time) {
  let here = moment(time);
  let denver = here.clone().tz("America/Denver");
  denver.add(here.utcOffset() - denver.utcOffset(), "minutes");
  return denver.toDate();
}

function adjustDenverToLocalTime(time) {
  let denver = moment(time).tz("America/Denver");
  let here = moment(time);
  here.add(denver.utcOffset() - here.utcOffset(), "minutes");
  return here.toDate();
}

Meteor.methods({
  /**
   * rentalProducts/setRentalPeriod sets or updates the startTime and endTime for a users cart.
   * which determines the cart price for any rental items.
   * @param   {String} cartId    - id of cart we are updating
   * @param   {Date}   startTime - Datetime of start of rental
   * @param   {Date}   endTime   - Datetime of end of rental
   */
  "rentalProducts/setRentalPeriod": function (cartId, startTime, endTime) {
    check(cartId, String);
    check(startTime, Date);
    check(endTime, Date);
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    // Make sure that cart is owned by current user.
    if (cart.userId !== Meteor.userId() && !ReactionCore.hasPermission("editUserCart")) {
      throw new Meteor.Error("User Id and Cart userId don\'t match");
    }
    const rental = moment(startTime).twix(endTime);

    // If cart has items in it - update the price for those items
    if (cart.items && cart.items.length > 0) {
      cart.items = cart.items.reduce(function (newCart, item) {
        console.log("newCart", newCart);
        if (item.variants.functionalType === "rentalVariant" // TODO: future if item.type === rental
          && cart.rentalDays) {
            // TODO: update qty to verified rental qty available
          // Set price to calculated rental price;
          // if qty not available available, remove from cart
          if (true) { // TODO: Check to ensure that qty is available for new dates before pushing back into cart
            let priceBucket = _.find(item.variants.rentalPriceBuckets, (bucket) => {
              return bucket.duration === cart.rentalDays;
            });
            if (priceBucket) {
              // ensure price is correct and re-add to cart.
              item.variants.price = priceBucket.price;
              newCart.push(item);
            } else {
              // remove from cart (don't push)
              ReactionCore.Log.error(`Price bucket not found: ${item.variants._id} for ${cart.rentalDays} rental days`);
            }
          }
        } else {
          // item is not a rental - push it back to the cart
          newCart.push(item);
        }
        return newCart;
      }, []);
      
    } else {
      cart.items = [];
    }

    ReactionCore.Collections.Cart.update({
      _id: cartId
    }, {
      $set: {
        startTime: startTime,
        endTime: endTime,
        rentalMonths: rental.count("months"),
        rentalWeeks: rental.count("weeks"),
        rentalDays: rental.count("days"),
        rentalHours: rental.count("hours"),
        rentalMinutes: rental.count("minutes"),
        items: cart.items
      }
    });
  },

  // Deprecate this function? Or figure out what it's for.
  "rentalProducts/setRentalLength": function (cartId, rentalLength, units) {
    check(cartId, String);
    check(rentalLength, Number);
    check(units, Match.OneOf("months", "weeks", "days", "hours", "minutes"));
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    if (cart.userId !== Meteor.userId()) {
      return false;
    }

    let opts = {};
    const fieldToSet = "rental" + units[0].toUpperCase() + units.substr(1); // Make sure that units is correct
    opts[fieldToSet] = rentalLength;

    ReactionCore.Collections.Cart.update({
      _id: cartId
    }, {
      $set: updateObj
    });
  }
});
