Meteor.methods
  ###
  # adjust inventory when an order is placed
  ###
  rentalInventoryAdjust: (orderId) ->
    check orderId, String

    order = Orders.findOne orderId
    return false unless order
    
    iter = moment(order.startTime)
      .twix(order.endTime, {allDay: true})
      .iterate('days')
    
    datesToReserve = []
    
    while iter.hasNext()
      datesToReserve.push(iter.next().format())
    
    for orderProduct in order.items
      product = Products.findOne(orderProduct.productId)
      if product.productType == 'rental'
        # push start date minus pre-buffer days
        # loop through adding one day to array
        # stop when we get to end day + trailing buffer
        
        # Get ordered list of reservedDates
        reservedDates = Products.findOne({
          _id: orderProduct.productId,
          'variants._id': orderProduct.variants._id
        }, {'variants.$.unavailableDates'})
        
        # find the position that we should insert the resevedDates
        positionToInsert = _.sortedIndex(reservedDates, datesToReserve[0])

        # insert datesToReserve into the correct variant at the correct position
        Products.update({
          _id: orderProduct.productId,
          "variants._id": orderProduct.variants._id
        }, {$push: {
          "variants.$.unavailableDates": {
            $each: datesToReserve,
            $position: positionToInsert}}})
      else
        Products.update {
          _id: product.productId,
          "variants._id": product.variants._id
        }, {$inc: {"variants.$.inventoryQuantity": -orderProduct.quantity }}
    return
