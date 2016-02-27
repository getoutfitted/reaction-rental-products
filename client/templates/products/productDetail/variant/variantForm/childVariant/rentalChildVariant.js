Template.childVariantForm.helpers({
  isProductType: function (productType) {
    let product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.type === productType) {
        return true;
      }
    }
    return false;
  }
});
