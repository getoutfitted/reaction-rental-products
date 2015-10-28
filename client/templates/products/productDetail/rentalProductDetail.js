Template.productDetail.helpers({
  isProductType: function (productType) {
    let product = selectedProduct();
    if (product) {
      if (product.type === productType) {
        return 'true';
      }
    }
    return null;
  }
});

Template.productDetail.events({
  'change #productTypeSelect': function (event) {
    let product = selectedProduct();
    let productType = event.currentTarget.value;
    Meteor.call('rentalProducts/setProductType', product._id, productType);
  }
});
