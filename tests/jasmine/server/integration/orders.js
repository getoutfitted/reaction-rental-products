describe("getoutfitted:reaction-rental-products orders methods", function () {
  let product;
  let variant;
  let rentalProduct;
  let rentalVariant;
  let inventoryQuantity;

  describe("rentalProducts/inventoryAdjust", function () {
    beforeAll(() => {
      // this is needed for `inventory/register`
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      InventoryVariants.remove({});
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

    it("should reserve dates requested if available", function (done) {
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

    it("should error if dates requested are not available", function (done) {
      // Tests
      done();
    });

    it("should reserve most booked inventory item available", function (done) {
      // This is tested in above test now
      done();
    });
  });

  describe("rentalProducts/inventoryAdjust - insert dates into correct position", function () {
    let iter;
    let firstDays;
    let firstStart;
    let firstEnd;
    let secondStart;
    let secondEnd;

    beforeAll(() => {
      // this is needed for `inventory/register`
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      rentalProduct = Factory.create("rentalProduct");
      rentalVariant = Factory.create("rentalVariant", {
        ancestors: [rentalProduct._id],
        inventoryQuantity: 1
      });
      firstDays = [];
      firstStart = moment().startOf("day").add(5, "days").toDate();
      firstEnd = moment().startOf("day").add(7, "days").toDate();
      iter = moment(firstStart).twix(firstEnd, {allDay: true}).iterate("days");
      while (iter.hasNext()) { firstDays.push(iter.next().toDate()); }

      secondDays = [];
      secondStart = moment().startOf("day").add(14, "days").toDate();
      secondEnd = moment().startOf("day").add(16, "days").toDate();
      iter = moment(secondStart).twix(secondEnd, {allDay: true}).iterate("days");
      while (iter.hasNext()) { secondDays.push(iter.next().toDate()); }
    });

    beforeEach(()=> {
      ReactionCore.Collections.Orders.remove({});
      InventoryVariants.remove({});
      inventoryVariant = Factory.create("inventoryVariant", {
        productId: rentalVariant._id,
        barcode: "BARCODE",
        sku: "SKU123",
        unavailableDates: []
      });
      Meteor.call("rentalProducts/reserveInventoryVariantForDates", inventoryVariant._id, {
        startTime: firstStart,
        endTime: firstEnd
      });
      Meteor.call("rentalProducts/reserveInventoryVariantForDates", inventoryVariant._id, {
        startTime: secondStart,
        endTime: secondEnd
      });
    });

    it("should insert dates into beginning position when all other dates are after", function (done) {
      const start = moment().startOf("day").add(1, "days").toDate();
      const end = moment().startOf("day").add(4, "days").toDate();
      let days = [];
      iter = moment(start).twix(end, {allDay: true}).iterate("days");
      while (iter.hasNext()) { days.push(iter.next().toDate()); }

      const order = Factory.create("rentalOrder", {
        startTime: start,
        endTime: end,
        items: [
          {
            _id: faker.random.uuid(),
            productId: rentalProduct._id,
            variants: rentalVariant,
            quantity: 1,
            functionalType: "rental"
          }
        ]
      });
      let previouslyBookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;

      expect(_.isEqual(firstDays.concat(secondDays), previouslyBookedDates)).toBeTruthy();
      Meteor.call("rentalProducts/inventoryAdjust", order._id);

      let bookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;
      expect(_.isEqual(days.concat(firstDays.concat(secondDays)), bookedDates)).toBeTruthy();
      done();
    });

    it("should insert dates into middle position when other dates are before and after", function (done) {
      const start = moment().startOf("day").add(8, "days").toDate();
      const end = moment().startOf("day").add(12, "days").toDate();
      let days = [];
      iter = moment(start).twix(end, {allDay: true}).iterate("days");
      while (iter.hasNext()) { days.push(iter.next().toDate()); }

      const order = Factory.create("rentalOrder", {
        startTime: start,
        endTime: end,
        items: [
          {
            _id: faker.random.uuid(),
            productId: rentalProduct._id,
            variants: rentalVariant,
            quantity: 1,
            functionalType: "rental"
          }
        ]
      });
      let previouslyBookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;

      expect(_.isEqual(firstDays.concat(secondDays), previouslyBookedDates)).toBeTruthy();
      Meteor.call("rentalProducts/inventoryAdjust", order._id);

      let bookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;
      expect(_.isEqual(firstDays.concat(days.concat(secondDays)), bookedDates)).toBeTruthy();
      done();
    });

    it("should insert dates into last position when all other dates are before", function (done) {
      const start = moment().startOf("day").add(19, "days").toDate();
      const end = moment().startOf("day").add(20, "days").toDate();
      let days = [];
      iter = moment(start).twix(end, {allDay: true}).iterate("days");
      while (iter.hasNext()) { days.push(iter.next().toDate()); }

      const order = Factory.create("rentalOrder", {
        startTime: start,
        endTime: end,
        items: [
          {
            _id: faker.random.uuid(),
            productId: rentalProduct._id,
            variants: rentalVariant,
            quantity: 1,
            functionalType: "rental"
          }
        ]
      });
      let previouslyBookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;

      expect(_.isEqual(firstDays.concat(secondDays), previouslyBookedDates)).toBeTruthy();
      Meteor.call("rentalProducts/inventoryAdjust", order._id);

      let bookedDates = InventoryVariants.findOne({}, {sort: {numberOfDatesBooked: -1}}).unavailableDates;
      expect(_.isEqual(firstDays.concat(secondDays.concat(days)), bookedDates)).toBeTruthy();
      done();
    });
  });

  describe("rentalProducts/reserveInventoryVariantForDates", () => {
    let iter;
    let firstDays;
    let firstStart;
    let firstEnd;
    let secondStart;
    let secondEnd;

    beforeAll(() => {
      // this is needed for `inventory/register`
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      rentalProduct = Factory.create("rentalProduct");
      rentalVariant = Factory.create("rentalVariant", {
        ancestors: [rentalProduct._id],
        inventoryQuantity: 1
      });

      reservedDays = [];
      reservedStart = moment().startOf("day").add(4, "days").toDate();
      reservedEnd = moment().startOf("day").add(16, "days").toDate();
      iter = moment(reservedStart).twix(reservedEnd, {allDay: true}).iterate("days");
      while (iter.hasNext()) { reservedDays.push(iter.next().toDate()); }
    });

    beforeEach(()=> {
      ReactionCore.Collections.Orders.remove({});
      InventoryVariants.remove({});
      inventoryVariant = Factory.create("inventoryVariant", {
        productId: rentalVariant._id,
        barcode: "BARCODE",
        sku: "SKU123",
        unavailableDates: reservedDays,
        numberOfDatesBooked: reservedDays.length
      });
    });

    it("should reserve available inventory for dates requested", done => {
      let inv = ReactionCore.Collections.InventoryVariants.findOne();
      expect(inv.unavailableDates.length).toEqual(13);
      Meteor.call("rentalProducts/reserveInventoryVariantForDates", inventoryVariant._id, {
        startTime: moment().startOf("day").add(1, "days").toDate(),
        endTime: moment().startOf("day").add(3, "days").toDate()
      });
      inv = ReactionCore.Collections.InventoryVariants.findOne();
      expect(inv.unavailableDates.length).toEqual(16);
      return done();
    });

    it("should throw 409 error if requested inventory is already booked", done => {
      let inv = ReactionCore.Collections.InventoryVariants.findOne();
      let resReq = {
        startTime: moment().startOf("day").add(2, "days").toDate(),
        endTime: moment().startOf("day").add(4, "days").toDate()
      };
      expect(inv.unavailableDates.length).toEqual(13);
      expect(() => {
        Meteor.call("rentalProducts/reserveInventoryVariantForDates", inventoryVariant._id, resReq);
      }).toThrow(new Meteor.Error(409, `Could not insert reservation ${resReq} `
        + `for Inventory Variant: ${inventoryVariant._id} - There is a conflict with an existing reservation.`));

      inv = ReactionCore.Collections.InventoryVariants.findOne();
      expect(inv.unavailableDates.length).toEqual(13);
      return done();
    });

    it("should throw 404 error if requested inventory is not found", done => {
      let id = "FakeId";
      let resReq = {
        startTime: moment().startOf("day").add(2, "days").toDate(),
        endTime: moment().startOf("day").add(4, "days").toDate()
      };
      expect(() => {
        Meteor.call("rentalProducts/reserveInventoryVariantForDates", id, resReq);
      }).toThrow(new Meteor.Error(404, `Could not insert reservation ${resReq} `
        + `for Inventory Variant: ${id} - Inventory Variant not found!`));
      return done();
    });
  });
});
