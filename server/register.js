ReactionCore.registerPackage({
  label: "Rental Products",
  name: "reaction-rental-products",
  icon: "fa fa-calendar",
  autoEnable: true,
  settings: {
    name: "Rental Products"
  },
  registry: [{
    route: "/dashboard/rental-products",
    name: "rentalProducts",
    template: "dashboardRentalProducts",
    label: "Rental Products",
    description: "Rental Products and Rental Inventory Tracking",
    container: "getoutfitted",
    icon: "fa fa-calendar",
    provides: "dashboard",
    priority: 2
  }, {
    route: "/dashboard/rental-products/settings",
    name: "rentalProducts.settings",
    template: "rentalProductsSettings",
    label: "Rental Products Settings",
    provides: "settings"
  }, {
    route: "/dashboard/rental-products/availability/:_id",
    name: "rentalProducts.availabilityById",
    template: "dashbaordRentalProductAvailability"
  }],
  layout: []
});
