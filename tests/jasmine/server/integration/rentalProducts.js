describe("getoutfitted:reaction-rental-products methods", function () {
  // TODO: depricate this in favor of rentalProducts/cloneVariant method
  describe("cloneRentalVariant", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "insert");

      expect(function () {
        Meteor.call("products/cloneVariant", Random.id(), Random.id());
      }).toThrow(new Meteor.Error(403, "Access Denied"));

      expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      done();
    });

    it("should clone rental variant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      _(variant.inventoryQuantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE"
        });
      });
      expect(ReactionCore.getVariants(product._id).length).toEqual(1);

      Meteor.call("products/cloneVariant", product._id, variant._id);
      expect(ReactionCore.getVariants(product._id).length).toEqual(2);
      done();
    });

    it("should have rental variant properties", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      _(variant.inventoryQuantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE"
        });
      });

      expect(_.size(ReactionCore.getVariants(product._id))).toEqual(1);
      Meteor.call("products/cloneVariant", product._id, variant._id);

      const updatedVariants = ReactionCore.getVariants(product._id);
      expect(_.size(updatedVariants)).toEqual(2);
      expect(updatedVariants[0].pricePerDay).toEqual(updatedVariants[1].pricePerDay);
      done();
    });
  });

  describe("createVariant", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      const product = Factory.create("rentalProduct");

      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        Meteor.call("products/createVariant", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();

      done();
    });

    it("should create rentalVariant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      Meteor.call("products/createVariant", product._id);

      const variants = ReactionCore.getVariants(product._id);
      expect(_.size(variants)).toEqual(1);

      const variant = variants[0];
      expect(variant.functionalType).toEqual("variant");
      done();
    });
  });

  describe("updateVariant", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        Meteor.call("products/updateVariant", { _id: "fakeId" });
      }).toThrow(new Meteor.Error(403, "Access Denied"));

      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      done();
    });
  });

  describe("createProduct", function () {
    // TODO: Need after.hook to create inventoryVariants
    xit("should have rental attributes", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const prodId = Meteor.call("products/createProduct");
      const product = ReactionCore.Collections.Products.findOne(prodId);
      const variant = product.variants[0];
      expect(product.type).toEqual("rental");
      expect(variant.events[0].title).toEqual("Inbounded");
      done();
    });
  });

