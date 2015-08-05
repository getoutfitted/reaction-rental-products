#
#
#
#
# Meteor.methods
#
#   ###
#   # initializes empty rental variant template (all others are clones)
#   # should only be seen when all variants have been deleted from a product.
#   ###
#   createRentalVariant: (productId, newVariant) ->
#     check productId, String
#     check newVariant, Match.Optional Object
#     unless ReactionCore.hasPermission('createProduct')
#       throw new Meteor.Error 403, 'Access Denied'
#     @unblock()
#
#     #create variant
#     newVariantId = Random.id()
#     if newVariant
#       newVariant._id = newVariantId
#       check(newVariant, ReactionCore.Schemas.RentalProductVariant)
#     else
#       newVariant =
#         '_id': newVariantId
#         'active': true
#         'title': ''
#         'price': 0.00
#         'pricePerDay': '0.00'
#         'pricePerWeek': '0.00'
#         'type': 'rentalVariant'
#         events: []
#     Products.update({'_id': productId},
#       {$addToSet: {'variants': newVariant}}, {validate: false})
#     return newVariantId
