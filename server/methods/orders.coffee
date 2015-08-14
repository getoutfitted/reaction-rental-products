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
      datesToReserve.push(iter.next().toDate())
    
    for orderProduct in order.items
      product = Products.findOne(orderProduct.productId)
      if product.productType == 'rental'
        # push start date minus pre-buffer days
        # loop through adding one day to array
        # stop when we get to end day + trailing buffer
        
        variantIds = Meteor.call 'checkInventoryAvailability',
          product._id,
          orderProduct.variants._id,
          {endTime: order.endTime, startTime: order.startTime},
          orderProduct.quantity
        
        unless variantIds.length == orderProduct.quantity
          new Meteor.Error 403, 'Available inventory and quantity
            requested do not match'

        # Not using $in because we need to determine the correct position
        # to insert the new dates separately for each inventoryVariant
        for variantId in variantIds
          # Get ordered list of reservedDates
          reservedDates = Products.findOne({
            _id: orderProduct.productId,
            'variants._id': variantId
          }, {'variants.$.unavailableDates'})
          
          # find the position that we should insert the resevedDates
          positionToInsert = _.sortedIndex(reservedDates, datesToReserve[0])
          # insert datesToReserve into the correct variants
          # at the correct position
          Products.update({
            _id: orderProduct.productId,
            "variants._id": variantId
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
