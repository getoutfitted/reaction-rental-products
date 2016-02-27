Template.productDetail.helpers({
  isProductType: function (productType) {
    let product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.type === productType) {
        return 'true';
      }
    }
    return null;
  },
  actualRentalOrPurchasablePrice: function () {
    const current = ReactionProduct.selectedVariant();
    const product = ReactionProduct.selectedProduct();
    let childVariants;
    let purchasableOrRentable;
    let priceType = 'price';
    if (product && product.type === 'rental') {
      priceType = 'pricePerDay';
    }
    if (product && current) {
      childVariants = (function () {
        let _results = [];
        for (let variant of product.variants) {
          if ((variant !== null ? variant.parentId : void 0) === current._id) {
            _results.push(variant);
          }
        }
        return _results;
      })();
      purchasableOrRentable = childVariants.length > 0 ? false : true;
    }
    if (purchasableOrRentable) {
      return current[priceType];
    }
    return getProductPriceOrPricePerDayRange();
  }
});

Template.productDetail.events({
  'change #productTypeSelect': function (event) {
    let product = ReactionProduct.selectedProduct();
    let productType = event.currentTarget.value;
    Meteor.call('rentalProducts/setProductType', product._id, productType);
  }
});
