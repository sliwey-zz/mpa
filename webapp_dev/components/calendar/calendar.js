/**
 * @require calendar.scss
 */
var template = __inline("calendar.handlebars"),
    util = require("../util/util.js");

function getDays(year, month) {
  var daysInMonths = [31,28,31,30,31,30,31,31,30,31,30,31];

  // 能被4整除且不能被100整除，或者能被400整除的为闰年
  if (month === 1) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) ? 29 : 28;
  } else {
    return daysInMonths[month];
  }

  //return new Date(year, month + 1, 0).getDate();
}

function getCalendar(date, selectedDate) {
  var now = new Date(),
    today = {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate()
    },
    firstDayInWeek = new Date(date.year, date.month, 1).getDay(),
    days = getDays(date.year, date.month),
    dayArr = [];

  for (var i = 0; i < firstDayInWeek; i++) {
    dayArr.push("");
  }

  for (var j = 1; j <= days; j++) {
    obj = {
      value: j,
      isSelected: false,
      isToday: false
    };

    if (date.year === today.year && date.month === today.month && j === today.day) {
      obj.isToday = true;
    }

    if (date.year === selectedDate.year && date.month === selectedDate.month && j === selectedDate.day) {
      obj.isSelected = true;
    }

    dayArr.push(obj);
  }

  return dayArr;
}

function parseHTML(dayArr) {
  var html = '';

  for (var i = 0; i < dayArr.length; i++) {
    html += '<li class="calendar-item ' + (dayArr[i].isToday ? 'today' : '') + ' ' + (dayArr[i].isSelected ? 'selected' : '') + '">' + (dayArr[i].value ? dayArr[i].value : '') + '</li>';
  }

  return html;
}

function hasParents(element, classname) {
  while (element && element !== document.body) {

    if (element.classList.contains(classname)) {
      return true;
    }

    element = element.parentNode;
  }

  return false;
}

function prefixZero(value) {
  return +value > 9 ? value : "0" + value;
}

function formatDate(date, format) {
  var str;

  if (util.getType(date) !== "date") {
    return;
  }

  switch (format) {
    case "yyyy-MM-dd HH:mm:ss":
      break;
  }

  return str;

}

