/**
 * @require replay.scss
 */

const reqwest = require('reqwest');
const echarts = require('echarts');
const template = __inline('replay.handlebars');
const traceCarInfoTpl = __inline('carInfo.handlebars');
const util = require('../util/util.js');

class Replay {

  constructor({
    root = document.body,
    map,
    number,
    data = []
  }) {
    let option = {
      title: {
        text: '',
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 12,
          fontWeight: 'normal'
        }
      },
      grid: {
        left: '40',
        right: '20',
        top: '40',
        bottom: '40'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          params = params[0];
          return `${params.name}: ${params.value[1]}km/h`;
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        splitNumber: 10,
        splitLine: {
          show: false
        },
        axisLabel:{
          formatter: value => {
            let datetime = new Date(value);
            let date = `${datetime.getFullYear()}-${prefixNumber(datetime.getMonth() + 1)}-${prefixNumber(datetime.getDate())}`;
            let time = `${prefixNumber(datetime.getHours())}:${prefixNumber(datetime.getMinutes())}`;
            let labelText;

            if (date !== this.currDate) {
              this.currDate = date;
              labelText = `${time}\n${date}`;
            } else {
              labelText = time;
            }

            return labelText;
          }
        }
      },
      yAxis: {
        name: '(km/h)',
        type: 'value',
        max: 150,
        boundaryGap: [0, '100%']
      },
      series: [{
        name: '速度',
        type: 'line',
        // showSymbol: false,
        symbol: 'circle',
        hoverAnimation: false,
        data: []
      }]
    };

    this.root = root;
    this.map = map;
    this.number = number;
    this.dataList = data;
    this.total = 0;
    this.replayIndex = 0;
    this.currDate = '';
    this.chartData = [];
    this.lineData = [];
    this.lineTemp = [];
    this.lineList = [];
    this.stampMarkerList = [];
    this.currState = -1;
    this.lineIndex = -1;
    this.interval;
    this.isPlaying = false;
    this.sliderIsMoving = false;
    this.visibleCount = 40;
    this.placeholderIndex = 0;
    this.placeholderIsInit = false;
    this.carMarker = new AMap.Marker({
      offset: new AMap.Pixel(-9, -27),
      zIndex: 300
    });
    this.infoWin = new AMap.InfoWindow({
      isCustom: true,
      autoMove: true,
      closeWhenClickMap: true,
      offset: new AMap.Pixel(16, -45)
    });

    let id = `replay_${+new Date()}${Math.random()}`.replace(/\./g, '');

    this.root.appendChild(util.parseHTML(template({id, number: this.number})));
    this.wrapEle = document.getElementById(id);
    this.replayChart = echarts.init(this.wrapEle.querySelector('.replay-chart'));
    this.progressBar = this.wrapEle.querySelector('.replay-progress-bar');
    this.replayBtn = this.wrapEle.querySelector('.replay-btn');
    this.slider = this.wrapEle.querySelector('.replay-progress-ctrl');
    this.closeBtn = this.wrapEle.querySelector('.replay-close');
    this.dateEle = this.wrapEle.querySelector('.replay-date');

    this.replayChart.setOption(option);

    this.closeBtn.addEventListener('click', () => {
      this.close();
    }, false);

