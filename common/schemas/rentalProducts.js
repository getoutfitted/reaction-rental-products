ReactionCore.Schemas.RentalProductVariant = new SimpleSchema([
  ReactionCore.Schemas.ProductVariant, {
    type: {
      type: String,
      defaultValue: "rentalVariant"
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
    workflow: {
      type: ReactionCore.Schemas.Workflow,
      optional: true
    }
  }
]);

ReactionCore.Schemas.RentalProduct = new SimpleSchema([
  ReactionCore.Schemas.Product, {
    type: {
      type: String,
      defaultValue: "rental"
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

// Update ProductVariant because it's checked against in core in certain methods.
// ReactionCore.Schemas.ProductVariant = ReactionCore.Schemas.RentalProductVariant;
// ReactionCore.Schemas.Product = ReactionCore.Schemas.RentalProduct;
