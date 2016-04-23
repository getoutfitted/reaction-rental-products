Template.dashboardRentalProductAvailability.onRendered(function () {
  let instance = this;
  const productId = ReactionRouter.getParam("_id");

  instance.autorun(() => {
    instance.subscribe("inventoryVariantsById", productId);
    instance.subscribe("Product", productId);
    instance.subscribe("ParentProduct", productId);
  });
});

Template.dashboardRentalProductAvailability.helpers({
  currentMonth: () => {
    Session.setDefault("dashboardViewStart", moment().startOf("month").toDate());
    Session.setDefault("dashboardViewEnd", moment().endOf("month").toDate());
    return moment(Session.get("dashboardViewStart")).format("MMMM");
  },
  inventoryVariants: () => {
    const productId = ReactionRouter.getParam("_id");
    return ReactionCore.Collections.InventoryVariants.find({productId: productId});
  },
  product: () => {
    const productId = ReactionRouter.getParam("_id");
    return ReactionCore.Collections.Products.findOne(productId);
  },
  parent: () => {
    const productId = ReactionRouter.getParam("_id");
    const product = ReactionCore.Collections.Products.findOne(productId);
    if (product) {
      return ReactionCore.Collections.Products.findOne(product.ancestors[0]);
    }
    return {};
  },
  viewStart: () => {
    return Session.get("dashboardViewStart");
  },
  viewEnd: () => {
    Session.get("dashboardViewEnd");
  },
  days: () => {
    let viewStart = Session.get("dashboardViewStart");
    let viewEnd = Session.get("dashboardViewEnd");
    return moment(viewStart).twix(moment(viewEnd)).split(1, "day");
  }
});

// TODO: This could be made MUCH more efficient by calculating
// each inventory variant a month/view start-view end at a time
// rather than each day independently
Template.dashboardVariantAvailability.helpers({
  viewStart: Session.get('dashboardViewStart'),
  viewEnd: Session.get('dashboardViewEnd'),
  currentMonth: moment(Session.get('dashboardViewStart')).format('MMMM'),
  days: function () {
    let viewStart = Session.get('dashboardViewStart');
    let viewEnd = Session.get('dashboardViewEnd');
    return moment(viewStart).twix(moment(viewEnd)).split(1, 'day');
  },
  reservationStatus: function (day, unavailableDetails) {
    let icons = {
      "Shipped": "fa fa-upload fa-rotate-90 delivery-brown",
      "In Transit": "fa fa-truck fa-flip-horizontal delivery-brown",
      "Delivered": "fa fa-download fa-rotate-270 delivery-brown",
      "Return Shipped": "fa fa-upload fa-rotate-90 returning-green",
      "Return In Transit": "fa fa-truck fa-flip-horizontal returning-green",
      "Return Delivered": "fa fa-download fa-rotate-270 returning-green",
      "In Transit - Rush Delivery": "fa fa-plane rush-delivery-orange",
      "In Transit - Rush Returning": "fa fa-plane fa-flip-horizontal rush-delivery-orange",
      "Return Processing": "fa fa-refresh",
      "In Use": "fa fa-user primary-color"
    };

    if (!unavailableDetails || unavailableDetails.length === 0) {
      return "hide";
    }
    let pos =  _.sortedIndex(unavailableDetails, {date: day.start.toDate()}, "date");
    if (unavailableDetails[pos]
      && +day.start === +moment(unavailableDetails[pos].date).startOf("day")) {
      return icons[unavailableDetails[pos].reason];
    }
    return "hide";
  },
  isWeekendDay: function (day) {
    if (day.start.isoWeekday() >= 6) {
      return "inventory-day-weekend";
    }
    return "inventory-day-weekday";
  }
});

Template.dashboardCalendarDay.helpers({
  formattedDay: function (d) {
    return d.format("dd DD");
  },
  isWeekendDay: function (day) {
    if (day.isoWeekday() >= 6) {
      return "inventory-day-weekend";
    }
    return "inventory-day-weekday";
  }
});


Template.dashboardRentalProductAvailability.events({
  'click .viewPrevCalendar': function () {
    let viewMonth = moment(Session.get('dashboardViewStart')).subtract(1, 'month');
    let viewStart = moment(viewMonth).startOf('month').toDate();
    let viewEnd = moment(viewMonth).endOf('month').toDate();
    Session.set('dashboardViewStart', viewStart);
    Session.set('dashboardViewEnd', viewEnd);
  },
  'click .viewNextCalendar': function () {
    let viewMonth = moment(Session.get('dashboardViewStart')).add(1, 'month');
    let viewStart = moment(viewMonth).startOf('month').toDate();
    let viewEnd = moment(viewMonth).endOf('month').toDate();
    Session.set('dashboardViewStart', viewStart);
    Session.set('dashboardViewEnd', viewEnd);
  }
});