    this.replayBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }, false);

    let percent;

    this.slider.addEventListener('mousedown', event => {
      percent = +this.progressBar.style.width.replace('%', '');
      this.tempX = event.clientX;
      this.sliderIsMoving = true;
      this.pause();
    }, false);

    document.body.addEventListener('mousemove', event => {

      if (this.sliderIsMoving) {
        percent += (event.clientX - this.tempX) / 430 * 100;
        percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;

        this.tempX = event.clientX;
        this.replayIndex = ~~(this.dataList.length * percent / 100);

        if (this.replayIndex >= this.dataList.length) {
          this.replayIndex = this.dataList.length - 1;
        }

        this._timeChart_(percent);
        this._timeLine_(percent);
      }
    }, false);

    document.body.addEventListener('mouseup', () => {
      if (this.sliderIsMoving) {
        this.sliderIsMoving = false;
        // this.play();
      }
    }, false);

    reqwest({
      url: '/mon/vehicle/' + this.number,
      type: 'json'
    }).then(data => {
      if (data && data.success) {
        this.infoWin.setContent(createInfoWindow(this.map, traceCarInfoTpl({
          corp: data.msg.corp,
          name: data.msg.driver,
          phone: data.msg.vehiclePhone
        })));

        AMap.event.addListener(this.carMarker, 'mouseover', () => {
          this.infoWin.open(this.map, this.carMarker.getPosition());
        });

        AMap.event.addListener(this.carMarker, 'mouseout', () => {
          this.infoWin.close();
        });
      }
    });

  }

  setData(dataList) {
    this.dataList = dataList;
    this.total = this.dataList.length;
  }

  play() {
    this.wrapEle.classList.add('show');
    this.progressBar.classList.add('transition');
    this.isPlaying = true;
    this.replayBtn.classList.remove('play');
    this.replayBtn.classList.add('pause');
    this.visibleCount = this.visibleCount < this.total ? this.visibleCount : this.total;
    this.map.setZoom(15);

    this._step();
    this.interval = setInterval(function() {
      this._step();
    }.bind(this), 300);
  }

  pause() {
    clearInterval(this.interval);
    this.progressBar.classList.remove('transition');
    this.isPlaying = false;
    this.replayBtn.classList.add('play');
    this.replayBtn.classList.remove('pause');
  }

  close() {
    clearInterval(this.interval);

    if (this.wrapEle) {
      this.root.removeChild(this.wrapEle);
      this.wrapEle = null;
    }

    if (this.stampMarkerList.length > 0) {
      let labelMarkerList = this.stampMarkerList.map(marker => marker.getExtData().label);

      this.map.remove(this.stampMarkerList.concat(labelMarkerList));
      this.stampMarkerList = [];
    }

    if (this.lineList.length > 0) {
      this.map.remove(this.lineList);
      this.lineList = [];
    }

    if (this.carMarker) {
      this.map.remove(this.carMarker);
    }

  }

  showStamp() {
    this.stampMarkerList.forEach(marker => {
      marker.getExtData().label.show();
    });
  }

  hideStamp() {
    this.stampMarkerList.forEach(marker => {
      if (!marker.getExtData().isShow) {
        marker.getExtData().label.hide();
      }
    });
  }

  _step() {
    if (this.replayIndex < this.total) {
      this._stepChart_();
      this._stepLine_();
      this.replayIndex++;
    } else {
      this.pause();
    }
  }

  _stepChart_() {
    let data = this.dataList[this.replayIndex];

    // init chartData
    if (!this.placeholderIsInit && this.replayIndex < this.visibleCount) {

      for (let i = 0; i < this.visibleCount; i++) {
        this.chartData.push({name: this.dataList[i].timeCreated, value: [this.dataList[i].timeCreated, null]});
      }

      this.placeholderIsInit = true;
      this.placeholderIndex = 0;
    }

    if (this.placeholderIndex < this.visibleCount) {
      this.chartData[this.placeholderIndex] = {name: data.timeCreated, value: [data.timeCreated, data.speed]};
      this.placeholderIndex++;
    } else {
      this.chartData.push({name: data.timeCreated, value: [data.timeCreated, data.speed]});
    }

    this.replayChart.setOption({
      title: {
        text: this.currDate
      },
      series: [{
        data: this.chartData.slice(-this.visibleCount)
      }]
    });

    if (this.replayIndex === this.total - 1) {
      this.progressBar.style.width = '100%';
    } else {
      this.progressBar.style.width = (this.replayIndex / this.total * 100) + '%';
    }

    // this.dateEle.textContent = this.currDate;

  }

  _timeChart_(percent) {
    this.progressBar.style.width = percent + '%';

    if (this.replayIndex < this.total) {
      this.chartData = [];

      if (this.replayIndex < this.visibleCount) {
        for (let i = 0; i < this.visibleCount; i++) {
          let obj = this.dataList[i];

          if (i <= this.replayIndex) {
            this.chartData.push({name: obj.timeCreated, value: [obj.timeCreated, obj.speed]});
          } else {
            this.chartData.push({name: obj.timeCreated, value: [obj.timeCreated, null]});
          }
        }

        this.placeholderIndex = this.replayIndex;
      } else {
        for (let i = this.replayIndex - this.visibleCount; i < this.replayIndex; i++) {
          let obj = this.dataList[i];
          this.chartData.push({name: obj.timeCreated, value: [obj.timeCreated, obj.speed]});
        }
      }

      this.replayChart.setOption({
        title: {
          text: this.currDate
        },
        series: [{
          data: this.chartData
        }]
      });

      // this.dateEle.textContent = this.currDate;
    }
  }

  _stepLine_() {
    let data = this.dataList[this.replayIndex];
    let position = util.gps2Mars(+data.locationText.split(',')[0], +data.locationText.split(',')[1]);
    let isLosted;

    this.lineData.push({type: data.tflag, location: [position.lng, position.lat], time: data.timeCreated, speed: data.speed});

    if (this.lineData.length > 2) {
      isLosted = isOff(this.lineData.slice(-1)[0].time, this.lineData.slice(-2, -1)[0].time);
    }

    if (isLosted || this.currState !== data.tflag) {
      this.currState = data.tflag;
      this.lineIndex++;

      if (isLosted) {
        this.lineList[this.lineIndex] = drawLine(this.map, getColor(-1), 'dashed');
      } else {
        this.lineList[this.lineIndex] = drawLine(this.map, getColor(this.currState));
      }

      this.lineTemp = this.lineTemp.slice(-1);

      this.stampMarkerList.push(drawStamp(this.map, [position.lng, position.lat], data.timeCreated, data.speed, data.tflag, true));
    } else {
      this.stampMarkerList.push(drawStamp(this.map, [position.lng, position.lat], data.timeCreated, data.speed, data.tflag));
    }

    this.lineTemp.push([position.lng, position.lat]);
    this.lineList[this.lineIndex].setPath(this.lineTemp);

    this.carMarker.setMap(this.map);
    this.carMarker.setPosition(this.lineTemp[this.lineTemp.length - 1]);
    this.carMarker.setContent(`<div data-no="${this.number}"><div class="mi-poi ${getState(this.currState)}"></div></div>`);
    this.carMarker.setLabel({
      offset: new AMap.Pixel(-20, 18),
      content: `<div class="mi-label ${getState(this.currState)}">浙BT${this.number}</div>`
    });

    this.map.setCenter(this.carMarker.getPosition());

    if (isLosted) {
      this.currState = -1;
    }
  }

  _timeLine_(percent) {
    this.lineData = [];

    if (this.stampMarkerList.length > 0) {
      let labelMarkerList = this.stampMarkerList.map(marker => marker.getExtData().label);

      this.map.remove(this.stampMarkerList.concat(labelMarkerList));
    }

    this.map.remove(this.lineList);
    this.lineList = [];
    this.lineTemp = [];
    this.stampMarkerList = [];
    this.currState = -1;
    this.lineIndex = -1;

    for (let i = 0; i <= this.replayIndex; i++) {
      let data = this.dataList[i];
      let position = util.gps2Mars(+data.locationText.split(',')[0], +data.locationText.split(',')[1]);

      this.lineData.push({type: data.tflag, location: [position.lng, position.lat], time: data.timeCreated, speed: data.speed});
    }

    this.lineData.forEach((data, index) => {
      let isLosted;

      if (index > 0) {
        isLosted = isOff(data.time, this.lineData[index - 1].time);
      }

      if (isLosted || this.currState !== data.type) {
        this.currState = data.type;
        this.lineIndex++;

        if (isLosted) {
          this.lineList[this.lineIndex] = drawLine(this.map, getColor(-1), 'dashed');
        } else {
          this.lineList[this.lineIndex] = drawLine(this.map, getColor(this.currState));
        }

        this.lineTemp = this.lineTemp.slice(-1);
        this.stampMarkerList.push(drawStamp(this.map, data.location, data.time, data.speed, data.type, true));
      } else {
        this.stampMarkerList.push(drawStamp(this.map, data.location, data.time, data.speed, data.type));
      }

      this.lineTemp.push(data.location);
      this.lineList[this.lineIndex].setPath(this.lineTemp);

      if (isLosted) {
        this.currState = -1;
      }
    });

    this.carMarker.setMap(this.map);
    this.carMarker.setPosition(this.lineTemp[this.lineTemp.length - 1]);
    this.carMarker.setContent(`<div data-no="${this.number}"><div class="mi-poi ${getState(this.currState)}"></div></div>`);
    this.carMarker.setLabel({
      offset: new AMap.Pixel(-20, 18),
      content: `<div class="mi-label ${getState(this.currState)}">浙BT${this.number}</div>`
    });

    this.map.setCenter(this.carMarker.getPosition());
  }

  _drawChart() {

  }

}

