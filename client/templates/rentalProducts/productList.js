import { Template } from 'meteor/templating';
import { Products } from '/lib/collections';
import { Reaction } from '/client/api';

import './productList.html';

Template.dashboardRentalProducts.onCreated(function () {
  this.subscribe("rentalProducts");
});

Template.dashboardRentalProducts.helpers({
  rentalProducts: function () {
    return Products.find({functionalType: "rentalVariant"});
  }
});

Template.dashboardRentalProduct.helpers({
  parent: function () {
    return Products.findOne(this.ancestors[0]);
  }
});

Template.dashboardRentalProduct.events({
  "click tr": function () {
    Reaction.Router.go("rentalProducts.availabilityById", {_id: this._id});
  }
});
