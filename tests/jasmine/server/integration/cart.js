describe('getoutfitted:reaction-rental-products cart methods', function () {
  describe('rentalProducts/setRentalPeriod', function () {
    beforeEach(function () {
      Carts.remove({});
    });

    it('should set cart rental start and end times', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();

      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);
      const updatedCart = Carts.findOne(cart._id);
      expect(+updatedCart.startTime).toEqual(+startTime);
      expect(+updatedCart.endTime).toEqual(+endTime);
      done();
    });
  });

  describe('rentalProducts/getRentalLength', function () {
    beforeEach(function () {
      Carts.remove({});
    });

    it('should get cart rental length in days', function (done) {
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).length('days');

      const cart = Factory.create('cart', {
        startTime: startTime,
        endTime: endTime
      });

      // Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);
      const cartLengthInDays = Meteor.call('rentalProducts/getRentalLength', cart._id, 'days', function (error, result) {
        if (error) {
          ReactionCore.Log.error('Error getting rental length for cart: ' + cart._id + ' ', error);
        } else {
          return result;
        }
      });

      expect(lengthInDays).toEqual(cartLengthInDays);
      done();
    });

    it('should get cart rental length in hours', function (done) {
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInHours = moment(startTime).twix(endTime).length('hours');

      const cart = Factory.create('cart', {
        startTime: startTime,
        endTime: endTime
      });

      // Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);
      const cartLengthInHours = Meteor.call('rentalProducts/getRentalLength', cart._id, 'hours', function (error, result) {
        if (error) {
          ReactionCore.Log.error('Error getting rental length for cart: ' + cart._id + ' ', error);
        } else {
          return result;
        }
      });

      expect(lengthInHours).toEqual(cartLengthInHours);
      done();
    });

    it('should round up to nearest unit of time', function (done) {
      const daysTilRental = _.random(7, 30);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental, 'days').add(8, 'hours').toDate();

      const cart = Factory.create('cart', {
        startTime: startTime,
        endTime: endTime
      });

      const cartLengthInDays = Meteor.call('rentalProducts/getRentalLength', cart._id, 'days', function (error, result) {
        if (error) {
          ReactionCore.Log.error('Error getting rental length for cart: ' + cart._id + ' ', error);
        } else {
          return result;
        }
      });

      expect(cartLengthInDays).toEqual(1);
      done();
    });
  });
});