function drawStamp(map, position, time, speed, type, labelIsShow = false) {
  let stampMarker = new AMap.Marker({
    map: map,
    position: position,
    offset: new AMap.Pixel(-5, -5),
    content: `<div class="mi-timestamp ${getState(type)}"></div>`
  });

  let labelMarker = new AMap.Marker({
    map: map,
    position: position,
    topWhenMouseOver: true,
    offset: new AMap.Pixel(0, 0),
    content: `<div class="mi-timelabel">${time.substring(11)}&emsp;(${speed}km/h)</div>`
  });

  stampMarker.setExtData({
    label: labelMarker,
    isShow: labelIsShow
  });

  if (!labelIsShow) {
    labelMarker.hide();
  }

  AMap.event.addListener(stampMarker, 'mouseover', function() {
    this.getExtData().label.show();
  });

  AMap.event.addListener(stampMarker, 'mouseout', function() {
    if (!this.getExtData().isShow) {
      this.getExtData().label.hide();
    }
  });

  return stampMarker;
}

function drawLine(map, color, style = 'solid') {
  return new AMap.Polyline({
    map: map,
    strokeColor: color,
    strokeOpacity: 1,
    strokeWeight: 6,
    strokeStyle: style,
    strokeDasharray: [10, 5],
    showDir: true,
    lineJoin: 'round'
  });
}

function getState(state) {
  let className = '';

  switch (state) {
    case 0:
      className = 'empty';
      break;
    case 1:
      className = 'heavy';
      break;
    case 2:
      className = 'task';
      break;
    case 4:
      className = 'off';
      break;
    default:
      className = 'off';
  }

  return className;
}

function getColor(state) {
  let color = '';

  switch (state) {
    case 0:
      color = '#5db300';
      break;
    case 1:
      color = '#ff7800';
      break;
    case 2:
      color = '#4194ff';
      break;
    case 4:
      color = '#aaa';
      break;
    default:
      color = '#aaa';
  }

  return color;
}

function isOff(timeEnd, timeBegin) {
  return (+new Date(timeEnd) - +new Date(timeBegin)) / 1000 > 60;
}

function createInfoWindow(map, content) {
  let info = document.createElement('div');
  let contentEle = document.createElement('div');
  let footEle = document.createElement('div');

  info.className = 'trace-car-info';
  contentEle.className = 'tci-content';
  footEle.className = 'tci-foot';

  contentEle.innerHTML = content;

  info.appendChild(contentEle);
  info.appendChild(footEle);

  return info;
}

function prefixNumber(number) {
  return number > 9 ? number : `0${number}`;
}

module.exports = Replay;