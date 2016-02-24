ReactionCore.registerPackage({
  label: 'Rental Products',
  name: 'rental-products',
  icon: 'fa fa-calendar',
  autoEnable: true,
  registry: [{
    // Provides Dashboard Card
    // Route from card renders template specified in the dashboard when clicking
    // the card or the arrow on the card
    route: '/dashboard/rentalProducts',
    provides: 'dashboard',
    name: 'rentalProducts',
    label: 'Rental Products',
    description: 'Enables rental products for your shop',
    icon: 'fa fa-calendar',
    container: 'getoutfitted',
    template: 'rentalShopSettings',
    workflow: 'coreRentalWorkflow',
    priority: 1
  }, {
    // Provides Dashboard Settings Pane
    // Provides link to dashboard settings pane from 'gear' icon on dashboard card
    provides: 'settings',
    label: 'Rental Products Settings',
    route: '/dashboard/rentalProducts/settings',
    name: 'rentalProducts.settings',
    template: 'rentalShopSettings'
  }],
  layout: [{
    workflow: 'coreRentalWorkflow',
    layout: 'coreLayout',
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
