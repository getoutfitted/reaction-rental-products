describe 'getoutfitted:reaction-rental-products orders methods', ->
  describe 'rentalInventoryAdjust', ->
    beforeEach ->
      Products.remove {}
      Orders.remove {}
      
    it 'should reserve dates requested', (done) ->
      product = Factory.create 'rentalProduct'
      variant = product.variants[0]
      daysTilRental = _.random 7, 30
      rentalLength = _.random 1, 14
      quantity = 1
      order = Factory.create 'rentalOrder', {
        startTime: moment().startOf('day').add(daysTilRental, 'days').toDate(),
        endTime: moment().startOf('day').add(
          daysTilRental + rentalLength, 'days').toDate(),
        items: [
          _id: Random.id()
          productId: product._id
          variants: variant
          quantity: quantity
        ]
      }
      
      preInventoryAvailable = Meteor.call(
        'checkInventoryAvailability',
        product._id,
        variant._id,
        {
          startTime: moment().startOf('day').add(
            daysTilRental, 'days').toDate(),
          endTime: moment().startOf('day').add(
            daysTilRental + rentalLength, 'days').toDate()
        },
        quantity)
      
      Meteor.call 'rentalInventoryAdjust', order._id
      product = Products.findOne(product._id)
      variant = product.variants[0]
      expect(variant.unavailableDates.length).toEqual (rentalLength + 1)
      
      postInventoryAvailable = Meteor.call(
        'checkInventoryAvailability',
        product._id,
        variant._id,
        {
          startTime: moment().startOf('day').add(
            daysTilRental, 'days').toDate(),
          endTime: moment().startOf('day').add(
            daysTilRental + rentalLength, 'days').toDate()
        },
        quantity)
        
      expect(postInventoryAvailable.length + quantity).toEqual(
        preInventoryAvailable.length)

      done()
