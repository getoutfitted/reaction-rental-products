Meteor.methods
  ###
  # Push an event to a specific variant
  # only need to supply updated information
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


  checkInventoryAvailability: (variantId, reservationRequest) ->
    check variantId, String
    check reservationRequest, {
      startTime: Date,
      endTime: Date
    }
