describe 'getoutfitted:reaction-rental-products cart methods', ->
  describe 'rentalInventoryAdjust', ->
    beforeEach ->
      Products.remove {}
      Orders.remove {}
      
    it 'should reserve dates requested', (done) ->
      product = Factory.create 'rentalProduct'
      variant = product.variants[0]
      order = Factory.create 'rentalOrder', {
        startTime: new Date('2015-09-22T06:00:00.000Z'),
        endTime: new Date('2015-09-27T06:00:00.000Z'),
        items: [
          _id: Random.id()
          productId: product._id
          variants: variant
          quantity: 1
        ]
      }
      
      Meteor.call 'rentalInventoryAdjust', order._id
      product = Products.findOne(product._id)
      variant = product.variants[0]
      expect(variant.unavailableDates.length).toEqual 6
      done()
