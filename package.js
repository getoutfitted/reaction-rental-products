Package.describe({
  summary: 'Reaction Rental Products - Enable rental and for-hire products',
  name: 'getoutfitted:reaction-rental-products',
  version: '0.0.1',
  git: 'https://github.com/getoutfitted/reaction-rental-products.git'
});

Npm.depends({
  faker: '3.0.1'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use('templating');
  api.use('coffeescript');
  api.use('underscore');
  api.use('ecmascript');
  api.use('momentjs:moment@2.10.6');
  api.use('momentjs:twix@0.7.0');
  api.use('dburles:factory@0.3.10');
  api.use('matb33:collection-hooks');
  api.use('meteor-platform@1.2.1');
  api.use('reactioncommerce:core@0.6.0', ['client', 'server']);

  api.imply('momentjs:moment');
  api.imply('momentjs:twix');

  api.addFiles([
    'server/register.js'
  ], ['server']); // register as a reaction package

  api.addFiles([
    'server/factories.js',
    'server/methods/rentalProducts.coffee',
    'server/methods/orders.coffee'

  ], ['server']);

  api.addFiles([
    'common/schemas/rentalProducts.js', // Schema for rental products
    'common/schemas/orders.js',
    'common/schemas/cart.js',
    'common/collections.js',
    'common/hooks.js'
  ], ['client', 'server']);
});

Package.onTest(function (api) {
  api.use('coffeescript');
  api.use('underscore');
  api.use('momentjs:moment');
  api.use('momentjs:twix');
  api.use('sanjo:jasmine@0.15.2');
  api.use('velocity:html-reporter@0.7.1');
  api.use('velocity:console-reporter@0.1.2');

  api.use('reactioncommerce:core');
  api.use('getoutfitted:reaction-rental-products');
  api.use('reactioncommerce:bootstrap-theme');

  api.addFiles('tests/jasmine/server/integration/rentalProducts.coffee', 'server');
  api.addFiles('tests/jasmine/server/integration/orders.coffee', 'server');
});
