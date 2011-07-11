var Subscriber = {
  el: {
      'form': $('form#subscribe')
    , 'table': $('#subscriptions table tbody')
    , 'channel': $('#subscribe #subscribe-channel')
  },

  init: function(client, logger) {
    var self = this;
    
    this.whichSubscription = 0;  
    this.client = client;
    this.logger = logger;
    this.channel = Subscriber.el.channel.val();
    this.subscription = client.subscribe(self.channel, self.subscribeCallbackHandler);

    return self.el.form.submit(self.subscribeEventHandler);
  },

  subscribeEventHandler: function(e) {
    e.preventDefault();
    var self = Subscriber
      , tableRow = self.subscribeRow()
      , tableForm = self.createCancelForm(tableRow);

    self.whichSubscription += 1;
    self.cell = [
        $('<td id="subscription_'+ self.whichSubscription+'">' + self.whichSubscription + '</td>')
      , $('<td>' + self.channel + '</td>')
      , $('<td>').append(tableForm)
    ];

    $.each(self.cell, function(i, element) {
      tableRow.append(element);
    });
  },

  subscribeCallbackHandler: function(message) {
    Subscriber.logger.showMessage(message, 'incoming', Subscriber.channel)
  },

  subscribeRow: function() {
    var tr = $('<tr>');
    this.el.table.append(tr);
    return tr;
  },

  createCancelForm: function(tr) {
    var cancelForm = $('<form>', {id:'cancel'});
    var cancelBtn = $('<input>', {class:'cancel'}).attr({ 'type': 'submit', 'value': 'cancel' });

    cancelForm.append(cancelBtn);
    cancelForm.submit(Subscriber.cancelEventHandler(Subscriber.subscription, tr));

    return cancelForm;
  },

  cancelEventHandler: function(subscription, row) {
    return function(e) {
      e.preventDefault();
      Subscriber.subscription.cancel();
      row.hide();
    }
  }
};