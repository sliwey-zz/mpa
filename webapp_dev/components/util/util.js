"use strict";

var pi = Math.PI,
    a = 6378245.0,
    ee = 0.006693421622965943;

var util = {
  trim: function(text) {

    // Make sure trim BOM and NBSP
    return text.trim ? text.trim() : text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  },
  getType: function(param) {
    return Object.prototype.toString.call(param).slice(8,-1).toLowerCase();
  },
  getSearch: function(key) {
    var search = window.location.search.replace("?", ""),
        paramArr = search.split("&"),
        length = paramArr.length,
        param = {};

    for (var i = 0; i < length; i++) {
      param[paramArr[i].split("=")[0]] = paramArr[i].split("=")[1];
    }

    return param[key];
  },
  extend: function() {
    var arr = arguments,
        length = arr.length,
        result = {};

    for (var i = 0; i < length; i++) {
      for (var key in arr[i]) {
        if (arr[i].hasOwnProperty(key)) {
          if (util.getType(arr[i][key]) === "object") {
            result[key] = util.extend(result[key], arr[i][key]);
          } else {
            result[key] = arr[i][key];
          }
        }
      }
    }
    return result;
  },
  each: function(obj, callback) {
    var value;

    if (isArraylike(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        value = callback.call(obj[i], i, obj[i]);

        if (value === false) {
          break;
        }
      }
    } else {
      for (var name in obj) {
        value = callback.call(obj[name], name, obj[name]);

        if (value === false) {
          break;
        }
      }
    }

    return obj;
  },
  parseHTML: function(data, isTable) {
    if (!data || typeof data !== "string") {
      return null;
    }

    var element = isTable ? document.createElement("tbody") : document.createElement("div"),
        fragment = document.createDocumentFragment(),
        childNodes;

    element.innerHTML = data;
    childNodes = element.childNodes;

    // .appendChild(node) will remove node from NodeList
    while (childNodes.length > 0) {
      fragment.appendChild(childNodes[0]);
    }

    return fragment;
  },
  children: function(element) {
    var childNodes = element.childNodes,
        length = childNodes.length,
        children = [];

    for (var i = 0; i < length; i++) {
      if (childNodes[i].nodeType === 1) {
        children.push(childNodes[i]);
      }
    }

    return children;
  },
  fireEvent: function(type, target) {
    if (document.createEvent) {
      var event = document.createEvent("HTMLEvents");

      event.initEvent(type, true, true);
      target.dispatchEvent(event);
    } else {
      target.fireEvent("on" + type);
    }
  },
  storage: function(key) {
    var storage = window.localStorage,
        obj = storage.getItem(key);

    if (!obj) {
      obj = {};
      storage.setItem(key, JSON.stringify(obj));
    }

    return {
      get: function() {
        return JSON.parse(storage.getItem(key));
      },
      set: function(value) {
        storage.setItem(key, JSON.stringify(value));
      }
    }
  },
  gps2Mars: function(lng, lat) {
    if (outOfChina(lng, lat)) {
        return {
            lng: lng,
            lat: lat
        };
    }

    var dLat = transformLat(lng - 105.0, lat - 35.0),
        dLng = transformLng(lng - 105.0, lat - 35.0),
        radLat = lat / 180.0 * pi,
        magic = Math.sin(radLat),
        sqrtMagic, mgLat, mgLng;

    magic = 1 - ee * magic * magic;
    sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    mgLat = lat + dLat;
    mgLng = lng + dLng;

    return {
      lng: mgLng,
      lat: mgLat
    };
  },
  mars2Gps: function(lng, lat) {
    var position = util.gps2Mars(lng, lat);

    return {
      lng: lng * 2 - position.lng,
      lat: lat * 2 - position.lat
    };
  }
}

function isArraylike(o) {
  var length = o.length,
      MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  return o && typeof o === "object" && typeof length === "number" && length >= 0 && length < MAX_ARRAY_INDEX && length === ~~length;
}

function outOfChina(lng, lat) {
  if (lng < 72.004 || lng > 137.8347) {
    return true;
  }
  if (lat < 0.8293 || lat > 55.8271) {
    return true;
  }
  return false;
}

function transformLng(x, y) {
  var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));

  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;

  return ret;
}

function transformLat(x, y) {
  var  ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));

  ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;

  return ret;
}

module.exports = util;