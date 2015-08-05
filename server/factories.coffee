Factory.define 'rentalProduct',
  ReactionCore.Collections.Products, Factory.extend('product',
  
  productType: 'rental'
  preparationBuffer: 3
  variants: -> [
    _id: Random.id()
    active: true
    unavailableDates: []
    status: 'En Route'
    currentLocation:
      coords:
        x: 38.846127
        y: -104.800644
      city: 'Colorado Springs'
      region: 'CO'
      country: 'USA'
    compareAtPrice: _.random 0, 1000
    weight: _.random 0, 10
    inventoryManagement: true
    inventoryPolicy: false
    lowInventoryWarningThreshold: 1
    inventoryQuantity: _.random 0, 100
    price: _.random 10, 1000
    pricePerDay: _.random 10, 1000
    optionTitle: Fake.word()
    title: Fake.word()
    sku: _.random 0, 6
    taxable: true
    events: [
      _id: Random.id()
      createdAt: new Date
      location:
        coords:
          x: 38.846127
          y: -104.800644
      description: Fake.sentence(8)
      title: Fake.word()
    ]
    metafields: [
      key: Fake.word()
      value: Fake.word()
      scope: "detail"
    ,
      key: "facebook"
      value: Fake.paragraph()
      scope: "socialMessages"
    ,
      key: "twitter"
      value: Fake.sentence()
      scope: "socialMessages"
    ]
  ])
