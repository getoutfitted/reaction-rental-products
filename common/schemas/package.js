ReactionCore.Schemas.RentalProductsPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    'settings.turnaroundTime': {
      type: Number,
      optional: true,
      defaultValue: 1
    }
  }
]);
