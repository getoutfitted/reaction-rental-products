let sharedId = Random.id();

let takenDates = [
  moment().startOf('day').add(10, 'days').toDate(),
  moment().startOf('day').add(11, 'days').toDate(),
  moment().startOf('day').add(12, 'days').toDate(),
  moment().startOf('day').add(13, 'days').toDate(),
  moment().startOf('day').add(14, 'days').toDate(),
  moment().startOf('day').add(15, 'days').toDate(),
  moment().startOf('day').add(16, 'days').toDate()
];

function randomVariant(type, variantSharedId, variantTakenDates) {
  return {
    _id: type === 'parent' ? variantSharedId : Random.id(),
    parentId: type === 'parent' ? '' : variantSharedId,
    type: type === 'inventory' ? 'inventory' : 'rentalVariant',
    active: true,
    unavailableDates: type === 'inventory' ? variantTakenDates : [],
    status: 'En Route',
    currentLocation: {
      coords: {
        x: 38.846127,
        y: -104.800644
      },
      city: 'Colorado Springs',
      region: 'CO',
      country: 'USA'
    },
    compareAtPrice: faker.random.number(1000),
    weight: faker.random.number(10),
    inventoryManagement: true,
    inventoryPolicy: false,
    lowInventoryWarningThreshold: 1,
    inventoryQuantity: faker.random.number(100),
    price: _.random(10, 1000),
    pricePerDay: _.random(10, 1000),
    optionTitle: faker.hacker.adjective(),
    title: faker.hacker.noun(),
    sku: faker.random.number(6),
    taxable: true,
    events: [
      {
        _id: Random.id(),
        createdAt: new Date,
        location: {
          coords: {
            x: 38.846127,
            y: -104.800644
          }
        },
        description: faker.hacker.phrase(),
        title: faker.commerce.productName()
      }
    ],
    metafields: [
      {
        key: faker.hacker.noun(),
        value: faker.commerce.productMaterial(),
        scope: 'detail'
      }, {
        key: 'facebook',
        value: faker.hacker.phrase(),
        scope: 'socialMessages'
      }, {
        key: 'twitter',
        value: faker.hacker.phrase(),
        scope: 'socialMessages'
      }
    ]
  };
}

Factory.define('rentalProduct', ReactionCore.Collections.Products, Factory.extend('product', {
  productType: 'rental',
  preparationBuffer: 3,
  variants: function () {
    return [
      randomVariant('random', '')
    ];
  }
}));

Factory.define('rentalProductWithInventory', ReactionCore.Collections.Products, Factory.extend('rentalProduct', {
  variants: function () {
    return [
      randomVariant('parent', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('inventory', sharedId, takenDates),
      randomVariant('random', '')
    ];
  }
}));

Factory.define('rentalCart', ReactionCore.Collections.Cart, Factory.extend('order', {
  startTime: new Date,
  endTime: new Date
}));

Factory.define('rentalOrder', ReactionCore.Collections.Orders, Factory.extend('order', {
  startTime: new Date,
  endTime: new Date
}));
