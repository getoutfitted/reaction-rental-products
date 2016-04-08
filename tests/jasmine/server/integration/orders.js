describe("getoutfitted:reaction-rental-products orders methods", function () {
  let product;
  let variant;
  let rentalProduct;
  let rentalVariant;
  let inventoryQuantity;

  beforeAll(() => {
    // this is needed for `inventory/register`
    spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    InventoryVariants.remove({});
    Products = ReactionCore.Collections.Products;
    product = faker.reaction.products.add();
    productId = product._id;
    variant = ReactionCore.Collections.Products.findOne({
      ancestors: [productId]
    });
    variantId = variant._id;
    rentalProduct = Factory.create("rentalProduct");
    rentalVariant = Factory.create("rentalVariant", {
      ancestors: [rentalProduct._id]
    });
    inventoryQuantity = rentalVariant.inventoryQuantity;
    _(inventoryQuantity).times(function (n) {
      Factory.create("inventoryVariant", {
        productId: rentalVariant._id,
        barcode: "BARCODE" + n,
        sku: "SKU123"
      });
    });
    // give all inventoryVariants variable amounts of booked dates between 30 and 60 days out
    const existingInventory = InventoryVariants.find({productId: rentalVariant._id}).fetch();
    existingInventory.forEach(function (inv) {
      const tmpDaysUntil = _.random(30, 60);
      const tmpRentalLength = _.random(1, 29);
      Meteor.call("rentalProducts/reserveInventoryVariantForDates", inv._id, {
        startTime: moment().startOf("day").add(tmpDaysUntil, "days").toDate(),
        endTime: moment().startOf("day").add(tmpDaysUntil + tmpRentalLength, "days").toDate()
      });
    });
  });

  describe("rentalProducts/inventoryAdjust", function () {
    it("should reserve dates requested", function (done) {
      const daysTilRental = _.random(7, 28);
      const rentalLength = _.random(1, 14);
      const quantityRequested = 1;
      const order = Factory.create("rentalOrder", {
        startTime: moment().startOf("day").add(daysTilRental, "days").toDate(),
        endTime: moment().startOf("day").add(daysTilRental + rentalLength, "days").toDate(),
        items: [
          {
            _id: faker.random.uuid(),
            productId: rentalProduct._id,
            variants: rentalVariant,
            quantity: quantityRequested,
            functionalType: "rental"
          }
        ]
      });
      // TODO: Figure out why this is returning more than the requested number of inventoryVariants
      const preInventoryAvailable = Meteor.call("rentalProducts/checkInventoryAvailability", rentalVariant._id, {
        startTime: moment().startOf("day").add(daysTilRental, "days").toDate(),
        endTime: moment().startOf("day").add(daysTilRental + rentalLength, "days").toDate()
      }, quantityRequested);
      expect(preInventoryAvailable.length).toEqual(quantityRequested);

      previouslyBookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates.length;
      Meteor.call("rentalProducts/inventoryAdjust", order._id);
      const updatedInventoryVariant = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}});
      // Rental Length + 1 because we add rentalLength days to the first day.
      expect(updatedInventoryVariant.unavailableDates.length).toEqual(previouslyBookedDates + rentalLength + 1);
      done();
    });

    it("should reserve most booked inventory item available", function (done) {
      // This is tested in above test now
      done();
    });

    it("should insert dates into correct position", function (done) {
      // TODO: Add Tests
      done();
    });
  });
});
