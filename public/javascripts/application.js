Application = {
  
	/**
	 * Standard procedure. Launch the initialize
	 */
	
	init: function (bayeux) {
		var self = this;
		this._bayeux = bayeux;
		this._title = $('#header h1');
		this._form = $('#user-form');
		this._main = $('#main');
		this._fader = $('#fader');
		this._stream = $('#streams');
		this._post = $('#post');
		this._resize = $('#resize');
		this._msgbox = $('#message');
		this._timer = $('#time');
		this._avatar = $('<img/>');
		this._timerPlaceholder = $('#time-container')
		
		this._form.submit(function (e) {
		  self._username = $('#user-nick').val();
		  self._channel = $('#user-channel').val();
			self.launch();
			e.preventDefault();
		});
		
	},
  
	elements : {
			time: '#time'
		,	timeContainter: '#time-container'
		,	key: '#enter-key'
	},
	
	launch: function () {
		var self = this;
		this._title.text('Joining #' + this._channel);		
		this._resize.bind('click' , self.resize);		
		this._bayeux.subscribe('/chat/' + this._channel, self.accept, this);
		
		this._form.fadeOut('fast', function () {
		  self._fader.hide('fast');
		  $('body').css('overflow', 'auto')
		});

		this._post.submit(function (e) {
		  e.preventDefault();
		  var msg = self._msgbox.val();
		  self.post(msg);
		  self._msgbox.val('');
		});
	},
	
	accept: function(message) {
	  var self = this
	    , content = $('<li>', { 
		    							html: '<img src="'+ message.avatar +'"/>' +
		    										'<span>' + message.user + '</span>' + 
		    										message.message 
		    					});
	 
		self._stream.append( content );
	},
	
	/** 
	 * Core function for faye pushing
	 */
	
	post: function(message) {
	  var words = message.split(/\s+/)
	    , self = this
	    , pattern = /\@[a-z0-9]+/i
	    , mentions = [];
	    
	  $.each(words, function(key, word) {
	    if (!pattern.test(word)) return;
	    word = word.replace(/[^a-z0-9]/ig, '');
	    if (word !== self._nickname) mentions.push(word);
	  });  
	  	  
	  message = { 
		  	user: this._username
		  , message: message
		  , avatar: 'http://robohash.org/'+ this._username +'.png/?set=set3&size=32x32' 
		};

	  this._bayeux.publish('/chat/' + this._channel, message);
	  $.each(mentions, function(i, name) {
	    self._bayeux.publish('/members' + name, message);
	  });
	},
	
	resize: function(evt) {
	  evt.preventDefault();
	  Application._msgbox.data('defaultSize', 30);
	  var defaultSize = Application._msgbox.css('height').replace(/px/ig, '')
	    , dataSize = Application._msgbox.data('defaultSize')
	    , lineHeight = Application._msgbox.css('line-height').replace(/px/ig, '');
	  
	  if (defaultSize < dataSize + 1) {
	    return Application._msgbox.animate({
  	      height: (lineHeight * 5) + 'px'
  	  }, 1000, 'linear');  
	  } else {
	    return Application._msgbox.animate({
  	      height: dataSize + 'px'
  	  }, 800, 'linear');
	  }
	}
	
};