ReactionCore.Schemas.Coordinates = new SimpleSchema
  x:
    label: 'Longitude'
    type: Number
    decimal: true
  y:
    label: 'Latitude'
    type: Number
    decimal: true

ReactionCore.Schemas.Location = new SimpleSchema
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
    type: ReactionCore.Schemas.Coordinates
    optional: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true

ReactionCore.Schemas.ProductEvent = new SimpleSchema
  _id:
    type: String
    defaultValue: Random.id()
  createdAt:
    type: Date
    defaultValue: new Date()
  title:
    type: String
  location:
    type: ReactionCore.Schemas.Location
    optional: true
  description:
    type: String
    optional: true

ReactionCore.Schemas.RentalProductVariant = new SimpleSchema([
  ReactionCore.Schemas.ProductVariant
  {
    active:
      type: Boolean
      optional: true
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
    currentLocation:
      type: ReactionCore.Schemas.Location
      optional: true
    events:  # A place to store rental and service history
      type: [ReactionCore.Schemas.ProductEvent]
      optional: true
      defaultValue: [
        _id: Random.id()
        createdAt: new Date
        title: 'Inbounded'
        description: 'Added to Inventory'
      ]
    # rentalPrice:
    #   type: [ReactionCore.Schemas.PriceBucket]
    pricePerDay:
      label: 'Daily Rate'
      type: Number
      defaultValue: 0.0
      decimal: true
      min: 0
      optional: true
    pricePerWeek:
      label: 'Weekly Rate'
      type: Number
      defaultValue: 0.0
      decimal: true
      min: 0
      optional: true
  }
])

ReactionCore.Schemas.RentalProduct = new SimpleSchema([
  ReactionCore.Schemas.Product
  {
    variants:
      type: [ReactionCore.Schemas.RentalProductVariant]
    productType:
      type: String
      defaultValue: 'rental'
    preparationBuffer:
      type: Number
      optional: true
  }
])

ReactionCore.Collections.Products.attachSchema(
  ReactionCore.Schemas.RentalProduct)
  
