GetOutfitted = GetOutfitted || {};
GetOutfitted.Schemas = GetOutfitted.Schemas || {};
GetOutfitted.Schemas.RentalPriceBucket = new SimpleSchema({
  // Moment time unit
  timeUnit: {
    label: "Time Unit",
    type: String,
    optional: true,
    defaultValue: "days",
    allowedValues: [
      "years",
      "quarters",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
      "milliseconds"
    ]
  },
  duration: {
    label: "Amount of specified time periods",
    type: Number,
    optional: true,
    defaultValue: 6
  },
  price: {
    label: "Rental price for this duration",
    type: Number,
    optional: true,
    decimal: true,
    defaultValue: 150
  }
});

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
    numberSize: { // For sorting purposes
      type: Number,
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
    rentalPriceBuckets: {
      label: "Rental Prices",
      type: [ReactionCore.Schemas.RentalPriceBucket],
      optional: true
    },
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
