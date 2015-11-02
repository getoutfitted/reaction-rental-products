Package.describe({
  summary: 'Reaction Rental Products - Enable rental and for-hire products',
  name: 'getoutfitted:reaction-rental-products',
  version: '0.0.2',
  git: 'https://github.com/getoutfitted/reaction-rental-products.git'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.2.1');
  api.use('templating');
  api.use('underscore');
  api.use('ecmascript');
  api.use('random');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.0');
  api.use('matb33:collection-hooks');
  api.use('meteor-platform@1.2.1');
  api.use('reactioncommerce:core@0.9.4', ['client', 'server']);
  api.use('aldeed:template-extension@3.4.3');
  api.use('aldeed:autoform@5.7.1');
  api.use('rajit:bootstrap3-datepicker@1.4.1', ['client']);

  api.imply('momentjs:moment'); // Make moment available to all packages
  api.imply('momentjs:twix'); // Make moment twix available to all packages

  api.addFiles([
    'server/register.js'
  ], ['server']); // register as a reaction package

  api.addFiles([
    'server/methods/rentalProducts.js',
    'server/methods/orders.js',
    'server/methods/cart.js',
    'server/hooks.js'
  ], ['server']);

  api.addFiles([
    'common/schemas/rentalProducts.js', // Schema for rental products
    'common/schemas/orders.js',
    'common/schemas/cart.js',
    'common/collections.js',
    'common/hooks.js',
    'common/routes.js'
  ], ['client', 'server']);

  // Helpers
  api.addFiles([
    'client/helpers/products.js'
  ], ['client']);

  // templates
  api.addFiles([
    'client/templates/cart/cartDrawer/rentalCartDrawer.html',
    'client/templates/products/productGrid/productGrid.html',
    'client/templates/products/productGrid/productGrid.js',
    'client/templates/products/productDetail/rentalProductDetail.html',
    'client/templates/products/productDetail/rentalProductDetail.js',
    'client/templates/products/productDetail/variant/variant.html',
    'client/templates/products/productDetail/variant/variant.js',
    'client/templates/products/productDetail/variant/variantForm/rentalVariantForm.html',
    'client/templates/products/productDetail/variant/variantForm/rentalVariantForm.js',
    'client/templates/products/productDetail/variant/variantForm/childVariant/rentalChildVariant.html',
    'client/templates/products/productDetail/variant/variantForm/childVariant/rentalChildVariant.js',
    'client/datepicker.html',
    'client/datepicker.js',
    'client/templates.js'
  ], ['client']);
});

Package.onTest(function (api) {
  api.use('underscore');
  api.use('random');
  api.use('momentjs:moment');
  api.use('momentjs:twix');
  api.use('sanjo:jasmine@0.15.2');
  api.use('dburles:factory@0.3.10');
  api.use('velocity:html-reporter@0.9.1');
  api.use('velocity:console-reporter@0.1.4');

  api.use('reactioncommerce:core');
  api.use('reactioncommerce:reaction-factories');
  api.use('reactioncommerce:bootstrap-theme');
  api.use('getoutfitted:reaction-rental-products'); // Add our own package as a dep for testing!

  api.addFiles('server/factories.js', 'server');
  api.addFiles('tests/jasmine/server/integration/rentalProducts.js', 'server');
  api.addFiles('tests/jasmine/server/integration/orders.js', 'server');
  api.addFiles('tests/jasmine/server/integration/cart.js', 'server');
});
