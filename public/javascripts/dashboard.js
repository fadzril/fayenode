(function () {
	var ActivityLog = function () {
		var _whichMessage = 0;

    return {
      _showMessage : function (message, type, channel) {
        var self = this
          , _trow = $('<tr>')
          , _metadata = null;

        _whichMessage += 1;

        this._logRow = function () {
          return $('table#log tbody').prepend(_trow);
        };

        this._showChannel = function (channel) {
          var _tdata = $('<td>' + channel + '</td>');
          _trow.append(_tdata);
        };

        this._showWhichMessage = function () {
          var _tdata = $('<td class="font-fixed"><b>' + _whichMessage + '</b> :' + type + '</td>');
          _trow.append( _tdata );
        };

        this._showJSON = function (message) {
          var msg = JSON.stringify(message, null, 4);
          var _tdata = $('<td class="font-fixed">' + msg + '</td>');
          _trow.append(_tdata);
        };

        if (message.metadata) {
          _metadata = message.metadata;
          message = message.payload;
          channel = _metadata.channel;
        };

        _tr = this._logRow();
        this._showChannel(channel);
        this._showWhichMessage();
        this._showJSON(message);

        if (_metadata) {
          this._showJSON(_metadata);
        }

        return _whichMessage;
      }
    }
  };

  var SetupSubscribeForm = function (client, activityLogger) {
    var self = this
      , _whichSubscription = 0
      , _subscribeForm = $('form#subscribe');

    this._onSubscribe = function(evt) {
      evt.preventDefault();
      var self = this
        , subscriptionTable = $('#subscriptions table tbody')
        , channel = $('#subscribe #subscribe-channel').val();

      _whichSubscription += 1;

      this._subscribeCallback = function (message) {
        activityLogger._showMessage(message, 'incoming', channel);
      };

      var subscription = client.subscribe(channel, self._subscribeCallback);

      this._cancelForm = function (tr) {
        var self = this
          , _form = $('<form>', {id:'cancel'})
          , _button = $('<input>').attr({ 'type': 'submit', 'value': 'cancel' }).addClass('cancel');

        _form.append(_button);

        this._cancel = function (subscription, tr) {
          return function(evt) {
            evt.preventDefault();
            subscription.cancel();
            tr.hide();
          }
        };

        _form.submit(function () {
          self._cancel(subscription, tr);
        });

        return _form
      };


      this._subscriptionTR = function () {
        var _tr = $('<tr data-subscribe="true">');\
        subscriptionTable.append(_tr);
        return _tr
      };

      var tableRow = this._subscriptionTR();
      var tableForm = this._cancelForm( tableRow );

      this._cell = [
          $('<td id="subscription_'+ _whichSubscription+'">' + _whichSubscription + '</td>')
        , $('<td>' + channel + '</td>')
        , $('<td>').append(tableForm)
      ];

      $.each(this._cell, function(i, element) {
        tableRow.append(element);
        });
    }

    return _subscribeForm.submit(self._onSubscribe);
  };

  var Publish = function (client, activityLogger) {
    var selfish = null
      , _channel = $('#form-publish #channel')
      , _form = $('#form-publish')
      , _whichMessage;

    _form.submit(function (evt) {
      evt.preventDefault();
      var message = self._getInput();

      if (message != null) {
        var channel = _channel.val();
        _whichMessage = activityLogger._showMessage(message, 'outgoing', channel);
        client.publish(channel, message);
        Notification.init('Passed');
      } else {
        Notification.init('Bad JSON');
      }

      return false;
    });

    return self = {
      _getInput : function (data) {
        var data = $('#form-publish #data').val();
        try {
          return JSON.parse(data)
        }
        catch(error) {
          return null;
        }
      },
      _setInput : function (data) {
        return $('#publish #data').val(data);
      }
    };
  };

  var Dashboard = function () {
    var _port = 3000
      , _connection = $('#connection')
      , _msg = ''
      , _publisher = null
      , activityLogger = ActivityLog();

    try {
      var _url = 'http://localhost:'+  _port +'/bayeux';
      var _client = new Faye.Client( _url, { timeout:130 });
      _connection.html('Faye running on: ' +  _url + '<br />');
    }
    catch(error) {
      alert('Faye\'s not running');
      throw(error);
    }

    this.incomingHandler = function(message, callback) {
      var self = this
        , metadata = {};

      if (message.channel == '/meta/connect') {\
        _msg = 'Connection Status : ' + message.successful;
        _connection.html( _msg );
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
            ,	metadata:  metadata
          };

          return callback(message);
        }
      };
    };

    _client.addExtension({ incoming: this.incomingHandler });
    _publisher = Publish(  _client, activityLogger );
    _publisher._setInput('{}');

    return SetupSubscribeForm( _client, activityLogger);
  };

  var Notification = {
    el: $('#notification'),

    init: function(message) {
      var self = this;
      message !== '' ? self.show(message) : self.hide()
    },

    show: function(message) {
      var self = this;
      if (message !== 'Bad JSON') {
        return self.el.html(message)
          .slideDown('fast')
          .delay(1800)
          .slideUp('fast')
          .addClass('passed');
      } else {
        return self.el.html(message)
          .slideDown('fast')
          .delay(1800)
          .slideUp('fast')
          .removeClass('passed');
      }
    },

    hide: function() {
      return this.el.hide();
    }
  };

  (function ($) { Dashboard(); Notification.init('') })(jQuery);

}).call(this);
