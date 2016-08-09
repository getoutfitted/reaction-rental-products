import { Template } from 'meteor/templating';
import { Reaction } from '/client/api';
import { Packages } from '/lib/collections';
import { RentalProductsPackageConfig } from '../../../lib/collections/schemas';
import './rentalProductsSettings.html';

Template.rentalProductsSettings.helpers({
  RentalProductsPackageConfig() {
    return RentalProductsPackageConfig;
  },
  packageData: function () {
    return Packages.findOne({
      name: 'reaction-rental-products',
      shopId: Reaction.getShopId()
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
