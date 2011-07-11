var Logger = {
	init: function() {
		var self = this;
		this._whichMessage = 0;
		this._trow = $('<tr>');
	},

	createRow: function() {
		return $('table#log tbody').prepend(this._trow);
	},

	showChannel: function(channel) {
		var _tdata = $('<td>' + channel + '</td>');
		this._trow.append(_tdata);	
	},

	showWhichMessage: function(type) {
		var _tdata = $('<td class="font-fixed"><b>' + this._whichMessage + '</b> :' + type + '</td>');
		this._trow.append(_tdata);	
	},

	showJSON: function(message) {
		var msg = JSON.stringify(message, null, 4);
		var _tdata = $('<td class="font-fixed">' + msg + '</td>');
		this._trow.append(_tdata);
	},

	showMessage: function(message, type, channel) {
		var self = this
			, metadata = null
			, tr = '';

		self.init();
		self._whichMessage += 1;

		if (message.metadata) {
			metadata = message.metadata;
			message = message.payload;
			channel = metadata.channel;
		}

		tr = self.createRow();
		self.showChannel(channel);
		self.showWhichMessage(type);
		self.showJSON(message);

		if (metadata) {
			self.showJSON(metadata);
		}

		return self._whichMessage;
	}
};