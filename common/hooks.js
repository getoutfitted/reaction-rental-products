
/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
ReactionCore.Collections.Products.after.insert(function (userId, doc) {
  if (doc.type !== "variant" || doc.functionalType !== "rentalVariant") return false;
  Meteor.call("rentalProducts/registerInventory", doc);
});

// function applyRentalVariantDefaults(variant) {
//   return _.defaults(variant, {
//     type: 'rentalVariant'
//   });
// }
//
// ReactionCore.Collections.Products.before.insert(function (userId, product) {
//   for (let variant of product.variants) {
//     applyRentalVariantDefaults(variant);
//   }
// });

// ReactionCore.Collections.Products.before.update(function (userId, product, fieldNames, modifier) {
//   let variants = null;
//   let length = null;
//
//   if (modifier.$addToSet) {
//     variants = modifier.$addToSet.variants;
//   }
//
//   if (product.variants !== null) {
//     length = product.variants.length;
//   }
//
//   if (variants && (!product.variants || length === 0)) {
//     if (variants._id) {
//       applyRentalVariantDefaults(variants);
//     } else {
//       for (let variant of variants) {
//         applyRentalVariantDefaults(variant);
//       }
//     }
//   }
// });
