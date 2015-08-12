describe 'getoutfitted:reaction-rental-products methods', ->

  # Variant Method Tests

  describe 'cloneRentalVariant', ->

    beforeEach ->
      Products.remove {}

    it 'should throw 403 error by non admin', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue false
      product = Factory.create 'rentalProduct'
      spyOn(Products, 'insert')
      expect(-> Meteor.call 'cloneVariant',
        product._id, product.variants[0]._id).toThrow(
        new Meteor.Error 403, 'Access Denied')
      expect(Products.insert).not.toHaveBeenCalled()
      done()

    it 'should have rental variant properties', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      product = Factory.create 'rentalProduct'
      expect(_.size(product.variants)).toEqual 1
      Meteor.call 'cloneVariant', product._id, product.variants[0]._id
      product = Products.findOne(product._id)
      expect(_.size(product.variants)).toEqual 2
      expect(product.variants[0].unavailableDates).toEqual []
      expect(product.variants[1].unavailableDates).toEqual []
      expect(product.variants[0].active).toEqual true
      expect(product.variants[1].active).toEqual true
      done()

    it 'should clone rental variant by admin', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      product = Factory.create 'rentalProduct'
      expect(_.size(product.variants)).toEqual 1
      Meteor.call 'cloneVariant', product._id, product.variants[0]._id
      product = Products.findOne(product._id)
      expect(_.size(product.variants)).toEqual 2
      done()
  
  describe 'createVariant', ->
  
    beforeEach ->
      Products.remove {}
  
    it 'should throw 403 error by non admin', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue false
      product = Factory.create 'rentalProduct'
      spyOn(Products, 'update')
      expect(-> Meteor.call 'createVariant',
        product._id).toThrow(
        new Meteor.Error 403, 'Access Denied')
      expect(Products.update).not.toHaveBeenCalled()
      done()
  
    it 'should create variant by admin', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      product = Factory.create 'rentalProduct'
      expect(_.size(product.variants)).toEqual 1
      Meteor.call 'deleteVariant', product.variants[0]._id
      Meteor.call 'createVariant', product._id
      product = Products.findOne(product._id)
      expect(_.size(product.variants)).toEqual 1
      variant = product.variants[0]

      expect(variant.type).toEqual 'rentalVariant'
      expect(variant.title).toEqual ''
      expect(variant.price).toEqual 0
      done()
  
  describe 'updateVariant', ->
  
    beforeEach ->
      Products.remove {}
  
    it 'should throw 403 error by non admin', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue false
      product = Factory.create 'product'
      spyOn(Products, 'update')
      
      expect(-> Meteor.call 'updateVariant', product.variants[0]).toThrow(
        new Meteor.Error 403, 'Access Denied'
      )
      
      expect(Products.update).not.toHaveBeenCalled()
      done()

  describe 'createProduct', ->
    beforeEach ->
      Products.remove {}

    it 'should have rental attributes', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      prodId = Meteor.call 'createProduct'

      product = Products.findOne(prodId)
      variant = product.variants[0]
      expect(product.productType).toEqual 'rental'
      expect(variant.events[0].title).toEqual 'Inbounded'
      expect(variant.active).toEqual true
      done()

  describe 'createProductEvent', ->
    productEvents = {}
    
    beforeEach ->
      Products.remove {}
      productEvents.ex1 =
        title: 'Left Warehouse'
        description: 'Picked up by FedEx. Tracking #123456'
      productEvents.ex2 =
        title: 'Delivered'
        description: 'Delivered to Hotel'
        location:
          address1: '564 Main Street'
          address2: 'C/O Resort Hotel Guest in Room 123'
          city: 'Telluride'
          region: 'CO'
          postal: '81435'
          metafields:
            key: 'hotel'
            value: 'Resort Hotel'
    
    it 'should 403 error by non permissioned user', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue false
      product = Factory.create 'product'
      spyOn(Products, 'update')
      
      expect(-> Meteor.call(
        'createProductEvent', product.variants[0]._id, productEvents.ex1)
      ).toThrow(new Meteor.Error 403, 'Access Denied')
      
      expect(Products.update).not.toHaveBeenCalled()
      done()
      
    it 'should insert a new basic event for a given variant', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      product = Factory.create 'rentalProduct'
      variantId = product.variants[0]._id
      
      Meteor.call 'createProductEvent', variantId, productEvents.ex1
      updatedProduct = Products.findOne(product._id)
      variant = updatedProduct.variants[0]
      
      expect(variant.events.length).toEqual 2
      expect(variant.events[1].title).toEqual 'Left Warehouse'
      done()

    it 'should insert a new complete event for a given variant', (done) ->
      spyOn(Roles, 'userIsInRole').and.returnValue true
      product = Factory.create 'rentalProduct'
      variantId = product.variants[0]._id
      
      Meteor.call 'createProductEvent', variantId, productEvents.ex2
      updatedProduct = Products.findOne(product._id)
      variant = updatedProduct.variants[0]
      event = variant.events[1]
      
      expect(variant.events.length).toEqual 2
      expect(event.location.city).toEqual 'Telluride'
      done()

  describe 'checkVariantAvailability', ->
    
    beforeEach ->
      Products.remove {}
      
    it 'should return array of available inventory variants', (done) ->
      product = Factory.create 'rentalProductWithInventory'
      variant = product.variants[0]
      expect(product.variants.length).toEqual 7
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id)
      inventoryAvailable = Meteor.call(
        'checkInventoryAvailability',
        product._id,
        variant._id,
        {
          startTime: moment().startOf('day').add(3, 'days').toDate(),
          endTime: moment().startOf('day').add(5, 'days').toDate()
        },
        1)
      console.log(inventoryAvailable)
      expect(inventoryAvailable.length).toEqual 1
      done()
      
    it 'should be return empty array if requested dates are booked', (done) ->
      product = Factory.create 'rentalProductWithInventory'
      variant = product.variants[0]
      expect(product.variants.length).toEqual 7
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id)
      inventoryAvailable = Meteor.call(
        'checkInventoryAvailability',
        product._id,
        variant._id,
        {
          startTime: moment().startOf('day').add(10, 'days').toDate(),
          endTime: moment().startOf('day').add(16, 'days').toDate()
        },
        1)
      console.log(inventoryAvailable)
      expect(inventoryAvailable.length).toEqual 0
      done()
  
    it 'should be return empty array if
      requested dates are partially booked ', (done) ->

      product = Factory.create 'rentalProductWithInventory'
      variant = product.variants[0]
      expect(product.variants.length).toEqual 7
      expect(product.variants[3].parentId).toEqual(product.variants[0]._id)
      inventoryAvailable = Meteor.call(
        'checkInventoryAvailability',
        product._id,
        variant._id,
        {
          startTime: moment().startOf('day').add(4, 'days').toDate(),
          endTime: moment().startOf('day').add(10, 'days').toDate()
        },
        1)
      console.log(inventoryAvailable)
      expect(inventoryAvailable.length).toEqual 0
      done()
