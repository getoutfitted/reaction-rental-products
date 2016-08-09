ReactionCore.Schemas.UnavailableDay = new SimpleSchema({
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

ReactionCore.Schemas.Location = new SimpleSchema({
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
  },
  coords: {
    type: ReactionCore.Schemas.Coordinates,
    optional: true
  },
  metafields: {
    type: [ReactionCore.Schemas.Metafield],
    optional: true
  }
});

ReactionCore.Schemas.ProductEvent = new SimpleSchema({
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
    type: ReactionCore.Schemas.Location,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

ReactionCore.Schemas.InventoryVariants = new SimpleSchema({
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
    type: [ReactionCore.Schemas.ProductEvent],
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
    type: [ReactionCore.Schemas.UnavailableDay],
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
    type: ReactionCore.Schemas.Workflow,
    optional: true
  }
});
