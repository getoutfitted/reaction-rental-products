Template.dashboardRentalProducts.onCreated(function () {
  Meteor.subscribe("rentalProducts");
});

Template.dashboardRentalProducts.helpers({
  rentalProducts: function () {
    return ReactionCore.Collections.Products.find({functionalType: "rental"});
  }
});

Template.dashboardRentalProduct.helpers({
  variants: function () {
    return ReactionCore.getVariants(this._id);
  }
});

Template.dashboardRentalProduct.events({
  "click tr": function () {
    ReactionRouter.go("rentalProducts.availabilityById", {_id: this._id});
  }
});
