ReactionCore.registerPackage({
  name: 'rental-products',
  autoEnable: true,
  registry: [
    {
      provides: 'dashboard',
      label: 'Rental Products',
      route: 'dashboard/rentalProducts',
      description: 'Enables Rental / For Hire Products',
      icon: 'fa fa-calendar',
      cycle: '3',
      container: 'reaction-rental-products'
    }, {
      provides: 'settings',
      route: 'dashboard/rentalProducts',
      label: 'Rental Product Settings',
      container: 'reaction-rental-products',
      template: 'rentalShopSettings'
    }, {
      route: 'createRentalType',
      label: 'Create Rental Product',
      icon: 'fa fa-plus',
      provides: 'shortcut'
    }
  ],
  permissions: [
    {
      label: 'Rentals',
      permission: 'ReactionCore.Collections.RentalTypes',
      group: 'Shop Settings'
    }
  ]
});
