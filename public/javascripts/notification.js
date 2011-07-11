var Notification = {
  el: $('#notification'),

  init: function(message) {
    var self = this;
    message !== '' ? self.show(message) : self.hide()
  },

  show: function(message) {
    var self = this;
    if (message !== 'Passed') {
      return self.el.html(message)
        .slideDown('fast')
        .delay(1800)
        .slideUp('fast')
        .removeClass('passed');
    } else {
      return self.el.html(message)
        .slideDown('fast')
        .delay(1800)
        .slideUp('fast')
        .addClass('passed');
    }
  },

  hide: function() {
    return this.el.hide();
  }
};