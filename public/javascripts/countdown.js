/**
 * Countdown inspired from node KO
 */

var Countdown = {
  start : 0,

  init : function(setter, placeholder) {
    var self = this
      , time = $(setter).text().split(/[-:TZ]/);

    time[1]--;
    self.start = Date.UTC.apply(null, time);

    setInterval(function () {
      self.tick(placeholder);
    }, 800);
  },

  tick : function(container) {
    var self = this
      , names = ['minute','second']
      , sec = (self.start - new Date) / 1000
      , left = $.map([sec % 3600/60, sec % 60], function(num, i) { return [Math.floor(num), pluralize(names[i], num)] }).join(' ');

    $(container).text(left + ': from now');
    function pluralize (str, count) {
      return str + (parseInt(count, 10) !== 1 ? 's' : '');
    }
  }
};