Package.describe({
  summary: 'Reaction Rental Products - Enable rental and for-hire products',
  name: 'getoutfitted:reaction-rental-products',
  version: '0.0.1',
  git: 'https://github.com/getoutfitted/reaction-rental-products.git'
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0');
  api.use('meteor-platform@1.2.1');
  api.use('templating');
  api.use('coffeescript');
  api.use('less');
  api.use('reactioncommerce:core@0.6.0', ['client', 'server']);
  
  api.addFiles('server/register.coffee',['server']); // register as a reaction package
  
  api.addFiles([
    'common.schemas.coffee' // Schema for rental products
  ],['client', 'server']);
  });
