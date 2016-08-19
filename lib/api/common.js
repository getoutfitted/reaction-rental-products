import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';
import 'moment-timezone';
import { Random } from 'meteor/random';
import { getShopId } from '/lib/api';
import { InventoryVariants } from '../collections';
import { Packages } from '/lib/collections';
import { _ } from 'meteor/underscore';

function adjustLocalToDenverTime(time) {
  let here = moment(time);
  let denver = here.clone().tz("America/Denver");
  denver.add(here.utcOffset() - denver.utcOffset(), "minutes");
  return denver.toDate();
}

export default RentalProducts = {
  /**
   * RentalProducts.schemaIdAutoValue
   * @summary used for schemea injection autoValue
   * @example autoValue: RentalProducts.schemaIdAutoValue
   * @return {String} returns randomId
   */
  schemaIdAutoValue: function () {
    if ((this.value) || (this.isUpdate && Meteor.isServer) || (this.isUpsert && Meteor.isServer)) {
      return this.value;
    } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
      return Random.id();
    }
    return this.unset();
  },

  /**
   * RentalProducts.checkAvailability
   * @description Basic binary search to see if requested dates are available for a given inventory item
   * @param {[Date]} reservedDates - Array of dates that have been reserved for a particular item
   * @param {[Date]} requestedDates - Array of dates that have been requested for reservation
   * @return {Boolean} - availability of item
   */
  checkAvailability: function (reservedDates, requestedDates) {
    for (let date of requestedDates) {
      let min = 0;
      let max = reservedDates.length - 1;

      while (min <= max) {
        let guess = Math.floor((min + max) / 2);

        if (+reservedDates[guess] === +date) {
          return false;
        }
        // Else
        if (+reservedDates[guess] < +date) {
          min = guess + 1;
        } else {
          max = guess - 1;
        }
      }
    }
    return true;
  },

  checkInventoryAvailability: function (variantId, reservationRequest, quantity = 1, searchLeastBookedFirst = true) {
    check(variantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    check(quantity, Number);
    check(searchLeastBookedFirst, Match.Optional(Boolean));

    let requestedVariants = [];
    let requestedDates = [];
    let sortDirection = searchLeastBookedFirst ? 1 : -1;

    let iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate("days");

    while (iter.hasNext()) {
      let requestedDate = adjustLocalToDenverTime(iter.next());
      requestedDates.push(requestedDate);
    }

    // Sort by length of inventory variants unavailableDates array
    let inventoryVariants = InventoryVariants.find(
      {
        productId: variantId,
        active: true,
        "workflow.status": "active"
      }, {
        sort: {numberOfDatesBooked: sortDirection}
      }).fetch();

    if (inventoryVariants.length > 0) {
      // if this variant has multiple inventory
      for (let uid of inventoryVariants) {
        // Check to see if any of the dates requested are unavailable
        // if so, this item is unavailable for requested time period
        if (RentalProducts.checkAvailability(uid.unavailableDates, requestedDates)) {
          requestedVariants.push(uid._id);
          if (requestedVariants.length >= quantity) {
            break;
          }
        }
      }
    }
    // return requested variants array  (an array consisting of available variantIds)
    return requestedVariants;
  },

  _getSettings: function () {
    const tt = Packages.findOne({
      name: 'reaction-rental-products',
      shopId: getShopId()
    });

    if (!tt) {
      throw new Meteor.Error(500, "Rental Products package not found ");
    }

    return tt.settings;
  },

  getTurnaroundTime: function () {
    const settings = RentalProducts._getSettings();
    return settings.turnaroundTime || 1; // Changed from `selectedShipping`
  }
};
