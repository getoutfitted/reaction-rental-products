RentalProducts = {
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

  _getSettings: function () {
    const tt = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-rental-products',
      shopId: ReactionCore.getShopId()
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
