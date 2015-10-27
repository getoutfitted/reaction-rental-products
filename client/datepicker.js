Template.rentalProductsDatepicker.rendered = function () {
  $('#datepicker').datepicker({
    startDate: '0',
    autoclose: true,
    datesDisabled: ['10/06/2015', '10/21/2015'],
    endDate: '+540d'
  });
};

Template.rentalProductsDatepicker.helpers({
  startDate: function () {
    let cart = ReactionCore.Collections.Cart.findOne();
    if (cart && cart.startTime) {
      return moment(cart.startTime).format('MM/DD/YYYY');
    }
    return '';
  },

  endDate: function () {
    let cart = ReactionCore.Collections.Cart.findOne();
    if (cart && cart.endTime) {
      return moment(cart.endTime).format('MM/DD/YYYY');
    }
    return '';
  },

  rentalLength: function () {
    if (Session.get('cartRentalLength')) {
      return Session.get('cartRentalLength');
    }
    let cart = ReactionCore.Collections.Cart.findOne();
    return cart.rentalDays;
  }
});

Template.rentalProductsDatepicker.events({
  'changeDate .start': function (event) {
    let cart = ReactionCore.Collections.Cart.findOne();
    let startDate = moment(event.currentTarget.value, 'MM/DD/YYYY');
    let endDate;
    if (cart.endTime) {
      endDate = moment(cart.endTime);
    } else {
      endDate = moment(startDate);
    }

    if (+startDate !== +cart.startTime || +endDate !== +cart.endTime) {
      let cartRentalLength = moment(startDate).twix(endDate).count('days');
      Session.set('cartRentalLength', cartRentalLength);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startDate.toDate(), endDate.toDate());
    }
  },

  'changeDate .end': function (event) {
    let cart = ReactionCore.Collections.Cart.findOne();
    let endDate = moment(event.currentTarget.value, 'MM/DD/YYYY');
    let startDate;
    if (cart.startTime) {
      startDate = moment(cart.startTime);
    } else {
      startDate = moment(endDate);
    }
    if (+startDate !== +cart.startTime || +endDate !== +cart.endTime) {
      let cartRentalLength = moment(startDate).twix(endDate).count('days');
      Session.set('cartRentalLength', cartRentalLength);
      Meteor.call('rentalProducts/setRentalPeriod', cart._id, startDate.toDate(), endDate.toDate());
    }
  }
});
