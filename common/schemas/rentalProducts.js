ReactionCore.Schemas.RentalProductVariant = new SimpleSchema([
  ReactionCore.Schemas.ProductVariant, {
    functionalType: { // functionalType allows us to add-on to the schema for the `simple` and `variant` types
      type: String,   // and still maintain opportunity to have unique product types.
      optional: true,
      defaultValue: "variant" // "rentalVariant"
    },
    location: {
      label: "Warehouse Storage Location",
      type: String,
      optional: true
    },
    color: {
      type: String,
      optional: true
    },
    size: {
      type: String,
      optional: true
    },
    gender: {
      type: String,
      optional: true
    },
    pricePerDay: {
      label: "Daily Rate",
      type: Number,
      defaultValue: 0.0,
      decimal: true,
      min: 0,
      optional: true
    },
    // rentalPriceBucket: {
    //   type: [ReactionCore.Schemas.rentalPriceBucket],
    //   optional: true,
    // },
    workflow: { // XXX: Not 100% certain we need this here, definitely need it on inventory and product
      type: ReactionCore.Schemas.Workflow,
      optional: true
    }
  }
]);

ReactionCore.Schemas.RentalProduct = new SimpleSchema([
  ReactionCore.Schemas.Product, {
    functionalType: { // functionalType allows us to add-on to the schema for the `simple` and `variant` types
      type: String,   // and still maintain opportunity to have unique product types.
      optional: true,
      defaultValue: "simple" // "rental"
    },
    gender: {
      type: String,
      optional: true
    },
    colors: {
      type: [String],
      optional: true
    },
    sizes: {
      type: [String],
      optional: true
    },
    cleaningBuffer: {
      type: Number,
      defaultValue: 0,
      optional: true
    },
    productType: { // E.g. product category (Tent, Jacket)
      type: String,
      index: 1,
      optional: true
    }
  }
]);
