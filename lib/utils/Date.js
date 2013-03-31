"use strict";

// Credit: Stephen Chapman, http://javascript.about.com/library/bldateformat.htm
// He didn't want me to alter his code to work in node, so I let myself be inspired
// by his work and found some ways to improve his stuff.

var util = require('util'),
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ds = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


function CustomDate (dateInfo) {
  this.d = new Date(dateInfo);
}


function _daysInMonth(month, year) {
  var dd = new Date(year, month, 0);
  return dd.getDate();
}

CustomDate.prototype.getMDay = function() {
  return (this.d.getDay() + 6) %7;
};

CustomDate.prototype.getISOYear = function() {
  var thu = new Date(this.d.getFullYear(), this.d.getMonth(), this.d.getDate()+3 - this.d.getMDay());
  return thu.getFullYear();
};

CustomDate.prototype.getISOWeek = function() {
  var onejan = new Date(this.getISOYear(), 0, 1),
      wk = Math.ceil((((this.d - onejan) / 86400000) + onejan.getMDay()+1)/7);
  if (onejan.getMDay() > 3) {
    wk--;
  }
  return wk;
};

CustomDate.prototype.getJulian = function() {
  return Math.floor((this.d / 86400000) - (this.d.getTimezoneOffset()/1440) + 2440587.5);
};

CustomDate.prototype.getMonthName = function() {
  return months[this.d.getMonth()];
};

CustomDate.prototype.getMonthShort = function() {
  return mons[this.d.getMonth()];
};

CustomDate.prototype.getDayName = function() {
  return days[this.d.getDay()];
};

CustomDate.prototype.getDayShort = function() {
  return ds[this.d.getDay()];
};

CustomDate.prototype.getOrdinal = function() {
  var d = this.d.getDate();
  switch(d) {
    case 1: case 21: case 31: return 'st';
    case 2: case 22: return 'nd';
    case 3: case 23: return 'rd';
    default: return 'th';
}};

CustomDate.prototype.getDOY = function() {
  var onejan = new Date(this.d.getFullYear(), 0, 1);
  if (onejan.getDST()) {
    onejan.addHours(1);
  }
  if (this.getDST()) {
    onejan.addHours(-1);
  }
  return Math.ceil((this.d - onejan + 1) / 86400000);
};

CustomDate.prototype.getWeek = function() {
  var onejan = new Date(this.d.getFullYear(), 0, 1);
  return Math.ceil((((this.d - onejan) / 86400000) + onejan.getDay()+1)/7);
};

CustomDate.prototype.getStdTimezoneOffset = function() {
  var jan = new Date(this.d.getFullYear(), 0, 1),
      jul = new Date(this.d.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

CustomDate.prototype.getDST = function() {
  return this.d.getTimezoneOffset() < this.getStdTimezoneOffset();
};

CustomDate.prototype.getSwatch = function() {
  var swatch = ((this.d.getUTCHours() + 1)%24) + this.d.getUTCMinutes()/60 +  this.d.getUTCSeconds()/3600;
  return Math.floor(swatch*1000/24);
};

CustomDate.prototype.format = function(f) {
  var fmt = f.split(''),
      res = '',
      i, l, d, dy, m, y, h, s, tz, w;
  
  for(i = 0, l = fmt.length; i < l; i++) {
    switch(fmt[i]) {
      case '\\':
         res += fmt[++i];
        break;
      case 'd':
        d = this.d.getDate();
        res += ((d<10)?'0':'')+d;
        break;
      case 'D':
        res += this.getDayShort();
        break;
      case 'j':
        res += this.d.getDate();
        break;
      case 'l':
        res += this.getDayName();
        break;
      case 'S':
        res += this.getOrdinal();
        break;
      case 'w':
        res += this.d.getDay();
        break;
      case 'z':
        res += this.getDOY() - 1;
        break;
      case 'R':
        dy = this.getDOY();
        if (dy < 9) {
          dy = '0'+dy;
        }
        res += (dy > 99)? dy : '0'+dy;
        break;
      case 'F':
        res += this.getMonthName();
        break;
      case 'm':
        m = this.d.getMonth()+1;
        res += ((m<10)?'0':'')+m;
        break;
      case 'M':
        res += this.getMonthShort();
        break;
      case 'n':
        res += (this.d.getMonth()+1);
        break;
      case 't':
        res += _daysInMonth(this.d.getMonth()+1, this.d.getFullYear());
        break;
      case 'L':
        res += (_daysInMonth(2, this.d.getFullYear()) === 29)? 1:0;
        break;
      case 'Y':
        res += this.d.getFullYear();
        break;
      case 'y':
        y = this.d.getFullYear().toString().substr(3);
        res += ((y<10)?'0':'')+y;
        break;
      case 'a':
        res += (this.d.getHours()>11) ? 'pm' : 'am';
        break;
      case 'A':
        res += (this.d.getHours()>11) ? 'PM' : 'AM';
        break;
      case 'g':
        h = this.d.getHours()%12;
        res += (h === 0) ? 12 : h;
        break;
      case 'G':
        res += this.d.getHours();
        break;
      case 'h':
        h = this.d.getHours()%12;
        res += (h === 0) ? 12 : (h>9) ? h : '0' + h;
        break;
      case 'H':
        h = this.d.getHours();
        res += (h > 9) ? h : '0' + h;
        break;
      case 'i':
        m = this.d.getMinutes();
        res += (m > 9) ? m : '0' + m;
        break;
      case 's':
        s = this.d.getSeconds();
        res += (s > 9) ? s : '0' + s;
        break;
      case 'O':
        m = this.d.getTimezoneOffset();
        s = (m < 0) ? '+' : '-';
        m = Math.abs(m);
        h = Math.floor(m/60);
        m = m % 60;
        res += s + ((h > 9) ? h : '0' + h) + ((m > 9) ? m : '0' + m);
        break;
      case 'P':
        m = this.d.getTimezoneOffset();
        s = (m < 0) ? '+' : '-';
        m = Math.abs(m);
        h = Math.floor(m / 60);
        m = m % 60;
        res += s + ((h > 9) ? h : '0' + h) + ':' + ((m > 9) ? m : '0' + m);
        break;
      case 'U':
        res += Math.floor(this.d.getTime()/1000);
        break;
      case 'I':
        res += this.getDST() ? 1 : 0;
        break;
      case 'K':
        res += this.getDST() ? 'DST' : 'Std';
        break;
      case 'c':
        res += this.format('Y-m-d^TH:i:sP');
        break;
      case 'r':
        res += this.format('D, j M Y H:i:s P');
        break;
      case 'Z':
        tz = this.d.getTimezoneOffset() * -60;
        res += tz;
        break;
      case 'W':
        res += this.getISOWeek();
        break;
      case 'X':
        res += this.getWeek();
        break;
      case 'x':
        w = this.getWeek();
        res += ((w<10) ? '0' : '') + w;
        break;
      case 'B':
        res += this.getSwatch();
        break;
      case 'N':
        d = this.d.getDay();
        res += d ? d : 7;
        break;
      case 'u':
        res += this.getMilliseconds() * 1000;
        break;
      case 'o':
        res += this.getISOYear();
        break;
      case 'J':
        res += this.getJulian();
        break;
      case 'e':
      case 'T':
        break;
        default: res += fmt[i];
    }
  }

  return res;
};

module.exports = CustomDate;
