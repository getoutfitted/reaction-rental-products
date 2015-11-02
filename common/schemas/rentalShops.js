ReactionCore.Schemas.RentalShop = new SimpleSchema([
  ReactionCore.Schemas.Shop, {
    rentalShippingBuffer: {
      type: Number,
      optional: true
    },
    rentalReturnBuffer: {
      type: Number,
      optional: true
    },
    rentalShippingBufferExclusionZipCodes: {
      type: [String],
      optional: true
    }
  }
]);
