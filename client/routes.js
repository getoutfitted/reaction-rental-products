// let shopHandle;
// Tracker.autorun(function () {
//   if (ReactionCore.ready()) {
//     shopHandle = ReactionCore.getShopName().toLowerCase();
//   }
// });

// let rentalProductRoutes = ReactionRouter.group({
//   prefix: `/dashboard/rentalProducts`,
//   name: 'rentalProducts'
// });

// rentalProductRoutes.route('/test', {
//   name: 'rentalProducts.dashboard',
//   action: function () {
//     BlazeLayout.render('coreAdminLayout', {
//       layoutHeader: 'layoutHeader',
//       dashboardHeader: 'dashboardHeader',
//       template: 'dashboardRentalProducts',
//       layoutFooter: 'layoutFooter',
//       dashboardControls: 'dashboardControls'
//     });
//   }
// });
//
// rentalProductRoutes.route('/availability/:_id', {
//   name: 'rentalProducts.availabilityById',
//   action: function () {
//     BlazeLayout.render('coreAdminLayout', {
//       layoutHeader: 'layoutHeader',
//       dashboardHeader: 'dashboardHeader',
//       template: 'dashboardRentalProductAvailability', //'rentalProducts.availabilityById'
//       layoutFooter: 'layoutFooter',
//       dashboardControls: 'dashboardControls'
//     });
//   }
// });
//
// rentalProductRoutes.route('/datepicker', {
//   name: 'datepicker',
//   action: function () {
//     BlazeLayout.render('coreAdminLayout', {
//       layoutHeader: 'layoutHeader',
//       dashboardHeader: 'dashboardHeader',
//       template: 'rentalProductsDatepicker',
//       layoutFooter: 'layoutFooter',
//       dashboardControls: 'dashboardControls'
//     });
//   }
// });
//
// rentalProductRoutes.route('/settings', {
//   name: 'rentalProducts.settings',
//   action: function () {
//     BlazeLayout.render('coreAdminLayout', {
//       layoutHeader: 'layoutHeader',
//       dashboardHeader: 'dashboardHeader',
//       template: 'rentalShopSettings',
//       layoutFooter: 'layoutFooter',
//       dashboardControls: 'dashboardControls'
//     });
//   }
// });

// rentalProductRoutes.route('/', {
//   name: 'rentalProducts.dashboard',
//   action: function () {
//     BlazeLayout.render('coreAdminLayout', {
//       layoutHeader: 'layoutHeader',
//       dashboardHeader: 'dashboardHeader',
//       template: 'dashboardRentalProducts',
//       layoutFooter: 'layoutFooter',
//       dashboardControls: 'dashboardControls'
//     });
//   }
// });
//

// Router.route('datepicker', {
//   path: 'datepicker',
//   template: 'rentalProductsDatepicker',
//   controller: RentalProductsController
// });

// Router.route('dashboard/rentalShopSettings', {
//   name: 'dashboard.rentalShopSettings',
//   controller: ShopAdminController,
//   path: '/dashboard/rentalShopSettings',
//   template: 'rentalShopSettings',
//   waitOn: function () {
//     return ReactionCore.Collections.Shops;
//   }
// });

// Router.route('dashboard/rentalProducts', {
//   name: 'dashboard.rentalProducts',
//   controller: RentalProductsAdminController,
//   template: 'dashboardRentalProducts',
//   waitOn: function () {
//     return this.subscribe('Products');
//   },
//   data: function () {
//     if (this.params.type) {
//       return {
//         rentalProducts: ReactionCore.Collections.Products.find({type: this.params.type})
//       };
//     }
//     return {
//       rentalProducts: ReactionCore.Collections.Products.find({type: 'rental'})
//     };
//   }
// });

// Router.route('dashboard/rentalProducts/availability/:_id', {
//   name: 'dashboard.rentalProducts.availability',
//   controller: RentalProductsAdminController,
//   template: 'dashboardRentalProductAvailability',
//   waitOn: function () {
//     return this.subscribe('Product', this.params._id);
//   },
//   data: function () {
//     return ReactionCore.Collections.Products.findOne(this.params._id);
//   }
// });


// let ShopController = RouteController.extend({
//   onAfterAction: function () {
//     return ReactionCore.MetaData.refresh(this.route, this.params);
//   },
//   yieldTemplates: {
//     layoutHeader: {
//       to: 'layoutHeader'
//     },
//     layoutFooter: {
//       to: 'layoutFooter'
//     },
//     dashboard: {
//       to: 'dashboard'
//     }
//   }
// });
//
// let ShopAdminController = ShopController.extend({
//   onBeforeAction: function () {
//     if (!ReactionCore.hasPermission(this.route.getName())) {
//       this.render('layoutHeader', {
//         to: 'layoutHeader'
//       });
//       this.render('layoutFooter', {
//         to: 'layoutFooter'
//       });
//       this.render('unauthorized');
//     } else {
//       this.next();
//     }
//   }
// });
//
// RentalProductsController = ShopController.extend({
//   onBeforeAction: function () {
//     let rentalProducts = ReactionCore.Collections.Packages.findOne({
//       name: 'rental-products'
//     });
//     if (!rentalProducts.enabled) {
//       this.render('notFound');
//     } else {
//       this.next();
//     }
//   }
// });
//
// RentalProductsAdminController = ShopAdminController.extend({
//   onBeforeAction: function () {
//     let rentalProducts = ReactionCore.Collections.Packages.findOne({
//       name: 'rental-products'
//     });
//     if (!rentalProducts.enabled) {
//       this.render('notFound');
//     } else {
//       this.next();
//     }
//   }
// });
