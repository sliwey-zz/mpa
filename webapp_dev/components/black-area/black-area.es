/**
 * @require black-area.scss
 */
const reqwest = require('reqwest');
const Popup = require('../popup/popup.es');
const util = require('../util/util.js');
const toast = require('../toast/toast.js');
const template = __inline('black-area.handlebars');
const resultTpl = __inline('result.handlebars');
const CSS_ACTIVE = 'active';
const CSS_SHOW = 'show';
const CSS_LOADING = 'loading';

class BlackArea{

  constructor(blackList = [], callback) {
    const isShow = blackList.length > 0;

    this.callback = callback;
    this.pop = new Popup({
      width: '900px',
      title: '剔除区域管理',
      content: template({ blackList, isShow })
    });

    const map = new AMap.Map('blackMap', {
      view: new AMap.View2D({
        zoom: 11
      })
    });
    const wrapEle = document.getElementById('blackWrap');
    const rulerBtn = wrapEle.querySelector('.black-toolbar-item.ruler');
    const drawCircle = wrapEle.querySelector('.black-toolbar-btn.circle');
    const searchInput = wrapEle.querySelector('.black-search-input');
    const searchBtn = wrapEle.querySelector('.black-search-btn');
    const searchList = wrapEle.querySelector('.black-search-list');
    let centerMarker;
    let isDrawing = false;

    this.resultWrap = wrapEle.querySelector('.black-result-wrap');
    this.resultList = wrapEle.querySelector('.black-result-list');

    // 搜索
    searchInput.addEventListener('keyup', event => {
      const value = searchInput.value.trim();

      if (!value) {
        searchList.classList.remove(CSS_ACTIVE);
        return;
      }

      reqwest({
        url: 'http://restapi.amap.com/v3/place/text?&callback=?',
        type: 'jsonp',
        data: {
          key: '539e96e62a32d7818e821d724052cd81',
          city: '宁波',
          offset: 5,
          s: 'rsv3',
          keywords: value
        }
      }).then(data => {
        if (data) {
          const list = data.pois;
          const length = list.length;
          let str = '';

          for (let i = 0; i < length; i++) {
            str += `<li class="black-search-item">${list[i].name}</li>`;
          }

          searchList.innerHTML = str;
          searchList.classList.add(CSS_ACTIVE);
        }
      });

      if (event.keyCode === 13) {
        searchBtn.click();
      }

    }, false);

    searchList.addEventListener('click', event => {
      const target = event.target;

      if (target.classList.contains('black-search-item')) {
        searchInput.value = target.textContent;
        searchList.classList.remove(CSS_ACTIVE);
        searchBtn.click();
      }
    }, false);

    searchBtn.addEventListener('click', () => {
      const value = searchInput.value.trim();

      if (centerMarker) {
        map.remove(centerMarker);
      }

      reqwest({
        url: 'http://restapi.amap.com/v3/place/text?&callback=?',
        type: 'jsonp',
        data: {
          key: 'fbd79c02b1207d950a9d040483ef40e5',
          city: '宁波',
          offset: 1,
          s: 'rsv3',
          keywords: value
        }
      }).then(data => {
        if (data) {
         const center = new AMap.LngLat(data.pois[0].location.split(',')[0], data.pois[0].location.split(',')[1]);

          // 设置中心点
          map.setZoomAndCenter(15, center);

          centerMarker = new AMap.Marker({
            map: map,
            position: center,
            animation: 'AMAP_ANIMATION_DROP'
          });
        }
      });

      searchList.classList.remove(CSS_ACTIVE);

    }, false);

    // 测距
    rulerBtn.addEventListener('click', event => {
      map.plugin(['AMap.RangingTool'],function(){
        const ruler = new AMap.RangingTool(map);

        ruler.turnOn();

        AMap.event.addListener(ruler, 'end', function() {
          ruler.turnOff();
        });
      });
    }, false);

    // 画圆
    drawCircle.addEventListener('click', () => {

      if (isDrawing) {
        return;
      }

      isDrawing = true;
      drawCircle.classList.add(CSS_ACTIVE);
      map.clearMap();
      map.setDefaultCursor('url(' + __inline('cursor_pen.png') + '), pointer');

      map.plugin(['AMap.MouseTool'], () => {
        const mousetool = new AMap.MouseTool(map);

        mousetool.circle({
          strokeColor: '#004e79',
          strokeOpacity: 0.2,
          strokeWeight: 1,
          fillColor: '#7cc8f3',
          fillOpacity: 0.2
        });

        AMap.event.addListener(mousetool, 'draw', event => {
          const circle = event.obj;
          const radius = circle.getRadius().toFixed(0);
          const center = circle.getCenter();
          const marker = new AMap.Marker({
            offset: new AMap.Pixel(-25,-15),
            position: center,
            zIndex: 99999
          });

          // 新增区域
          this._addArea(wrapEle, center, radius);

          map.setDefaultCursor('default');

          // 半径修正
          circle.setRadius(radius);

          mousetool.close();

          drawCircle.classList.remove(CSS_ACTIVE);
          isDrawing = false;

          if (centerMarker) {
            map.remove(centerMarker);
          }

        })
      });

    }, false);

    // 区域列表
    this.resultList.addEventListener('click', event => {
      const target = event.target;

      if (target.classList.contains('black-result-btn')) {
        const id = target.getAttribute('data-id');
        const ele = this.resultList.querySelector(`.black-result-item[data-id="${id}"]`);
        const poiBtn = ele.querySelector('.black-result-btn.poi');
        const location = ele.getAttribute('data-location');
        const address = ele.querySelector('.black-result-input.address').value.trim();
        const items = this.resultList.querySelectorAll('.black-result-btn.poi');
        const position = util.gps2Mars(+location.split(',')[0], +location.split(',')[1]);

        // 定位
        if (target.classList.contains('poi')) {
          if (target.classList.contains(CSS_ACTIVE)) {
            map.clearMap();
            target.classList.remove(CSS_ACTIVE);
          } else {
            const radius = +ele.getAttribute('data-radius');

            items.forEach(item => {
              item.classList.remove(CSS_ACTIVE);
            })

            target.classList.add(CSS_ACTIVE);
            addCircle(map, [position.lng, position.lat], radius);
          }
        }

        // 修改
        if (target.classList.contains('ok')) {
          const radius = +ele.querySelector('.black-result-input.radius').value.trim();

          wrapEle.classList.add(CSS_LOADING);

          reqwest({
            url: `/earlywarning/rule/blacklist/${id}`,
            type: 'json',
            method: 'put',
            data: {
              name: address,
              range: radius
            }
          }).then(data => {
            if (data && data.success) {
              if (poiBtn.classList.contains(CSS_ACTIVE)) {
                addCircle(map, [position.lng, position.lat], radius);
              }

              ele.setAttribute('data-radius', radius);
              this.callback();
            } else {
              toast.show(data.msg);
            }
          }).always(() => {
            wrapEle.classList.remove(CSS_LOADING);
          });
        }

        // 删除
        if (target.classList.contains('del')) {
          wrapEle.classList.add(CSS_LOADING);

          reqwest({
            url: `/earlywarning/rule/blacklist/${id}`,
            type: 'json',
            method: 'delete'
          }).then(data => {
            if (data && data.success) {
              if (poiBtn.classList.contains(CSS_ACTIVE)) {
                map.clearMap();
              }

              ele.parentNode.removeChild(ele);
              this._checkList();
            } else {
              toast.show(data.msg);
            }
          }).always(() => {
            wrapEle.classList.remove(CSS_LOADING);
          });
        }
      }
    }, false);
  }

