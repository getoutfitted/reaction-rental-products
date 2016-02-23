ReactionCore.registerPackage({
  label: 'Rental Products',
  name: 'rental-products',
  icon: 'fa fa-calendar',
  autoEnable: true,
  settings: {},
  registry: [{
    route: '/dashboard/rentalProducts',
    name: 'rentalProducts',
    provides: 'dashboard',
    label: 'Rental Products',
    description: 'Enables rental products for your shop',
    icon: 'fa fa-calendar',
    container: 'core',
    template: 'rentalShopSettings',
    workflow: 'coreWorkflow',
    priority: 2
  }],
  layout: [{
    layout: 'coreAdminLayout',
    workflow: 'coreWorkflow',
    theme: 'default',
    enabled: true,
    structure: {
      template: 'rentalShopSettings',
      layoutHeader: 'layoutHeader',
      layoutFooter: '',
      notFound: 'notFound',
      dashboardHeader: 'dashboardHeader',
      dashboardControls: 'accountsDashboardControls', // TODO: Update this for Rental Products
      dashboardHeaderControls: '',
      adminControlsFooter: 'adminControlsFooter'
    }
  }]
});
