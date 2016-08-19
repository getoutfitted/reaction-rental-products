import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Reaction, Logger } from '/server/api';
import { _ } from 'meteor/underscore';
import { InventoryVariants } from '../../lib/collections';
import { Orders } from '/lib/collections';
import moment from 'moment';
import 'moment-timezone';
import 'twix';
import { TransitTimes } from '/imports/plugins/custom/transit-times/server/api';

function adjustLocalToDenverTime(time) {
  let here = moment(time);
  let denver = here.clone().tz("America/Denver");
  denver.add(here.utcOffset() - denver.utcOffset(), "minutes");
  return denver.toDate();
}


Meteor.methods({
  /*
   * adjust inventory when an order is placed
   */
  "rentalProducts/inventoryAdjust": function (orderId) {
    check(orderId, String);
    // let Products = ReactionCore.Collections.Products;
    Logger.info(`adjusting rental inventory for order: ${orderId}`);
    // let InventoryVariants = ReactionCore.Collections.InventoryVariants;
    // let Orders = ReactionCore.Collections.Orders;
    const order = Orders.findOne(orderId);
    if (!order) { return false; } // If we can't find an order, exit.
    // TODO: Add store buffer days into dates to reserve;
    let datesToReserve = [];
    let detailsToReserve = [];
    const turnaroundTime = RentalProducts.getTurnaroundTime(); // Turnaround Time is defaulted to 1d
    let shippingTime = TransitTimes.calculateTotalShippingDaysByOrder(order); // Total days not business days
    let returnTime = TransitTimes.calculateTotalReturnDaysByOrder(order);
    let firstDayToReserve = TransitTimes.calculateShippingDayByOrder(order);
    let lastDayToReserve = moment(TransitTimes.calculateReturnDayByOrder(order)).add(turnaroundTime, "days").toDate();
    let counter = 0;

    let reservation = moment(
      TransitTimes.calculateShippingDayByOrder(order)
    ).twix(
      moment(TransitTimes.calculateReturnDayByOrder(order)).add(turnaroundTime, "days"), { allDay: true });
    let reservationLength = reservation.count("days");
    let iter = reservation.iterate("days"); // Momentjs iterator
    while (iter.hasNext()) {
      let reason = "In Use";
      let requestedDate = iter.next().toDate();
      let denverRequestedDate = adjustLocalToDenverTime(requestedDate);
      datesToReserve.push(denverRequestedDate);

      // Insert into Unavailable Details
      if (counter === 0) {
        reason = "Shipped"; // First reservation day is when order is shipped from warehouse
      } else if (counter === shippingTime) {
        reason = "Delivered";         // Second day through transitTime is delivery
      } else if (counter - 1 < shippingTime) {
        reason = "In Transit";         // Second day through transitTime is delivery
      } else if (counter === reservationLength - returnTime - turnaroundTime - 1) {
        reason = "Return Shipped";
      } else if (counter === reservationLength - turnaroundTime - 1) {
        reason = "Return Delivered";
      } else if (counter >= reservationLength - turnaroundTime) {
        reason = "Return Processing";
      } else if (counter >= reservationLength - returnTime - turnaroundTime) {
        reason = "Return In Transit";
      }

      detailsToReserve.push({
        date: denverRequestedDate,
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
                                      {endTime: lastDayToReserve, startTime: firstDayToReserve},
                                      item.quantity, false);
        // Log details about booking item
        Logger.info(`Checked to see if ${item.variants._id} had ${item.quantity} available and it had`
          + ` ${variantIds.length} available`);
        Logger.info(`${variantIds} were the variants that should be reserved from`
          + ` ${firstDayToReserve} to ${lastDayToReserve} inclusive of shipping and turnaround time`);

        // This should be caught before getting to this point. It's too late here.
        if (variantIds.length !== item.quantity) {
          Logger.error(`Requested ${item.quantity} of ${item.variants._id}, but only ${variantIds.length} were available.`);
          // Bail
          throw new Meteor.Error(403, `Requested quantity not available to book for ${item.variants._id}`);
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
  },
  "rentalProducts/inventoryUnbook": function (orderId) {
    check(orderId, String);
    const impactedInventory = InventoryVariants.find({"unavailableDetails.orderId": orderId}).fetch();
    _.each(impactedInventory, function (inventory) {
      let removalDetails = _.where(inventory.unavailableDetails, {orderId: orderId});
      // grab these for the arrays
      let firstDate = removalDetails[0].date;
      let lastDate = removalDetails[removalDetails.length - 1].date;
      // this will return an array of objects without the ones that have an orderId
      let updatedUnavailableDetails = _.difference(inventory.unavailableDetails, removalDetails);
      // turn the unavailable dates to Numbers array, then get index of first and last date
      let firstIndex = inventory.unavailableDates.map(Number).indexOf(+firstDate);
      let lastIndex = inventory.unavailableDates.map(Number).indexOf(+lastDate);
      let spliceAmount = lastIndex - firstIndex + 1; // to be inclusvie;
      inventory.unavailableDates.splice(firstIndex, spliceAmount);
      InventoryVariants.update({
        _id: inventory._id
      }, {
        $set: {
          unavailableDetails: updatedUnavailableDetails,
          unavailableDates: inventory.unavailableDates,
          numberOfDatesBooked: inventory.unavailableDates.length
        }
      });
      Logger.warn(`Canceled Order #${orderId} removed inventory dates for Inventory item ${inventory._id}`);
    });
  }
});