  _addArea(wrapEle, position, radius) {
    AMap.service(['AMap.Geocoder'], () => {
      const geocoder = new AMap.Geocoder({
        radius: 100
      });

      geocoder.getAddress(position, (status, result) => {
        if(status === 'complete' && result.info === 'OK') {
          const center = util.mars2Gps(position.lng, position.lat);
          const address = result.regeocode.formattedAddress.substring(6);
          const location = `${center.lng},${center.lat}`;

          wrapEle.classList.add(CSS_LOADING);

          reqwest({
            url: '/earlywarning/rule/blacklist/add',
            type: 'json',
            method: 'post',
            data: {
              name: address,
              location: location,
              range: radius
            }
          }).then(data => {
            if (data && data.success) {
              this.resultList.appendChild(util.parseHTML(resultTpl({
                id: data.msg,
                name: address,
                location: location,
                range: radius
              })));

              this.callback();
              this._checkList();
            } else {
              toast.show(data.msg);
            }
          }).always(() => {
            wrapEle.classList.remove(CSS_LOADING);
          });
        }
      });
    });
  }

  _checkList() {
    const length = this.resultList.querySelectorAll('.black-result-item').length;
    const CSS_SHOW = 'show';

    if (length > 0) {
      this.resultWrap.classList.add(CSS_SHOW);
    } else {
      this.resultWrap.classList.remove(CSS_SHOW);
    }
  }

  open() {
    this.pop.open();
  }
}

function addCircle(map, center, radius) {
  const circle = new AMap.Circle({
    center: center,
    radius: radius,
    strokeColor: '#004e79',
    strokeOpacity: 0.2,
    strokeWeight: 1,
    fillColor: '#7cc8f3',
    fillOpacity: 0.2
  });

  // 清楚覆盖物
  map.clearMap();

  circle.setMap(map);
  map.setFitView(circle);
}

module.exports = BlackArea;