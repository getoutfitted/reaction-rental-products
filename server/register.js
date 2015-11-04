ReactionCore.registerPackage({
  name: 'rental-products',
  autoEnable: true,
  registry: [
    {
      provides: 'dashboard',
      label: 'Rental Products',
      route: 'dashboard.rentalProducts',
      description: 'Enables Rental / For Hire Products',
      icon: 'fa fa-calendar',
      cycle: '3'
    }, {
      provides: 'settings',
      route: 'dashboard/rentalShopSettings',
      label: 'Rental Product Settings',
      container: 'reaction-rental-products',
      template: 'rentalShopSettings'
    }, {
      provides: 'console',
      route: 'dashboard/rentalProducts',
      label: 'Rental Product Availability'
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