function Calendar(id, options) {
  var now = new Date(),
    defaults = {
      date: now,
      format: "yyyy-MM-dd HH:mm:ss",
      visible: true
    };

  this.element = document.getElementById(id);
  this.settings = util.extend({}, defaults, options);

  this.element.setAttribute("readonly", true);
  this.element.style.cursor = "pointer";

  if (this.element.hasAttribute("disabled")) {
    this.element.style.cursor = "not-allowed";
  }

  if (util.getType(this.settings.date) !== "date") {
    return;
  }

  this.currDate = {
    year: this.settings.date.getFullYear(),
    month: this.settings.date.getMonth(),
    day: this.settings.date.getDate()
  };

  this.selectedDate = {
    year: this.settings.date.getFullYear(),
    month: this.settings.date.getMonth(),
    day: this.settings.date.getDate()
  };

  if (this.settings.visible) {
    this.element.value = this.currDate.year + "-" + prefixZero(this.currDate.month + 1) + "-" + prefixZero(this.currDate.day);
  }

  var calendarId = ("calendar_" + +now + Math.random()).replace(/\./g, "");

  if (this.settings.type === "datetime") {

    if (this.settings.format === 'yyyy-MM-dd HH:mm:ss') {
      this.element.value = this.element.value + " " + prefixZero(this.settings.date.getHours()) + ":" + prefixZero(this.settings.date.getMinutes()) + ":" + prefixZero(this.settings.date.getSeconds());
    }

    if (this.settings.format === 'yyyy-MM-dd HH:mm') {
      this.element.value = this.element.value + " " + prefixZero(this.settings.date.getHours()) + ":" + prefixZero(this.settings.date.getMinutes());
    }

  }

  var dayArr = getCalendar(this.currDate, this.selectedDate);

  document.body.appendChild(util.parseHTML(template({
    id: calendarId,
    year: this.currDate.year,
    month: this.currDate.month + 1,
    dayArr: dayArr,
    isDatetime: this.settings.type === "datetime",
    secondIsDisabled: this.settings.format === "yyyy-MM-dd HH:mm" ? false : true
  })));

  this.calendarEle = document.getElementById(calendarId);
  this.dayList = this.calendarEle.querySelector(".dayList");
  this.yearEle = this.calendarEle.querySelector(".calendar-year");
  this.monthEle = this.calendarEle.querySelector(".calendar-month");

  if (this.settings.type === "datetime") {

    if (this.settings.format === 'yyyy-MM-dd HH:mm:ss') {
      this.hourEle = this.calendarEle.querySelector(".calendar-hour");
      this.hourOpt = this.hourEle.querySelectorAll("option");
      this.minuteEle = this.calendarEle.querySelector(".calendar-minute");
      this.minuteOpt = this.minuteEle.querySelectorAll("option");
      this.secondEle = this.calendarEle.querySelector(".calendar-second");
      this.secondOpt = this.secondEle.querySelectorAll("option");

      if (this.settings.date && util.getType(this.settings.date) === "date") {

        this.hourOpt[this.settings.date.getHours()].selected = true;
        this.minuteOpt[this.settings.date.getMinutes()].selected = true;
        this.secondOpt[this.settings.date.getSeconds()].selected = true;

      } else {

        this.hourOpt[now.getHours()].selected = true;
        this.minuteOpt[now.getMinutes()].selected = true;
        this.secondOpt[now.getSeconds()].selected = true;

      }
    }

    if (this.settings.format === 'yyyy-MM-dd HH:mm') {
      this.hourEle = this.calendarEle.querySelector(".calendar-hour");
      this.hourOpt = this.hourEle.querySelectorAll("option");
      this.minuteEle = this.calendarEle.querySelector(".calendar-minute");
      this.minuteOpt = this.minuteEle.querySelectorAll("option");

      if (this.settings.date && util.getType(this.settings.date) === "date") {

        this.hourOpt[this.settings.date.getHours()].selected = true;
        this.minuteOpt[this.settings.date.getMinutes()].selected = true;

      } else {

        this.hourOpt[now.getHours()].selected = true;
        this.minuteOpt[now.getMinutes()].selected = true;

      }
    }

  }

  // 事件绑定
  this.calendarEle.querySelector(".prevYear").addEventListener("click", function() {

    this.currDate.year--;

    if (this.currDate.year < 1970) {
      this.currDate.year = 1970;
    }

    this._go(this.currDate, this.selectedDate);

  }.bind(this), false);

  this.calendarEle.querySelector(".prevMonth").addEventListener("click", function() {

    this.currDate.month--;

    if (this.currDate.month < 0) {
      this.currDate.year--;
      if (this.currDate.year < 1970) {
        this.currDate.year = 1970;
        this.currDate.month = 0;
      } else {
        this.currDate.month = 11;
      }
    }

    this._go(this.currDate, this.selectedDate);

  }.bind(this), false);

  this.calendarEle.querySelector(".nextYear").addEventListener("click", function() {

    this.currDate.year++;

    this._go(this.currDate, this.selectedDate);

  }.bind(this), false);

  this.calendarEle.querySelector(".nextMonth").addEventListener("click", function() {

    this.currDate.month++;

    if (this.currDate.month > 11) {
      this.currDate.year++;
      this.currDate.month = 0;
    }

    this._go(this.currDate, this.selectedDate);

  }.bind(this), false);

  this.dayList.addEventListener("click", function(event) {
    var target = event.target,
      items = this.dayList.querySelectorAll(".calendar-item"),
      length = items.length,
      CSS_SELECTED = "selected";

    if (target.classList.contains("calendar-item") && target.innerHTML) {
      this.selectedDate = {
        year: this.currDate.year,
        month: this.currDate.month,
        day: +target.innerHTML
      };

      for (var i = 0; i < length; i++) {
        items[i].classList.remove(CSS_SELECTED);

        if (target.innerHTML === items[i].innerHTML) {
          items[i].classList.add(CSS_SELECTED);
        }
      }

      if (this.settings.type !== "datetime") {
        this.element.value = this.currDate.year + "-" + prefixZero(this.currDate.month + 1) + "-" + prefixZero(target.innerHTML);
        util.fireEvent("change", this.element);
        this.hide();
      } else {
        this.element.value = this.currDate.year + "-" + prefixZero(this.currDate.month + 1) + "-" + prefixZero(target.innerHTML) + " " + this.element.value.split(" ")[1];
      }

    }
  }.bind(this), false);

  this.calendarEle.addEventListener("click", function(event) {
    var target = event.target;

    if (target.classList.contains("calendar-btn")) {
      util.fireEvent("change", this.element);
      this.hide();
    }

  }.bind(this), false);

  this.calendarEle.addEventListener("change", function(event) {
    var target = event.target;

    if (target.classList.contains("calendar-hour")) {
      if (this.settings.format === 'yyyy-MM-dd HH:mm:ss') {
        this.element.value = this.element.value.split(" ")[0] + " " + target.value + ":" + this.element.value.split(" ")[1].split(":")[1] + ":" + this.element.value.split(" ")[1].split(":")[2];
      }

      if (this.settings.format === 'yyyy-MM-dd HH:mm') {
        this.element.value = this.element.value.split(" ")[0] + " " + target.value + ":" + this.element.value.split(" ")[1].split(":")[1];
      }

    }

    if (target.classList.contains("calendar-minute")) {
      if (this.settings.format === 'yyyy-MM-dd HH:mm:ss') {
        this.element.value = this.element.value.split(" ")[0] + " " + this.element.value.split(" ")[1].split(":")[0] + ":" + target.value + ":" + this.element.value.split(" ")[1].split(":")[2];
      }

      if (this.settings.format === 'yyyy-MM-dd HH:mm') {
        this.element.value = this.element.value.split(" ")[0] + " " + this.element.value.split(" ")[1].split(":")[0] + ":" + target.value;
      }
    }

    if (target.classList.contains("calendar-second")) {
      this.element.value = this.element.value.split(" ")[0] + " " + this.element.value.split(" ")[1].split(":")[0] + ":" + this.element.value.split(" ")[1].split(":")[1] + ":" + target.value;
    }

  }.bind(this), false);

  document.body.addEventListener("click", function(event) {
    var target = event.target;

    if (!hasParents(target, "calendar")) {
      this.hide();
    }

    if (target.id === id && !target.hasAttribute("disabled")) {
      this.show();
    }

  }.bind(this), false);
}

