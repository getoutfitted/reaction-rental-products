describe('getoutfitted:reaction-rental-products orders methods', function () {
  describe('rentalProducts/inventoryAdjust', function () {
    beforeEach(function () {
      Products.remove({});
      Orders.remove({});
    });

    it('should reserve dates requested', function (done) {
      const product = Factory.create('rentalProduct');
      const variant = product.variants[0];
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const quantity = 1;
      const order = Factory.create('rentalOrder', {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(daysTilRental + rentalLength, 'days').toDate(),
        items: [
          {
            _id: faker.random.uuid(),
            productId: product._id,
            variants: variant,
            quantity: quantity,
            type: 'rental'
          }
        ]
      });
      const preInventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', product._id, variant._id, {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(daysTilRental + rentalLength, 'days').toDate()
      }, quantity);

      Meteor.call('rentalProducts/inventoryAdjust', order._id);
      const updatedProduct = Products.findOne(product._id);
      const updatedVariant = updatedProduct.variants[0];
      expect(updatedVariant.unavailableDates.length).toEqual(rentalLength + 1);
      postInventoryAvailable = Meteor.call('rentalProducts/checkInventoryAvailability', updatedProduct._id, updatedVariant._id, {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(daysTilRental + rentalLength, 'days').toDate()
      }, quantity);
      expect(postInventoryAvailable.length + quantity).toEqual(preInventoryAvailable.length);

      done();
    });

    it('should insert dates into correct position', function (done) {
      done();
    });
  });
});
