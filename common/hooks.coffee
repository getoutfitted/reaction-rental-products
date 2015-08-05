applyRentalVariantDefaults = (variant) ->
  _.defaults(variant,
    type: 'rentalVariant'
  )

ReactionCore.Collections.Products.before.insert (userId, product) ->
  for variant in product.variants
    applyRentalVariantDefaults(variant)

ReactionCore.Collections.Products.before.update (
  userId, product, fieldNames, modifier, options) ->
    
  variants = modifier.$addToSet?.variants
  if variants and ( !product.variants or product.variants?.length == 0 )
    if variants._id
      applyRentalVariantDefaults(variants)
    else
      for variant in variants
        applyRentalVariantDefaults(variant)
