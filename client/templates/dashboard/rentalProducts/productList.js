Template.dashboardRentalProducts.onCreated(function () {
  Meteor.subscribe("rentalProducts");
});

Template.dashboardRentalProducts.helpers({
  rentalProducts: function () {
    return ReactionCore.Collections.Products.find({functionalType: "rentalVariant"});
  }
});

Template.dashboardRentalProduct.helpers({
  parent: function () {
    return ReactionCore.Collections.Products.findOne(this.ancestors[0]);
  }
});

Template.dashboardRentalProduct.events({
  "click tr": function () {
    ReactionRouter.go("rentalProducts.availabilityById", {_id: this._id});
  }
});
