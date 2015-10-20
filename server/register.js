ReactionCore.registerPackage({
  name: 'rental-products',
  autoEnable: false,
  registry: [
    {
      provides: 'dashboard',
      label: 'Rental Products',
      description: 'Enables Rental / For Hire Products',
      icon: 'fa fa-calendar',
      cycle: '2',
      container: 'dashboard'
    }, {
      route: 'rentalSettings',
      provides: 'settings',
      container: 'dashboard'
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
