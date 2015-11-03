Template.rentalShopSettings.helpers({
  shop: function () {
    return ReactionCore.Collections.Shops.findOne();
  }
});

AutoForm.hooks({
  rentalShopEditForm: {
    onSuccess: function () {
      return Alerts.add('Shop general settings saved.', 'success', {
        autoHide: true
      });
    },
    onError: function (operation, error) {
      return Alerts.add('Shop general settings update failed. ' + error, 'danger');
    }
  }
});
