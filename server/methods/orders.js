Meteor.methods({

  /*
   * adjust inventory when an order is placed
   */
  'rentalProducts/inventoryAdjust': function (orderId) {
    // var datesToReserve, i, iter, j, len, len1, order, orderProduct, positionToInsert, product, ref, reservedDates, variantId, variantIds;
    check(orderId, String);

    const order = Orders.findOne(orderId);
    if (!order) { return false; } // If we can't find an order, exit.

    const datesToReserve = [];
    iter = moment(order.startTime).twix(order.endTime, { allDay: true }).iterate('days'); // Momentjs iterator
    while (iter.hasNext()) { datesToReserve.push(iter.next().toDate()); }  // Create array of requested dates

    for (let orderProduct of order.items) {
      let product = Products.findOne(orderProduct.productId);
      if (product.productType === 'rental') {
        /* push start date minus pre-buffer days
         * loop through adding one day to array
         * stop when we get to end day + trailing buffer
         */
        let variantIds = Meteor.call('rentalProducts/checkInventoryAvailability',
                                      product._id,
                                      orderProduct.variants._id,
                                      {endTime: order.endTime, startTime: order.startTime},
                                      orderProduct.quantity);
        if (variantIds.length !== orderProduct.quantity) {
          throw new Meteor.Error(403, 'Available inventory and quantity requested do not match');
        }

        // Not using $in because we need to determine the correct position
        // to insert the new dates separately for each inventoryVariant
        for (let variantId of variantIds) {
          let reservedDates = Products.findOne({
            '_id': orderProduct.productId,
            'variants._id': variantId
          }, {'variants.$.unavailableDates': 'variants.$.unavailableDates'});

          // We take the time to insert unavailable dates in ascending date order
          // find the position that we should insert the reserved dates
          positionToInsert = _.sortedIndex(reservedDates, datesToReserve[0]);

          // insert datesToReserve into the correct variants at the correct position
          Products.update({'_id': orderProduct.productId, 'variants._id': variantId }, {
            $push: {
              'variants.$.unavailableDates': {
                $each: datesToReserve,
                $position: positionToInsert
              }
            }
          });
        }
      } else {
        Products.update({
          '_id': product.productId,
          'variants._id': product.variants._id
        }, { $inc: {'variants.$.inventoryQuantity': -orderProduct.quantity}});
      }
    }
  }
});