Calendar.prototype = {

  _go: function(currDate, selectedDate) {
    this.currDate = currDate;
    this.selectedDate = selectedDate;

    this.yearEle.innerHTML = this.currDate.year;
    this.monthEle.innerHTML = this.currDate.month + 1;
    this.dayList.innerHTML = parseHTML(getCalendar(this.currDate, this.selectedDate));

  },
  setDate: function(date) {
    var currDate;

    if (util.getType(date) !== "date") {
      return;
    }

    currDate = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    };

    this._go(currDate, currDate);

    if (this.settings.type === "datetime") {
      this.element.value = currDate.year + "-" + prefixZero(currDate.month + 1) + "-" + prefixZero(currDate.day) + " " + prefixZero(currDate.hour) + ":" + prefixZero(currDate.minute) + ":" + prefixZero(currDate.second);
    } else {
      this.element.value = currDate.year + "-" + prefixZero(currDate.month + 1) + "-" + prefixZero(currDate.day);
    }

  },
  getDate: function() {
      return this.element.value;
  },
  show: function() {
    var eleBcr = this.element.getBoundingClientRect(),
      calBcr = this.calendarEle.getBoundingClientRect(),
      docWidth = document.body.scrollWidth,
      docHeight = document.body.scrollHeight,
      docTop = document.body.scrollTop,
      docLeft = document.body.scrollLeft,
      left,
      top;

    top = docTop + eleBcr.top + eleBcr.height - 1;
    left = docLeft + eleBcr.left;

    if (top + calBcr.height > docHeight) {
      top = docTop + eleBcr.top - calBcr.height;
    }

    if (left + calBcr.width > docWidth) {
      left = docLeft + eleBcr.right - calBcr.width;
    }

    this.calendarEle.style.top = top + "px";
    this.calendarEle.style.left = left + "px";
  },
  hide: function() {
    this.calendarEle.style.top = "-999px";
    this.calendarEle.style.left = "-999px";
  }
}

module.exports = {
  create: function(id, options) {
    return new Calendar(id, options);
  }
}