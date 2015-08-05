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
