ReactionCore.Schemas.RentalPeriod = new SimpleSchema({
  amount: {
    type: Number,
    defaultValue: 1
  },
  period: {
    type: String,
    defaultValue: "days"
  }
});

ReactionCore.Schemas.RentalShop = new SimpleSchema([
  ReactionCore.Schemas.Shop, {
    rentalShippingBuffer: {
      type: Number,
      optional: true,
      defaultValue: 0
    },
    minimumRentalPeriod: {
      type: ReactionCore.Schemas.RentalPeriod,
      defaultValue: {amount: 1, period: "days"}
    },
    rentalReturnBuffer: {
      type: Number,
      optional: true,
      defaultValue: 0
    },
    rentalShippingBufferExclusionZipCodes: {
      type: [String],
      optional: true,
      defaultValue: []
    }
  }
]);
