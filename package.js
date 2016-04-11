Package.describe({
  summary: "Rental Product with Variants",
  name: "getoutfitted:reaction-rental-products",
  version: "0.4.0",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.versionsFrom("METEOR@1.2.1");

  // meteor base packages
  api.use("meteor-base");
  api.use("mongo");
  api.use("ecmascript");
  api.use("es5-shim");
  api.use("blaze-html-templates");
  api.use("session");
  api.use("jquery");
  api.use("tracker");

  // meteor add-on packages
  api.use("underscore");
  api.use("logging");
  api.use("reload");
  api.use("random");
  api.use("ejson");
  api.use("check");
  api.use("http");
  api.use("reactive-var");
  api.use("reactive-dict");

  // community packages
  api.use("reactioncommerce:reaction-router@1.1.0");
  api.use("reactioncommerce:core@0.12.0");
  api.use("reactioncommerce:reaction-product-variant@1.0.0");
  api.use("matb33:collection-hooks");

  // Collection packages
  api.use("aldeed:collection2@2.5.0");
  api.use("aldeed:simple-schema@1.3.3");

  // Rental Specific Packages
  api.use("momentjs:moment@2.10.6");
  api.use("momentjs:twix@0.7.0");
  api.use("rajit:bootstrap3-datepicker@1.4.1", ["client"]);

  // register package
  api.addFiles("server/register.js", "server");

  // RentalProducts object
  api.addFiles("common/common.js", ["client", "server"]);

  // Methods
  api.addFiles([
    "server/methods/rentalProducts.js",
    "server/methods/inventoryVariants.js",
    "server/methods/orders.js",
    "server/methods/cart.js",
    "server/hooks.js",
    "server/rentalProducts.js",
    "server/publications.js"
  ], ["server"]);

  // Schemas, Collections, and Hooks
  api.addFiles([
    "common/schemas/inventoryVariants.js",
    "common/schemas/rentalProducts.js", // Schema for rental products
    "common/schemas/rentalShops.js",
    "common/schemas/orders.js",
    "common/schemas/cart.js",
    "common/collections.js",
    "common/hooks.js"
  ], ["client", "server"]);

  // Settings Templates
  api.addFiles([
    "client/templates/dashboard/settings/rentalProductsSettings.html",
    "client/templates/dashboard/settings/rentalProductsSettings.js"
  ], ["client"]);

  // Dashboard Templates
  api.addFiles([
    "client/templates/dashboard/rentalProducts/productList.html",
    "client/templates/dashboard/rentalProducts/productList.js",
    "client/templates/dashboard/rentalProducts/availability/availability.html",
    "client/templates/dashboard/rentalProducts/availability/availability.js"
  ], ["client"]);

});

Package.onTest(function (api) {
  api.use("underscore");
  api.use("random");
  api.use("momentjs:moment");
  api.use("momentjs:twix");
  api.use("sanjo:jasmine@0.15.2");
  api.use("dburles:factory@0.3.10");
  api.use("velocity:html-reporter@0.9.1");
  api.use("velocity:console-reporter@0.1.4");

  api.use("reactioncommerce:reaction-checkout@1.0.0");
  api.use("reactioncommerce:reaction-collections@2.0.1");
  api.use("reactioncommerce:reaction-factories@0.4.2");
  api.use("reactioncommerce:core@0.12.0");
  api.use("getoutfitted:reaction-rental-products"); // Add our own package as a dep for testing!

  api.addFiles("server/factories.js", "server");
  api.addFiles("tests/jasmine/server/integration/rentalProducts.js", "server");
  api.addFiles("tests/jasmine/server/integration/orders.js", "server");
  api.addFiles("tests/jasmine/server/integration/cart.js", "server");
});
