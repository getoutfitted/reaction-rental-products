import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Cart, CartItem} from '/lib/collections/schemas';
import { RentalProductVariant } from './rentalProducts';

export const RentalCartItem = new SimpleSchema([
  CartItem, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    },
    productType: {
      type: String,
      optional: true
    },
    functionalType: {
      type: String,
      optional: true
    },
    variants: {
      type: RentalProductVariant
    }
  }
]);

export const RentalCart = new SimpleSchema([
  Cart, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    },
    rentalMonths: {
      type: Number,
      optional: true
    },
    rentalWeeks: {
      type: Number,
      optional: true
    },
    rentalDays: {
      type: Number,
      optional: true
    },
    rentalHours: {
      type: Number,
      optional: true
    },
    rentalMinutes: {
      type: Number,
      optional: true
    },
    items: {
      type: [ RentalCartItem ],
      optional: true
    }
  }
]);
