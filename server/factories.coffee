sharedId = Random.id()

takenDates = [
  moment().startOf('day').add(10, 'days').toDate(),
  moment().startOf('day').add(11, 'days').toDate(),
  moment().startOf('day').add(12, 'days').toDate(),
  moment().startOf('day').add(13, 'days').toDate(),
  moment().startOf('day').add(14, 'days').toDate(),
  moment().startOf('day').add(15, 'days').toDate(),
  moment().startOf('day').add(16, 'days').toDate()
]

randomVariant = (type, sharedId, taken) ->
  _id: if type is 'parent' then sharedId else Random.id()
  parentId: if type is 'parent' then '' else sharedId
  type: if type is 'inventory' then 'inventory' else 'rentalVariant'
  active: true
  unavailableDates: if type is 'inventory' then takenDates else []
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


Factory.define 'rentalProduct',
  ReactionCore.Collections.Products, Factory.extend('product',
  
  productType: 'rental'
  preparationBuffer: 3
  variants: -> [
    randomVariant('random', '')
  ])


Factory.define 'rentalProductWithInventory',
  ReactionCore.Collections.Products, Factory.extend('rentalProduct',
  variants: -> [
    randomVariant('parent', sharedId)
    randomVariant('inventory', sharedId)
    randomVariant('inventory', sharedId)
    randomVariant('inventory', sharedId)
    randomVariant('inventory', sharedId)
    randomVariant('inventory', sharedId)
    randomVariant('random', '')
  ])


Factory.define 'rentalCart',
  ReactionCore.Collections.Cart, Factory.extend('order',
  startTime: new Date
  endTime: new Date)

Factory.define 'rentalOrder',
  ReactionCore.Collections.Orders, Factory.extend('order',
  
  startTime: new Date
  endTime: new Date)
