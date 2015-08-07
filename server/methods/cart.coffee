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
      datesReserved.push(iter.next().format())
    
    for product in order.items
      if product.type == 'rental'
        # push start date minus pre-buffer days
        # loop through adding one day to array
        # stop when we get to end day + trailing buffer
        Products.update {
          _id: product.productId,
          "variants._id": product.variants._id
        }, {$push: {"variants.$.unavailableDates": {$each: datesToReserve}}}
      else
        Products.update {
          _id: product.productId,
          "variants._id": product.variants._id
        }, {$inc: {"variants.$.inventoryQuantity": -product.quantity }}
    return
