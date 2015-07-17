ReactionCore.Schemas.Location = new SimpleSchema
  _id:
    type: String
    defaultValue: Random.id()
    optional: true
  address1:
    label: "Address 1"
    type: String
    optional: true
  address2:
    label: "Address 2"
    type: String
    optional: true
  city:
    type: String
    label: "City"
    optional: true
  region:
    label: "State/Province/Region"
    type: String
    optional: true
  postal:
    label: "ZIP/Postal Code"
    type: String
    optional: true
  country:
    type: String
    label: "Country"
    optional: true
  coords:
    type: Object
    optional: true
  'coords.x':
    label: 'Longitude'
    type: Number
    decimal: true
    optional: true
  'coords.y'
    label: 'Latitude'
    type: Number
    decimal: true
    optional: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true

ReactionCore.Schemas.rentalProductVariant = new SimpleSchema([
  ReactionCore.Schemas.ProductVariant
  {
    active:
      type: Boolean
      defaultValue: true
      index: 1
    unavailableDates:
      type: [Date]
      defaultValue: []
      optional: true
      index: 1
    status:
      type: String
      optional: true
    currentLocationn:
      type: ReactionCore.Schemas.Location
      optional: true
    events:  # A place to store rental and service history
      type: [Object]
      optional: true
    'events.$.startDate':
      type: Date
    'events.$.endDate':
      type: Date
    'events.$.event':
      type: String
    'events.$.location':
      type: ReactionCore.Schemas.Location
      optional: true
    # rentalPrice:
    #   type: [ReactionCore.Schemas.PriceBucket]
    pricePerDay:
      label: 'Daily Rate'
      type: Number
      decimal: true
      min: 0
    pricePerWeek:
      label: 'Weekly Rate'
      type: Number
      decimal: true
      min: 0
      optional: true
  }
])

ReactionCore.Schemas.rentalProduct = new SimpleSchema([
  ReactionCore.Schemas.Product
  {
    productType:
      type: String
      defaultValue: 'rental'
    preparationBuffer:
      type: Number
      optional: true
  }
])
