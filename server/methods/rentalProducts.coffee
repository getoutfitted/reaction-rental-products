# dateBinarySearch = (dates, date) ->
#   min = 0
#   max = dates.length -1
#
#   while min <= max
#     guess = Math.floor((min + max) / 2)
#
#     if +dates[guess] == +date
#       return guess
#     else
#       if +dates[guess] < +date
#         min = guess + 1
#       else
#         max = guess - 1
#
#   return -1

# Helper function to see if any of the requestedDates are already reserved.
# reservedDates is an array of sorted dates that
#   is not guaranteed to be consecutive
# requestedDates is an array of sorted dates that is guaranteed consecutive
checkAvailability = (reservedDates, requestedDates) ->

  for date in requestedDates

    # Basic binary search to search through dates
    min = 0
    max = reservedDates.length - 1
    
    while min <= max
      guess = Math.floor((min + max) / 2)
      
      if +reservedDates[guess] == +date
        return false
      else
        if +reservedDates[guess] < +date
          min = guess + 1
        else
          max = guess - 1

  return true
  

Meteor.methods
  ###
  # Push an event to a specific variant
  # params:
  #   variantId - the id of the variant to which we are adding a product event
  #   eventDoc - An object containing the information for the event
  ###
  createProductEvent: (variantId, eventDoc) ->
    check variantId, String
    check eventDoc, {
      title: String,
      location: Match.Optional({
        address1: Match.Optional(String),
        address2: Match.Optional(String),
        city: Match.Optional(String),
        region: Match.Optional(String),
        postal: Match.Optional(String),
        country: Match.Optional(String),
        coords: Match.Optional({
          x: Number,
          y: Number
        }),
        metafields: Match.Optional(Object)
      }),
      description: Match.Optional(String)
    }
    
    unless ReactionCore.hasPermission('createProductEvent')
      throw new Meteor.Error 403, "Access Denied"
    @unblock()

    _.defaults(eventDoc,
      _id: Random.id()
      createdAt: new Date()
    )

    Products = ReactionCore.Collections.Products
    
    product = Products.findOne "variants._id":variantId
    if product?.variants
      Products.update(
        { "_id":product._id,"variants._id": variantId },
        { $push: { "variants.$.events": eventDoc }},
        { validate: false })
    else
      throw new Meteor.Error 400, "Variant " + variantId + " not found"

  ###
  # Push an event to a specific variant
  # only need to supply updated information
  #
  # returns array of available (inventory) variant ids
  ###
  checkInventoryAvailability: (
    productId, variantId, reservationRequest, quantity) ->
      
    check productId, String
    check variantId, String
    check reservationRequest, {
      startTime: Date,
      endTime: Date
    }
    check quantity, Match.Optional(Number)
    
    quantity = quantity || 1
    requestedVariants = []
    requestedDates = []
    message = ''
    iter = moment(reservationRequest.startTime)
      .twix(reservationRequest.endTime, {allDay: true})
      .iterate('days')
    
    while iter.hasNext()
      requestedDates.push(iter.next().toDate())
    
    product = Products.findOne(productId)
    variant = _.findWhere(product.variants, {_id: variantId})
    inventoryVariants = _.where(product.variants, {parentId: variantId})
    if inventoryVariants
      for item in inventoryVariants
        # Check to see if any of the dates requested are unavailable
        # if so, this item is unavailable for this time period.
        
        if checkAvailability(item.unavailableDates, requestedDates)
          requestedVariants.push(item._id)
          if requestedVariants.length >= quantity
            break
            # return {
            #   variants: requestedVariants,
            #   quantity: requestedVariants.length,
            #   message: 'available'
            # }
      # if we get to the end of the loop and have more than one requested
      # variants available, but less than the quantity requested.
      # if requestedVariants.length >= 1
      #   return {
      #     variants: requestedVariants,
      #     quantity: requestedVariants.length,
      #     message: 'available'
      #   }
    else
      if _.isEmpty(_.intersection(variant.unavailableDates, requestedDates))
        requestedVariants.push(variant._id)
        # if requestedVariants.length >= quantity
        #   return {
        #     variants: requestedVariants,
        #     quantity: quantity,
        #     message: 'available'
        #   }

    # if requestedVariants.length == quantity
    #   message = 'available'
    # else if requestedVariants.length >= 1
    #   message = 'partial availability'
    # else
    #   message = 'unavailable'
      
    return requestedVariants
          
          
    #  If variant has inventoryChildren
      #  Loop through children
        #  If inventory variant has availibility
          #  push it into reserveUIDs
          #  if reserveUIDs.length is == quantity
            #  break out of loop
    # Else
      # if variant has availibility
        # push variant into reserveUIDs
        
