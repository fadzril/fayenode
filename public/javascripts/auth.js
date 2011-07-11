var clientAuth = {
	init: function(token) {
		this._token = token;
	},
	
	outgoing: function(message, callback) {
		var self = this;
		
    // Again, leave non-subscribe messages alone
    if (message.channel !== '/meta/subscribe')
      return callback(message);

    // Add ext field if it's not present
    if (!message.ext) message.ext = {};

    // Set the auth token
    message.ext.authToken = self._token;

    // Carry on and send the message to the server
    callback(message);
  }
};

var client = new Faye.Client('http://localhost:3000/bayeux', { timeout: 130 });
client.addExtension(clientAuth);