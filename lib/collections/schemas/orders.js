import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Order} from '/lib/collections';

export const RentalOrder = new SimpleSchema([
  Order, {
    startTime: {
      type: Date,
      optional: true
    },
    endTime: {
      type: Date,
      optional: true
    }
  }
]);