// TODO: Depricate this in favor of advanced fulfillment solution.
  describe("rentalProducts/createInventoryEvent", function () {
    let productEvents = {};

    beforeEach(function () {
      // TODO: MOVE events to faker
      productEvents.ex1 = {
        title: "Left Warehouse",
        description: "Picked up by FedEx. Tracking #123456"
      };

      productEvents.ex2 = {
        title: "Delivered",
        description: "Delivered to Hotel",
        location: {
          address1: "564 Main Street",
          address2: "C/O Resort Hotel Guest in Room 123",
          city: "Telluride",
          region: "CO",
          postal: "81435",
          metafields: {
            key: "hotel",
            value: "Resort Hotel"
          }
        }
      };
    });

    it("should 403 error by non permissioned user", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(InventoryVariants, "update");
      expect(function () {
        Meteor.call("rentalProducts/createInventoryEvent", "fakeId", productEvents.ex1);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(InventoryVariants.update).not.toHaveBeenCalled();
      done();
    });

    it("should insert a new basic event for a given variant", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const inventoryVariant = Factory.create("inventoryVariant");
      Meteor.call("rentalProducts/createInventoryEvent", inventoryVariant._id, productEvents.ex1);

      const updatedInventory = InventoryVariants.findOne(inventoryVariant._id);
      expect(updatedInventory.events.length).toEqual(2);
      expect(updatedInventory.events[1].title).toEqual("Left Warehouse");
      done();
    });

    it("should insert a new complete event for a given variant", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const inventoryVariant = Factory.create("inventoryVariant");
      Meteor.call("rentalProducts/createInventoryEvent", inventoryVariant._id, productEvents.ex2);

      const updatedInventory = InventoryVariants.findOne(inventoryVariant._id);
      const inventoryEvent = updatedInventory.events[1];
      expect(updatedInventory.events.length).toEqual(2);
      expect(inventoryEvent.location.city).toEqual("Telluride");
      done();
    });
  });

  describe("rentalProducts/checkVariantAvailability", function () {
    it("should return array of available inventory variant ids", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      _(variant.inventoryQuantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE"
        });
      });
      const quantity = _.random(1, variant.inventoryQuantity);
      const inventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(inventoryVariants.count()).toEqual(variant.inventoryQuantity);

      const inventoryAvailable = Meteor.call("rentalProducts/checkInventoryAvailability", variant._id, {
        startTime: moment().startOf("day").add(3, "days").toDate(),
        endTime: moment().startOf("day").add(5, "days").toDate()
      }, quantity);
      expect(inventoryAvailable.length).toEqual(quantity);
      done();
    });

    it("should return array of available inventory variant ids up to the max inventory available", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      const quantity = variant.inventoryQuantity;
      const quantityRequested = 200;
      _(quantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE",
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call("rentalProducts/checkInventoryAvailability", variant._id, {
        startTime: moment().startOf("day").add(3, "days").toDate(),
        endTime: moment().startOf("day").add(5, "days").toDate()
      }, quantityRequested);

      expect(inventoryAvailable.length).toEqual(quantity);
      done();
    });

    it("should be return empty array if requested dates are booked for all inventory variants", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE",
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call("rentalProducts/checkInventoryAvailability", variant._id, {
        startTime: moment().startOf("day").add(10, "days").toDate(),
        endTime: moment().startOf("day").add(16, "days").toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });

    it("should be return empty array if requested dates are partially booked for all inventory variants", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      const quantity = variant.inventoryQuantity;
      _(quantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: variant._id,
          barcode: "BARCODE" + n,
          sku: "BARCODE",
          unavailableDates: faker.getoutfitted.takenDates
        });
      });

      const inventoryAvailable = Meteor.call("rentalProducts/checkInventoryAvailability", variant._id, {
        startTime: moment().startOf("day").add(4, "days").toDate(),
        endTime: moment().startOf("day").add(10, "days").toDate()
      }, 1);

      expect(inventoryAvailable.length).toEqual(0);
      done();
    });
  });

  describe("rentalProducts/createInventoryVariant", function () {
    it("should 403 error by non permissioned user", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(InventoryVariants, "insert");
      expect(function () {
        Meteor.call("rentalProducts/createInventoryVariant", "fakeId");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(InventoryVariants.insert).not.toHaveBeenCalled();
      done();
    });

    it("should create an inventory variant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      Meteor.call("rentalProducts/createInventoryVariant", variant._id);
      const inventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(inventoryVariants.count()).toEqual(1);
      expect(inventoryVariants.fetch()[0].unavailableDates).toEqual([]);
      expect(inventoryVariants.fetch()[0].active).toEqual(true);
      done();
    });

    it("should create an inventory variant with options by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      const options = { active: false, barcode: "BARCODE-234" };
      Meteor.call("rentalProducts/createInventoryVariant", variant._id, options);
      const inventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(inventoryVariants.count()).toEqual(1);
      expect(inventoryVariants.fetch()[0].unavailableDates).toEqual([]);
      expect(inventoryVariants.fetch()[0].active).toEqual(false);
      expect(inventoryVariants.fetch()[0].barcode).toEqual("BARCODE-234");
      done();
    });

    it("should create multiple inventory variants by passing qty by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      function hasBarcode(inventoryList, barcode) {
        return inventoryList.some(inventoryItem => barcode === inventoryItem.barcode);
      }
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      const options = { active: true, barcode: "BCODE" };
      Meteor.call("rentalProducts/createInventoryVariant", variant._id, options, 5);
      const inventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(inventoryVariants.count()).toEqual(5);
      expect(inventoryVariants.fetch()[0].unavailableDates).toEqual([]);
      expect(inventoryVariants.fetch()[0].active).toEqual(true);
      expect(hasBarcode(inventoryVariants.fetch(), "BCODE-0")).toBeTruthy();
      expect(hasBarcode(inventoryVariants.fetch(), "BCODE-1")).toBeTruthy();
      expect(hasBarcode(inventoryVariants.fetch(), "BCODE-4")).toBeTruthy();
      done();
    });
  });

  describe("rentalProducts/updateInventoryVariantField", function () {
    it("should 403 error by non permissioned user", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(InventoryVariants, "update");
      expect(function () {
        Meteor.call("rentalProducts/updateInventoryVariantField", "fakeId", "field", "value");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(InventoryVariants.update).not.toHaveBeenCalled();
      done();
    });

    it("should update a field of an inventory variant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      Meteor.call("rentalProducts/createInventoryVariant", variant._id);
      const inventoryVariants = InventoryVariants.find({productId: variant._id});
      const inventoryVariant = inventoryVariants.fetch()[0];
      expect(inventoryVariant.active).toEqual(true);

      Meteor.call("rentalProducts/updateInventoryVariantField", inventoryVariant._id, "active", false);
      const updatedInventoryVariants = InventoryVariants.find({productId: variant._id});
      const updatedInventoryVariant = updatedInventoryVariants.fetch()[0];
      expect(updatedInventoryVariant.active).toEqual(false);
      done();
    });
  });

  describe("rentalProducts/deleteInventoryVariant", function () {
    it("should 403 error by non permissioned user", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(InventoryVariants, "update");
      expect(function () {
        Meteor.call("rentalProducts/deleteInventoryVariant", "fakeId");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(InventoryVariants.update).not.toHaveBeenCalled();
      done();
    });

    it("should delete an inventory variant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });

      Meteor.call("rentalProducts/createInventoryVariant", variant._id);
      const inventoryVariants = InventoryVariants.find({productId: variant._id}).fetch();
      const inventoryVariant = inventoryVariants[0];
      expect(_.size(inventoryVariants)).toEqual(1);

      Meteor.call("rentalProducts/deleteInventoryVariant", inventoryVariant._id);
      const updatedInventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(updatedInventoryVariants.count()).toEqual(0);
      done();
    });

    it("should delete multiple inventory variants by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const product = Factory.create("rentalProduct");
      const variant = Factory.create("rentalVariant", {
        ancestors: [product._id]
      });
      Meteor.call("rentalProducts/createInventoryVariant", variant._id, {}, 5);
      const inventoryVariants = InventoryVariants.find({productId: variant._id}).fetch();
      const iv1 = inventoryVariants[0];
      const iv2 = inventoryVariants[1];
      expect(_.size(inventoryVariants)).toEqual(5);

      Meteor.call("rentalProducts/deleteInventoryVariant", [iv1._id, iv2._id]);
      const updatedInventoryVariants = InventoryVariants.find({productId: variant._id});
      expect(updatedInventoryVariants.count()).toEqual(3);
      done();
    });
  });
});
