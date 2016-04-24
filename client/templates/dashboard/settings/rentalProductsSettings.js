Template.rentalProductsSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: 'reaction-rental-products',
      shopId: ReactionCore.getShopId()
    });
  }
});

AutoForm.hooks({
  'rental-products-update-form': {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add('Rental Products settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add('Rental Products settings update failed. ' + error, 'danger');
    }
  }
});
