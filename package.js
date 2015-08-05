Package.describe({
  summary: 'Reaction Rental Products - Enable rental and for-hire products',
  name: 'getoutfitted:reaction-rental-products',
  version: '0.0.1',
  git: 'https://github.com/getoutfitted/reaction-rental-products.git'
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use('templating');
  api.use('coffeescript');
  api.use('less');
  api.use('underscore');
  api.use('dburles:factory@0.3.10');
  api.use('matb33:collection-hooks');
  api.use('meteor-platform@1.2.1');
  api.use('reactioncommerce:core@0.6.0', ['client', 'server']);
  
  api.imply('dburles:factory');
  api.imply('matb33:collection-hooks');
  
  api.addFiles([
    'server/register.coffee'
  ] ,['server']); // register as a reaction package
  
  api.addFiles([
    'server/factories.coffee',
    'server/methods/rentalProducts.coffee'
  ], ['server']);
  
  api.addFiles([
    'common/schemas.coffee', // Schema for rental products
    'common/hooks.coffee'
  ],['client', 'server']);
  });


Package.onTest(function(api) {
  api.use('coffeescript');
  api.use('underscore');
  api.use('sanjo:jasmine@0.15.2');
  api.use('velocity:html-reporter@0.7.1');
  api.use('velocity:console-reporter@0.1.2');

  api.use('reactioncommerce:core');
  api.use('getoutfitted:reaction-rental-products');
  api.use('reactioncommerce:bootstrap-theme');

  api.addFiles('tests/jasmine/server/integration/rentalProducts.coffee', 'server');
  
});
