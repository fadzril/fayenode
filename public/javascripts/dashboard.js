var Dashboard = {
  el: {
    'connection': $('#connection')
  },

  init: function(port) {
    this.port = port;
    this.msg = '';
    this.logger = Logger;
    this.publisher = Publish;
    this.subscriber = Subscriber;

    try {
      this.url = window.location.hostname + '/bayeux';
      this.client = new Faye.Client(this.url, { timeout: 120 });
      this.el.connection.html('Faye running on:' + this.url);
    } catch (error) {
      alert('Faye unable to run!')
      throw(error);
    }

    this.client.addExtension({ incoming: this.incomingEventHandler });
    this.publisher.init(this.client, this.logger);
    this.publisher.setInput('{}');

    return this.subscriber.init(this.client, this.logger);
  },

  incomingEventHandler: function(message, callback) {
    var metadata = {};

    if (message.channel == '/meta/connect') {
      Dashboard.msg = 'Connection status : ' + message.successful;
      Dashboard.el.connection.html(Dashboard.msg);
      return callback(message); 
    } else if (message.channel.match(/\/meta.*/)) {
      return callback(message);
    } else {
      if (message.data) {
        for (var key in message) {
          if (key != 'data') {
            metadata[key] = message[key];
          }
        }

        message.data = {
            payload: message.data
          , metadata: metadata
        };

        return callback(message);
      }
    }
  }
};