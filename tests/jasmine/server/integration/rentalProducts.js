describe('getoutfitted:reaction-rental-products methods', function () {
  describe('cloneRentalVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('rentalProduct');
      spyOn(Products, 'insert');

      expect(function () {
        Meteor.call('cloneVariant', product._id, product.variants[0]._id);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));

      expect(Products.insert).not.toHaveBeenCalled();
      done();
    });

    it('should have rental variant properties', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');

      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('cloneVariant', product._id, product.variants[0]._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(2);
      expect(updatedProduct.variants[0].unavailableDates).toEqual([]);
      expect(updatedProduct.variants[1].unavailableDates).toEqual([]);
      expect(updatedProduct.variants[0].active).toEqual(true);
      expect(updatedProduct.variants[1].active).toEqual(true);
      done();
    });

    it('should clone rental variant by admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');

      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('cloneVariant', product._id, product.variants[0]._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(2);
      done();
    });
  });

  describe('createVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('rentalProduct');

      spyOn(Products, 'update');
      expect(function () {
        Meteor.call('createVariant', product._id);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));
      expect(Products.update).not.toHaveBeenCalled();

      done();
    });

    it('should create variant by admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call('deleteVariant', product.variants[0]._id);
      Meteor.call('createVariant', product._id);

      const updatedProduct = Products.findOne(product._id);
      expect(_.size(updatedProduct.variants)).toEqual(1);

      const variant = updatedProduct.variants[0];
      expect(variant.type).toEqual('rentalVariant');
      expect(variant.title).toEqual('');
      expect(variant.price).toEqual(0);
      done();
    });
  });

  describe('updateVariant', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should throw 403 error by non admin', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('product');

      spyOn(Products, 'update');
      expect(function () {
        Meteor.call('updateVariant', product.variants[0]);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));

      expect(Products.update).not.toHaveBeenCalled();
      done();
    });
  });

  describe('createProduct', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should have rental attributes', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const prodId = Meteor.call('createProduct');
      const product = Products.findOne(prodId);
      const variant = product.variants[0];
      expect(product.productType).toEqual('rental');
      expect(variant.events[0].title).toEqual('Inbounded');
      expect(variant.active).toEqual(true);
      done();
    });
  });

  describe('createProductEvent', function () {
    let productEvents = {};

    beforeEach(function () {
      Products.remove({});

      // TODO: MOVE events to faker
      productEvents.ex1 = {
        title: 'Left Warehouse',
        description: 'Picked up by FedEx. Tracking #123456'
      };

      productEvents.ex2 = {
        title: 'Delivered',
        description: 'Delivered to Hotel',
        location: {
          address1: '564 Main Street',
          address2: 'C/O Resort Hotel Guest in Room 123',
          city: 'Telluride',
          region: 'CO',
          postal: '81435',
          metafields: {
            key: 'hotel',
            value: 'Resort Hotel'
          }
        }
      };
    });

    it('should 403 error by non permissioned user', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(false);
      const product = Factory.create('product');
      spyOn(Products, 'update');
      expect(function () {
        Meteor.call('createProductEvent', product.variants[0]._id, productEvents.ex1);
      }).toThrow(new Meteor.Error(403, 'Access Denied'));
      expect(Products.update).not.toHaveBeenCalled();
      done();
    });

    it('should insert a new basic event for a given variant', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');
      const variantId = product.variants[0]._id;
      Meteor.call('createProductEvent', variantId, productEvents.ex1);

      const updatedProduct = Products.findOne(product._id);
      const variant = updatedProduct.variants[0];
      expect(variant.events.length).toEqual(2);
      expect(variant.events[1].title).toEqual('Left Warehouse');
      done();
    });

    it('should insert a new complete event for a given variant', function (done) {
      spyOn(Roles, 'userIsInRole').and.returnValue(true);
      const product = Factory.create('rentalProduct');
      const variantId = product.variants[0]._id;
      Meteor.call('createProductEvent', variantId, productEvents.ex2);

      const updatedProduct = Products.findOne(product._id);
      const variant = updatedProduct.variants[0];
      const variantEvent = variant.events[1];
      expect(variant.events.length).toEqual(2);
      expect(variantEvent.location.city).toEqual('Telluride');
      done();
    });
  });

  return describe('checkVariantAvailability', function () {
    beforeEach(function () {
      Products.remove({});
    });

    it('should return array of available inventory variant ids', function (done) {
      const product = Factory.create('rentalProductWithInventory');
      const variant = product.variants[0];
      const quantity = _.random(1, 5);
      expect(product.variants.length).toEqual(14);
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id);

      const inventoryAvailable = Meteor.call('checkInventoryAvailability', product._id, variant._id, {
        startTime: moment().startOf('day').add(3, 'days').toDate(),
        endTime: moment().startOf('day').add(5, 'days').toDate()
      }, quantity);

      expect(inventoryAvailable.length).toEqual(quantity);
      done();
    });

    it('should return array of available inventory variant ids up to the max inventory available', function (done) {
      const product = Factory.create('rentalProductWithInventory');
      const variant = product.variants[0];
      const quantity = 15;
      const quantityAvailable = 12;
      expect(product.variants.length).toEqual(14);
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id);

      const inventoryAvailable = Meteor.call('checkInventoryAvailability', product._id, variant._id, {
        startTime: moment().startOf('day').add(3, 'days').toDate(),
        endTime: moment().startOf('day').add(5, 'days').toDate()
      }, quantity);

      expect(inventoryAvailable.length).toEqual(quantityAvailable);
      done();
    });

    it('should be return empty array if requested dates are booked for all inventory variants', function (done) {
      const product = Factory.create('rentalProductWithInventory');
      const variant = product.variants[0];
      expect(product.variants.length).toEqual(14);
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id);

      const inventoryAvailable = Meteor.call('checkInventoryAvailability', product._id, variant._id, {
        startTime: moment().startOf('day').add(10, 'days').toDate(),
        endTime: moment().startOf('day').add(16, 'days').toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });

    it('should be return empty array if requested dates are partially booked for all inventory variants', function (done) {
      const product = Factory.create('rentalProductWithInventory');
      const variant = product.variants[0];
      expect(product.variants.length).toEqual(14);
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id);

      const inventoryAvailable = Meteor.call('checkInventoryAvailability', product._id, variant._id, {
        startTime: moment().startOf('day').add(4, 'days').toDate(),
        endTime: moment().startOf('day').add(10, 'days').toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });
  });
});
