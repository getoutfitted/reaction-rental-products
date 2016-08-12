import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Workflow } from '/lib/collections/schemas/workflow';
import RentalProducts from '../../api';

export const UnavailableDay = new SimpleSchema({
  date: {
    label: "Unavailable Date",
    type: Date
  },
  reason: {
    label: "Unavailable Reason",
    type: String,
    optional: true,
    defaultValue: "In Use" // "In Transit - Delivery", "In Transit - Return", "Return Processing"
  },
  orderId: {
    label: "Order ID",
    type: String,
    optional: true
  },
  orderNumber: {
    label: "Human Readable Order Number",
    type: Number,
    optional: true
  }
});

export const Location = new SimpleSchema({
  address1: {
    label: 'Address 1',
    type: String,
    optional: true
  },
  address2: {
    label: 'Address 2',
    type: String,
    optional: true
  },
  city: {
    type: String,
    label: 'City',
    optional: true
  },
  region: {
    label: 'State/Province/Region',
    type: String,
    optional: true
  },
  postal: {
    label: 'ZIP/Postal Code',
    type: String,
    optional: true
  },
  country: {
    type: String,
    label: 'Country',
    optional: true
  }
  // coords: {
  //   type: Coordinates,
  //   optional: true
  // },
  // metafields: {
  //   type: [Metafield],
  //   optional: true
  // }
});

export const ProductEvent = new SimpleSchema({
  _id: {
    type: String,
    defaultValue: Random.id()
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  title: {
    type: String
  },
  location: {
    type: Location,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

export const InventoryVariants = new SimpleSchema({
  _id: {
    type: String,
    autoValue: RentalProducts.schemaIdAutoValue,
    label: 'Inventory Item ID'
  },
  shopId: {
    type: String,
    label: 'Shop ID',
    optional: true
  },
  productId: { // 'Product / Variant that owns this inventory'
    type: String,
    optional: true,
    index: 1
  },
  sku: {
    type: String,
    optional: true
  },
  barcode: {
    type: String,
    optional: true
  },
  nickname: {
    type: String,
    optional: true
  },
  // color: {
  //   type: String,
  //   optional: true
  // },
  // size: {
  //   type: String,
  //   optional: true
  // },
  active: {
    type: Boolean,
    optional: true,
    defaultValue: true,
    index: 1
  },
  events: {
    type: [ProductEvent],
    optional: true,
    defaultValue: [
      {
        _id: Random.id(),
        createdAt: new Date(),
        title: 'Inbounded',
        description: 'Added to Inventory'
      }
    ]
  },
  unavailableDates: {
    type: [Date],
    optional: true,
    defaultValue: []
  },
  numberOfDatesBooked: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  unavailableDetails: {
    type: [UnavailableDay],
    optional: true,
    defaultValue: []
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    },
    optional: true
  },
  workflow: {
    type: Workflow,
    optional: true
  }
});
