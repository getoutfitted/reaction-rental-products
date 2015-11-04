RentalProductsController = ShopController.extend({
  onBeforeAction: function () {
    let rentalProducts = ReactionCore.Collections.Packages.findOne({
      name: 'rental-products'
    });
    if (!rentalProducts.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

RentalProductsAdminController = ShopAdminController.extend({
  onBeforeAction: function () {
    let rentalProducts = ReactionCore.Collections.Packages.findOne({
      name: 'rental-products'
    });
    if (!rentalProducts.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

Router.route('datepicker', {
  path: 'datepicker',
  template: 'rentalProductsDatepicker',
  controller: RentalProductsController
});

Router.route('dashboard/rentalProducts', {
  controller: ShopAdminController,
  path: '/dashboard/rentalProducts',
  template: 'rentalShopSettings',
  waitOn: function () {
    return ReactionCore.Collections.Shops;
  }
});

Router.route('dashboard/products', {
  name: 'adminProductList',
  controller: RentalProductsAdminController,
  template: 'dashboardRentalProducts',
  waitOn: function () {
    return this.subscribe('Products');
  },
  data: function () {
    return {
      rentalProducts: ReactionCore.Collections.Products.find({type: 'rental'})
    };
  }
});
