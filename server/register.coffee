ReactionCore.registerPackage
  name: 'rental-products' # usually same as meteor package
  autoEnable: false # auto-enable in dashboard
  # settings: # private package settings config (blackbox)
  #   some_secret: "xxxx"
  registry: [
    # all options except route and template
    # are used to describe the
    # dashboard 'app card'.
    {
      provides: 'dashboard'
      label: 'Rental Products'
      description: "Enables Rental / For Hire Products"
      icon: 'fa fa-calendar' # glyphicon/fa
      cycle: '2' # Core, Stable, Testing (0 indexed)
      container: 'dashboard'  #group this with settings
    }
    # configures settings link for app card
    # use 'group' to link to dashboard card
    {
      route: 'rentalSettings'
      provides: 'settings'
      container: 'dashboard'
    }
    {
      route: 'rentals'
      label: 'Rentals'
      provides: 'shortcut'
      icon: 'fa fa-plus'
    }
    {
      route: 'createRentalType'
      label: 'Create Rental Type'
      icon: 'fa fa-plus'
      provides: 'shortcut'
    }
  ]
  # array of permission objects
  permissions: [
    {
      label: "Rentals"
      permission: "ReactionCore.Collections.RentalTypes"
      group: "Shop Settings"
    }
  ]
