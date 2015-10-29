// Uses variantForm helpers instead of rentalVariantForm helpers
// because template.replaces is weird like that. ¯\_(ツ)_/¯
Template.variantForm.helpers({
  isProductType: function (productType) {
    let product = selectedProduct();
    if (product) {
      if (product.type === productType) {
        return true;
      }
    }
    return false;
  }
});
