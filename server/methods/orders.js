Meteor.methods({
  /*
   * adjust inventory when an order is placed
   */
  'rentalProducts/inventoryAdjust': function (orderId) {
    check(orderId, String);
    let Products = ReactionCore.Collections.Products;
    let InventoryVariants = ReactionCore.Collections.InventoryVariants;
    let Orders = ReactionCore.Collections.Orders;
    const order = Orders.findOne(orderId);
    if (!order) { return false; } // If we can't find an order, exit.

    // TODO: Add store buffer days into dates to reserve;
    const datesToReserve = [];
    iter = moment(order.startTime).twix(order.endTime, { allDay: true }).iterate('days'); // Momentjs iterator
    while (iter.hasNext()) { datesToReserve.push(iter.next().toDate()); }  // Create array of requested dates

    for (let item of order.items) {
      if (item.variants.functionalType === 'rentalVariant') {
        /* push start date minus pre-buffer days
         * loop through adding one day to array
         * stop when we get to end day + trailing buffer
         */
        let variantIds = Meteor.call('rentalProducts/checkInventoryAvailability',
                                      item.variants._id,
                                      {endTime: order.endTime, startTime: order.startTime},
                                      item.quantity, false);
        if (variantIds.length !== item.quantity) {
          throw new Meteor.Error(403, 'Requested ' + item.quantity + ' but only ' + variantIds.length + ' were available.');
        }

        // Not using $in because we need to determine the correct position
        // to insert the new dates separately for each inventoryVariant
        for (let variantId of variantIds) {
          let reservedDates = InventoryVariants.findOne({
            _id: variantId
          }, {fields: {unavailableDates: 1}}).unavailableDates;

          // We take the time to insert unavailable dates in ascending date order
          // find the position that we should insert the reserved dates
          positionToInsert = _.sortedIndex(reservedDates, datesToReserve[0]);

          // insert datesToReserve into the correct variants at the correct position
          InventoryVariants.update({_id: variantId}, {
            $inc: {
              numberOfDatesBooked: datesToReserve.length
            },
            $push: {
              unavailableDates: {
                $each: datesToReserve,
                $position: positionToInsert
              }
            }
          });
        }
      } else {
        ReactionCore.Collections.Products.update({
          _id: item.variants._id
        }, {
          $inc: {
            inventoryQuantity: -item.quantity
          }
        }, { selector: { type: "variant" } });
      }
    }
  }
});
