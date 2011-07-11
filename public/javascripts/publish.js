var Publish = {
  el: {
      'form': $('#form-publish')
    , 'channel': $('#form-publish #channel')
    , 'data': $('#form-publish #data')
  },

  init: function(client, logger) {
    var self = this;

    this.whichMessage = 0;
    this.client = client;
    this.logger = logger
    this.notification = Notification;

    self.el.form.submit(self.submitEventHandler);
  },

  submitEventHandler: function(e) {
    e.preventDefault();
    var ns = Publish
      , message = ns.getInput();

    if (message != null) {
      var channel = ns.el.channel.val();
      if (channel.match(/\*/ig)) {
        ns.notification.init('Invalid Channel Name');
      }
      ns.whichMessage = ns.logger.showMessage(message, 'outgoing', channel)
      ns.client.publish(channel, message);
      ns.notification.init('Passed');
    } else {
      ns.notification.init('Bad JSON');
    }
  },

  getInput: function(data) {
    var data = Publish.el.data.val();
    try {
      return JSON.parse(data);
    } catch(error) {
      return null
    }
  },

  setInput: function(data) {
    return Publish.el.data.val(data);
  }
};