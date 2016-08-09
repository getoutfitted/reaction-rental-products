import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { PackageConfig } from '/lib/collections/schemas/registry';

export const RentalProductsPackageConfig = new SimpleSchema([
  PackageConfig, {
    'settings.turnaroundTime': {
      type: Number,
      optional: true,
      defaultValue: 1
    }
  }
]);
