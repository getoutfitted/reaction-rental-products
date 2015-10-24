describe('getoutfitted:reaction-rental-products cart methods', function () {
  describe('rentalProducts/setRentalPeriod', function () {
    beforeEach(function () {
      Cart.remove({});
    });

    it('should set cart rental start and end times', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);
      const updatedCart = Cart.findOne(cart._id);
      expect(+updatedCart.startTime).toEqual(+startTime);
      expect(+updatedCart.endTime).toEqual(+endTime);
      done();
    });

    it('should set rental length in days', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInDays = moment(startTime).twix(endTime).count('days');

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      done();
    });

    it('should set rental length in hours', function (done) {
      const cart = Factory.create('cart');
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental + rentalLength, 'days').toDate();
      const lengthInHours = moment(startTime).twix(endTime).count('hours');

      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalHours).toEqual(lengthInHours);
      done();
    });

    it('should round up to nearest unit of time', function (done) {
      const daysTilRental = _.random(7, 30);
      const cart = Factory.create('cart');
      const startTime = moment().add(daysTilRental, 'days').toDate();
      const endTime = moment().add(daysTilRental, 'days').endOf('day').toDate();
      spyOn(Meteor, 'userId').and.returnValue(cart.userId);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startTime, endTime);

      const updatedCart = Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(1);
      done();
    });
  });
});
