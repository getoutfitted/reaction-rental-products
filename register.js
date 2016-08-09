import { Reaction } from "/server/api";
Reaction.registerPackage({
  label: "Scout",
  name: "reaction-rental-products",
  icon: "fa fa-calendar",
  autoEnable: true,
  settings: {
    name: "Scout"
  },
  registry: [{
    route: "/dashboard/rental-products",
    name: "rentalProducts",
    template: "dashboardRentalProducts",
    label: "Scout",
    description: "Rental Products and Rental Inventory Tracking",
    container: "getoutfitted",
    icon: "fa fa-calendar",
    provides: "dashboard",
    priority: 2
  }, {
    route: "/dashboard/rental-products/settings",
    name: "rentalProducts.settings",
    template: "rentalProductsSettings",
    label: "Scout Settings",
    provides: "settings"
  }, {
    route: "/dashboard/rental-products/availability/:_id",
    name: "rentalProducts.availabilityById",
    template: "dashboardRentalProductAvailability"
  }],
  layout: []
});
