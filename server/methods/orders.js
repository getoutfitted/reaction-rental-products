Meteor.methods({
  /*
   * adjust inventory when an order is placed
   */
  "rentalProducts/inventoryAdjust": function (orderId) {
    check(orderId, String);
    // let Products = ReactionCore.Collections.Products;
    RentalProducts.Log.info(`adjusting rental inventory for order: ${orderId}`);
    let InventoryVariants = ReactionCore.Collections.InventoryVariants;
    let Orders = ReactionCore.Collections.Orders;
    const order = Orders.findOne(orderId);
    if (!order) { return false; } // If we can't find an order, exit.
    // TODO: Add store buffer days into dates to reserve;
    let datesToReserve = [];
    let detailsToReserve = [];
    const shippingDays = 0; // Shipping Days are built into current model
    const turnaroundTime = 1; // Turnaround Time is defaulted to 1
    let transitTime = 4; // Try / Catch to see if advancedFulfillment is installed
    let counter = 0;
    try {
      transitTime = AdvancedFulfillment.calculateTransitTime(order);
      RentalProducts.Log.info(`Transit time calculated to be ${transitTime} days`);
    } catch (e) {
      RentalProducts.Log.warn("AdvancedFulfillment is not installed, transit time will be defaulted");
      transitTime = 4;
    }

    let reservation = moment(
      AdvancedFulfillment.calculateShippingDay(order)
    ).twix(
      moment(AdvancedFulfillment.calculateReturnDay(order)).add(turnaroundTime, "days"), { allDay: true });
    let reservationLength = reservation.count("days");
    let iter = reservation.iterate("days"); // Momentjs iterator
    while (iter.hasNext()) {
      let reason = "In Use";
      let requestedDate = iter.next().toDate();
      datesToReserve.push(requestedDate);

      // Insert into Unavailable Details
      if (counter === 0) {
        reason = "In Transit - Delivery Shipped"; // First reservation day is when order is shipped from warehouse
      } else if (counter - 1 < transitTime) {
        reason = "In Transit - Delivery";         // Second day through transitTime is delivery
      } else if (counter === reservationLength - transitTime - 2) {
        reason = "In Transit - Return Shipped";
      } else if (counter === reservationLength - turnaroundTime) {
        reason = "Return Processing";
      } else if (counter >= reservationLength - transitTime - turnaroundTime) {
        reason = "In Transit - Returning";
      }

      detailsToReserve.push({
        date: requestedDate,
        reason: reason,
        orderId: orderId
      });
      counter++;
    }  // Create array of requested dates

    for (let item of order.items) {
      if (item.variants.functionalType === "rentalVariant") {
        /* push start date minus pre-buffer days
         * loop through adding one day to array
         * stop when we get to end day + trailing buffer
         */
        let variantIds = Meteor.call("rentalProducts/checkInventoryAvailability",
                                      item.variants._id,
                                      {endTime: order.endTime, startTime: order.startTime},
                                      item.quantity, false);
        RentalProducts.Log.info(`Checked to see if ${item.variants._id} had ${item.quantity} available and it had ${variantIds.length} available`);
        RentalProducts.Log.info(`${variantIds} were the variants that should be reserved from ${order.startTime} to ${order.endTime}`);
        if (variantIds.length !== item.quantity) {
          throw new Meteor.Error(403, "Requested " + item.quantity + " but only " + variantIds.length + " were available.");
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
              },
              unavailableDetails: {
                $each: detailsToReserve,
                $position: positionToInsert
              }
            }
          });
        }
      }
    }
  }
});
