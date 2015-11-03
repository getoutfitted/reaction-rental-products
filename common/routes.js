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
