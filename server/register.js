ReactionCore.registerPackage({
  label: 'Rental Products',
  name: 'rental-products',
  icon: 'fa fa-calendar',
  autoEnable: true,
  registry: [{
    // Provides Dashboard Card
    // Route from card renders template specified in the dashboard when clicking
    // the card or the arrow on the card
    // Links to main rentalProducts list
    route: '/dashboard/rentalProducts',
    provides: 'dashboard',
    name: 'rentalProducts',
    label: 'Rental Products',
    description: 'Enables rental products for your shop',
    icon: 'fa fa-calendar',
    container: 'getoutfitted',
    template: 'dashboardRentalProducts',
    workflow: 'coreRentalWorkflow',
    layout: 'coreRentalLayout',
    priority: 1
  }, {
    // Provides Dashboard Settings Pane
    // Provides link to dashboard settings pane from 'gear' icon on dashboard card
    route: '/dashboard/rentalProducts/settings',
    provides: 'settings',
    label: 'Rental Products Settings',
    name: 'rentalProducts.settings',
    template: 'rentalShopSettings'
  }, {
    // Route for rentalProduct availability by id template
    route: '/dashboard/rentalProducts/:_id',
    name: 'rentalProducts.availabilityById',
    template: 'dashboardRentalProductAvailability',
    workflow: 'coreRentalWorkflow'
  }, {
    // Route for generic datepicker
    route: '/datepicker',
    name: 'rentalProducts.datepicker',
    template: 'rentalProductsDatepicker',
    workflow: 'coreWorkflow'
  }],

  layout: [{
    workflow: 'coreRentalWorkflow',
    layout: 'coreRentalLayout',
    theme: 'default',
    enabled: true,
    structure: {
      template: 'rentalShopSettings',
      layoutHeader: 'layoutHeader',
      layoutFooter: '',
      notFound: 'notFound',
      dashboardHeader: 'dashboardHeader',
      dashboardControls: 'accountsDashboardControls',
      dashboardHeaderControls: '',
      adminControlsFooter: 'adminControlsFooter'
    }
  }]
});
