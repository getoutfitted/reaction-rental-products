describe("getoutfitted:reaction-rental-products cart methods", function () {
  // Imported functions from reaction-core cart tests
  let user = Factory.create("user");
  const shop = faker.reaction.shops.getShop();
  let userId = user._id;
  // Required for creating a cart
  let originals = {};
  originals["mergeCart"] = Meteor.server
    .method_handlers["cart/mergeCart"];
  originals["copyCartToOrder"] = Meteor.server
    .method_handlers["cart/copyCartToOrder"];
  originals["addToCart"] = Meteor.server
    .method_handlers["cart/addToCart"];
  originals["setShipmentAddress"] = Meteor.server
    .method_handlers["cart/setShipmentAddress"];
  originals["setPaymentAddress"] = Meteor.server
    .method_handlers["cart/setPaymentAddress"];

  const sessionId = ReactionCore.sessionId = Random.id();

  function spyOnMethod(method, id) {
    return spyOn(Meteor.server.method_handlers, `cart/${method}`).and.callFake(
      function () {
        this.userId = id;
        return originals[method].apply(this, arguments);
      }
    );
  }

  afterAll(() => {
    Meteor.users.remove({});
  });
  
  describe("rentalProducts/setRentalPeriod", function () {    const quantity = 1;
    let product;
    let variant;
    let rentalProduct;
    let rentalVariant;
    let inventoryQuantity;

    beforeAll(() => {
      // this is needed for `inventory/register`
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      Products = ReactionCore.Collections.Products;
      Cart = ReactionCore.Collections.Cart;
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
          sku: "SKU123",
          unavailableDates: faker.getoutfitted.takenDates
        });
      });
    });

    beforeEach(function () {
      ReactionCore.Collections.Cart.remove({});
    });

    it("should set cart rental start and end times", function (done) {
      const cart = Factory.create("cart");
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, "days").toDate();
      const endTime = moment().add(daysTilRental + rentalLength, "days").toDate();
      spyOn(Meteor, "userId").and.returnValue(cart.userId);
      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);
      const updatedCart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(+updatedCart.startTime).toEqual(+startTime);
      expect(+updatedCart.endTime).toEqual(+endTime);
      done();
    });

    it("should set rental length in days", function (done) {
      const cart = Factory.create("cart");
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, "days").toDate();
      const endTime = moment().add(daysTilRental + rentalLength, "days").toDate();
      const lengthInDays = moment(startTime).twix(endTime).count("days");

      spyOn(Meteor, "userId").and.returnValue(cart.userId);
      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);

      const updatedCart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      done();
    });

    it("should set rental length in days with empty cart", function (done) {
      const cart = Factory.create("emptyCart");
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, "days").toDate();
      const endTime = moment().add(daysTilRental + rentalLength, "days").toDate();
      const lengthInDays = moment(startTime).twix(endTime).count("days");

      spyOn(Meteor, "userId").and.returnValue(cart.userId);
      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);

      const updatedCart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(lengthInDays);
      done();
    });

    it("should set rental length in hours", function (done) {
      const cart = Factory.create("cart");
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().add(daysTilRental, "days").toDate();
      const endTime = moment().add(daysTilRental + rentalLength, "days").toDate();
      const lengthInHours = moment(startTime).twix(endTime).count("hours");

      spyOn(Meteor, "userId").and.returnValue(cart.userId);
      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);

      const updatedCart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(updatedCart.rentalHours).toEqual(lengthInHours);
      done();
    });

    it("should round up to nearest unit of time", function (done) {
      const daysTilRental = _.random(7, 30);
      const cart = Factory.create("cart");
      const startTime = moment().add(daysTilRental, "days").toDate();
      const endTime = moment().add(daysTilRental, "days").endOf("day").toDate();
      spyOn(Meteor, "userId").and.returnValue(cart.userId);
      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);

      const updatedCart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(updatedCart.rentalDays).toEqual(1);
      done();
    });

    it("should update item prices in cart if cart rental length changes", function (done) {
      let cart = Factory.create("rentalCart", {items: []});
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().startOf("day").add(daysTilRental, "days").toDate();
      const endTime = moment().endOf("day").add(daysTilRental + rentalLength - 1, "days").toDate();
      const lengthInDays = moment(startTime).twix(endTime).count("days");

      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", rentalProduct._id, rentalVariant._id);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(cart.cartSubTotal()).toEqual(Number(rentalVariant.pricePerDay * cart.rentalDays).toFixed(2));

      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(cart.rentalDays).toEqual(lengthInDays);
      expect(cart.cartSubTotal()).toEqual(Number(rentalVariant.pricePerDay * cart.rentalDays).toFixed(2));
      done();
    });

    it("should only update rental item prices if cart rental length changes", function (done) {
      let cart = Factory.create("rentalCart", {items: []});
      const daysTilRental = _.random(7, 30);
      const rentalLength = _.random(1, 14);
      const startTime = moment().startOf("day").add(daysTilRental, "days").toDate();
      const endTime = moment().endOf("day").add(daysTilRental + rentalLength - 1, "days").toDate();
      const lengthInDays = moment(startTime).twix(endTime).count("days");

      // add simple and rental products to cart
      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", rentalProduct._id, rentalVariant._id);
      Meteor.call("cart/addToCart", product._id, variant._id);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);
      expect(cart.cartSubTotal()).toEqual(
        Number(rentalVariant.pricePerDay * cart.rentalDays + variant.price).toFixed(2));

      Meteor.call("rentalProducts/setRentalPeriod", cart._id, startTime, endTime);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);

      expect(cart.rentalDays).toEqual(lengthInDays);
      expect(cart.cartSubTotal()).toEqual(
        Number(rentalVariant.pricePerDay * cart.rentalDays + variant.price).toFixed(2));
      done();
    });
  });

  describe("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    beforeAll(() => {
      // this is needed for `inventory/register`
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      product = faker.reaction.products.add();
      productId = product._id;
      variantId = ReactionCore.Collections.Products.findOne({
        ancestors: [productId]
      })._id;
    });

    beforeEach(function () {
      ReactionCore.Collections.Cart.remove({});
    });

    it("should have standard product price if product is simple type", function (done) {
      let cart = Factory.create("rentalCart", {items: []});
      let items = cart.items.length;
      let initialSubTotal = cart.cartSubTotal();
      let variant = ReactionCore.Collections.Products.findOne({_id: variantId});
      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);

      expect(cart.items.length).toEqual(items + 1);
      expect(cart.items[cart.items.length - 1].productId).toEqual(productId);
      // This may not be robust enough. Javascript doesn't really have floats
      expect(cart.cartSubTotal()).toEqual((parseFloat(initialSubTotal) + parseFloat(variant.price)).toFixed(2));
      done();
    });

    it("should calculate rental price if product is rental type", function (done) {
      let cart = Factory.create("rentalCart", {items: []});
      const rentalProduct = Factory.create("rentalProduct");
      const rentalVariant = Factory.create("rentalVariant", {
        ancestors: [rentalProduct._id]
      });
      const invQuantity = rentalVariant.inventoryQuantity;
      _(invQuantity).times(function (n) {
        Factory.create("inventoryVariant", {
          productId: rentalVariant._id,
          barcode: "BARCODE" + n,
          sku: "SKU123",
          unavailableDates: faker.getoutfitted.takenDates
        });
      });
      spyOnMethod("addToCart", cart.userId);
      Meteor.call("cart/addToCart", rentalProduct._id, rentalVariant._id);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);

      expect(cart.items[0].variants.price).toEqual(rentalVariant.pricePerDay * cart.rentalDays);
      expect(cart.items[0].quantity).toEqual(1);
      expect(cart.items.length).toEqual(1);
      expect(cart.cartSubTotal()).toEqual(Number(rentalVariant.pricePerDay * cart.rentalDays).toFixed(2));
      done();
    });
  });
});
