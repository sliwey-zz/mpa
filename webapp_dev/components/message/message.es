/**
 * @require message.scss
 */

const Reqwest = require('reqwest');
const Util = require('../util/util.js');
const Toast = require('../toast/toast.js');
const wrapTpl = __inline('message.handlebars');
const templateTpl = __inline('template.handlebars');
const carListTpl = __inline('carList.handlebars');
const resultTpl = __inline('result.handlebars');
const CSS_ACTIVE = 'active';
const CSS_SHOW = 'show';
const CSS_LOADING = 'loading';

class Message{

  constructor(recivers = []) {
    this.recivers = new Set(recivers);
    this.wordLimit = 90;
    this.carList = [];

    document.body.appendChild(Util.parseHTML(wrapTpl({wordlimit: this.wordlimit})));
    document.body.appendChild(Util.parseHTML(resultTpl()));

    this.element = document.querySelector('.message-wrap');
    this.reciveEle = this.element.querySelector('.message-recive');
    this.contentEle = this.element.querySelector('.message-msg');
    this.templateListEle = this.element.querySelector('.message-tmpl-list');
    this.carListEle = this.element.querySelector('.message-car-list');
    this.resultEle = document.querySelector('.message-result-wrap');

    const closeBtn = this.element.querySelector('.message-head-close');
    const toggleBtn = this.element.querySelector(".message-tmpl-toggle");
    const templateWrapEle = this.element.querySelector(".message-tmpl-wrap");
    const templateTypeListEle = this.element.querySelector('.message-tmpl-type-list');
    const templateTypeTabEle = this.element.querySelector('.message-tmpl-tab-wrap');
    const sendBtn = this.element.querySelector('.message-btn');
    const resultCloseBtn = this.resultEle.querySelector('.message-result-btn.close');
    const searchEle = this.element.querySelector('.message-search-input');
    const searchListEle = this.element.querySelector('.message-search-list');
    const selectAllBtn = this.element.querySelector('.message-select-all');

    closeBtn.addEventListener('click', () => {
      this.close();
    }, false);

    this.contentEle.addEventListener('keyup', () => {
      this._checkCount();
    }, false);

    sendBtn.addEventListener('click', () => {
      this.send();
    }, false);

    resultCloseBtn.addEventListener('click', () => {
      this.resultEle.classList.remove(CSS_SHOW);
    }, false);

    selectAllBtn.addEventListener('click', () => {
      let comps = this.element.querySelectorAll('.cb-comp');

      if (selectAllBtn.checked) {
        this.carList.forEach(item => {
          item.list.forEach(no => {
            this.recivers.add(no);
          })
        })
      } else {
        this.recivers.clear();
      }

      this.updateRecivers();
    }, false);

    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle(CSS_ACTIVE);
      templateWrapEle.classList.toggle(CSS_SHOW);
    }, false);

    templateTypeTabEle.addEventListener('click', event => {
      let target = event.target;

      if (target.classList.contains('message-tmpl-tab')) {
        this.templateListEle.scrollTop = this.poiTop[target.getAttribute('data-index')];
      }
    }, false);

    this.templateListEle.addEventListener('scroll', () => {
      let scrollTop = this.templateListEle.scrollTop;
      const CSS_STICKY = 'sticky';

      if (scrollTop >= this.poiTop[0] && scrollTop < this.poiTop[1]) {
        this.stickyEles[0].classList.add(CSS_STICKY);
        this.stickyEles[0].style.top = scrollTop + 'px';
        this.stickyEles[1].classList.remove(CSS_STICKY);
        this.stickyEles[2].classList.remove(CSS_STICKY);
      } else if (scrollTop >= this.poiTop[1] && scrollTop < this.poiTop[2]) {
        this.stickyEles[1].classList.add(CSS_STICKY);
        this.stickyEles[1].style.top = scrollTop + 'px';
        this.stickyEles[0].classList.remove(CSS_STICKY);
        this.stickyEles[2].classList.remove(CSS_STICKY);
      } else {
        this.stickyEles[2].classList.add(CSS_STICKY);
        this.stickyEles[2].style.top = scrollTop + 'px';
        this.stickyEles[0].classList.remove(CSS_STICKY);
        this.stickyEles[1].classList.remove(CSS_STICKY);
      }
    }, false);

    this.templateListEle.addEventListener('click', event => {
      let target = event.target;

      if (target.classList.contains('message-tmpl-content')) {
        this.contentEle.value = target.textContent;
        this._checkCount();

        Array.prototype.slice.call(document.querySelectorAll('.message-tmpl-item'))
          .forEach(item => {
            item.classList.remove(CSS_ACTIVE);
          });

        target.parentNode.classList.add(CSS_ACTIVE);
      }

      if (target.classList.contains('message-tmpl-del')) {
        Reqwest({
          url: '/message/template/' + target.getAttribute('data-id'),
          type: 'json',
          method: 'delete'
        }).then(function(data) {
          if (data && data.success) {
            target.parentNode.parentNode.removeChild(target.parentNode);
            this.poiTop = getTop(this.stickyEles);
          } else {
            Toast.show('系统错误，请重试！');
          }
        });
      }

    }, false);

    templateTypeListEle.addEventListener('click', event => {
      let target = event.target;
      let msgValue = this.contentEle.value.trim();

      if (!msgValue || msgValue.length > this.wordLimit) {
        this.contentEle.focus();
        return;
      }

      if (target.classList.contains('message-tmpl-type-item')) {
        let type = target.getAttribute('data-type');

        Reqwest({
          url: '/message/template',
          type: 'json',
          method: 'post',
          data: {
            type: type,
            content: msgValue
          }
        }).then(data => {
          if (data && data.success) {
            Toast.show('模板保存成功！');
            this._renderTemplateList();
          } else {
            Toast.show('系统错误，请重试！');
          }
        });
      }
    }, false);

    this.carListEle.addEventListener('click', event => {
      let target = event.target;

      if (target.classList.contains('message-toggle')) {
        let index = target.getAttribute('data-index');
        let ulEle = this.carListEle.querySelectorAll('.message-car-item')[index].querySelector('.message-sub-list');

        target.classList.toggle(CSS_ACTIVE);
        ulEle.classList.toggle(CSS_ACTIVE);
      }

      if (target.classList.contains('cb-comp')) {
        let index = target.getAttribute('data-index');

        if (this.carList.length > 0) {
          this.carList[index].list.forEach(no => {

            if (target.checked) {
              this.recivers.add(no);
            } else {
              this.recivers.delete(no);
            }
          });

          this.updateRecivers();
        }
      }

      if (target.classList.contains('cb-car')) {
        let no = target.getAttribute('data-no');

        if (target.checked) {
          this.recivers.add(no);
        } else {
          this.recivers.delete(no);
        }

        this.updateRecivers();
      }

    }, false);

    searchEle.addEventListener('keyup', () => {
      searchEle.value = searchEle.value.replace(/\D*/g, '');

      let value = searchEle.value.trim();

      if (value.length === 4) {
        let ele = this.carListEle.querySelector(`.cb-car[data-no="${value}"]`);

        if (ele) {
          let html = `<li class="message-search-item"><label><input type="checkbox" class="search-cb" data-no="${value}" ${ele.checked ? 'checked' : ''}>浙BT${value}</label></li>`;
          searchListEle.innerHTML = html;
          searchListEle.classList.add(CSS_SHOW);
        } else {
          Toast.show('车辆未找到！');
        }
      } else {
        searchListEle.classList.remove(CSS_SHOW);
      }

    });

    searchListEle.addEventListener('click', event => {
      let target = event.target;

      if (target.classList.contains('search-cb')) {
        let no = target.getAttribute('data-no');

        if (target.checked) {
          this.recivers.add(no);
        } else {
          this.recivers.delete(no);
        }

        this.updateRecivers();
      }

    }, false);

    document.body.addEventListener('click', event => {
      let target = event.target;

      if (!hasParents(target, 'message-search')) {
        searchListEle.classList.remove(CSS_SHOW);
      }

    }, false);

    this._renderTemplateList();
    this._renderCarList();

  }

  setRecivers(recivers) {
    this.recivers = new Set(recivers);
    this.updateRecivers();
  }

  open() {
    this.element.classList.add(CSS_SHOW);
    this.poiTop = getTop(this.stickyEles);
  }

  close() {
    const searchEle = this.element.querySelector('.message-search-input');

    searchEle.value = '';
    this.recivers.clear();
    this.updateRecivers();
    this.element.classList.remove(CSS_SHOW);
  }

  send() {
    const restEle = this.resultEle.querySelector('.message-result-num.rest');
    const successEle = this.resultEle.querySelector('.message-result-num.success');
    const failEle = this.resultEle.querySelector('.message-result-num.fail');
    const detailBtn = this.resultEle.querySelector('.message-result-btn.detail');
    const progressBarEle = this.resultEle.querySelector('.message-result-progress-bar');
    let value = this.contentEle.value.trim();
    let tmplItems = this.templateListEle.querySelectorAll('.message-tmpl-item');
    let length = tmplItems.length;
    let tempId = 0;

    if (this.recivers.size === 0) {
      Toast.show('请先选择要发送的车辆！');
      return;
    }

    if (!value || value.length > this.wordLimit) {
      this.contentEle.focus();
      return;
    }

    for (let i = 0; i < length; i++) {
      if (tmplItems[i].classList.contains(CSS_ACTIVE)) {
        tempId = tmplItems[i].getAttribute('data-id');
        break;
      }
    }

    let ws = new WebSocket(`ws://${window.location.host}/ws/channel/3`);

    ws.onopen = function() {
      console.log('open');
    }

    ws.onmessage = event => {
      let json = JSON.parse(event.data);
      let data;
      let percent;

      if (json.type === 2) {
        data = json.msg;
        console.log(data)

        restEle.textContent = data[2] - data[1] - data[0];
        successEle.textContent = data[1];
        failEle.textContent = data[0];

        percent = (data[1] + data[0]) / data[2] * 100;

        if (percent > 100) {
          percent = 100;
        }

        if (data[2] === data[1] + data[0]) {
          let logId = detailBtn.getAttribute('data-id');

          console.log('Done!');

          ws.close();

          if (logId) {
            detailBtn.setAttribute('href', `/message/log/${logId}`);
            detailBtn.setAttribute('target', '_blank');
            detailBtn.classList.add(CSS_ACTIVE);
          }
        }

        progressBarEle.style.width = `${percent}%`;

        this.resultEle.classList.add(CSS_SHOW);
        this.element.classList.remove(CSS_LOADING);
      }
    };

    ws.onclose = function(event) {
      console.log('closed');
    };

    ws.onerror = function(event) {
      console.log('error');
    };

    this.element.classList.add(CSS_LOADING);

    Reqwest({
      url: '/mon/vehicle/notify',
      type: 'json',
      method: 'post',
      data: {
        vehicleNumber: [...this.recivers].join(','),
        message: value,
        templateId: tempId
      }
    }).then(data => {
      if (data && data.success) {
        let logId = data.msg;

        detailBtn.setAttribute('data-id', logId);
      }
    });
  }

  updateRecivers() {

    if (this.carList.length > 0) {
      const selectAllBtn = this.element.querySelector('.message-select-all');
      const cbComps = this.element.querySelectorAll('.cb-comp');
      const cbCars = this.element.querySelectorAll('.cb-car');
      let selectList = [];

      Array.prototype.slice.call(cbCars).forEach(item => {
        let no = item.getAttribute('data-no');

        if (this.recivers.has(no)) {
          item.checked = true;
        } else {
          item.checked = false;
        }
      });

      this.carList.forEach((item, index) => {
        selectList[index] = true;

        item.list.forEach(no => {
          selectList[index] = selectList[index] && this.recivers.has(no);
        });

      });

      Array.prototype.slice.call(cbComps).forEach((item, index) => {
        item.checked = selectList[index];
      });

      selectAllBtn.checked = selectList.reduce((prev, curr) => prev = prev && curr);

    }

    this.reciveEle.textContent = [...this.recivers].map(item => `浙BT${item}`).join(';');
  }

  _renderTemplateList() {
    Reqwest({
      url: '/message/template/list',
      type: 'json',
      data: {
        type: 0,
        page: 1,
        pagesize: 50
      }
    }).then(data => {
      if (data && data.success) {
        let dataList = data.msg;
        let tmplArr = [[],[],[]];

        dataList.forEach((data, index) => {
          tmplArr[data.mType - 1].push({
            id: data.tid,
            content: data.mContent
          })
        });

        this.templateListEle.innerHTML = templateTpl({
          list1: tmplArr[0],
          list2: tmplArr[1],
          list3: tmplArr[2]
        });

        this.stickyEles = this.templateListEle.querySelectorAll('.message-tmpl-title');
        this.poiTop = getTop(this.stickyEles);
      }
    });
  }

  _renderCarList() {
    this.carListEle.classList.add(CSS_LOADING);

    Reqwest({
      url: '/data/all',
      type: 'json'
    }).then(data => {
      if (data && data.success) {
        let dataList = data.msg || [];
        let carList = dataList.filter(data => data.list.length > 0).map(data => ({name: data.abbrName, list: data.list}));

        this.carListEle.innerHTML = carListTpl({carList});
        this.carList = carList;
        this.updateRecivers();

      } else {
        Toast.show(data.msg);
      }
    }).always(() => {
      this.carListEle.classList.remove(CSS_LOADING);
    });
  }

  _checkCount() {
    const countEle = this.element.querySelector('.message-count');
    const CSS_ALERT = 'alert';

    countEle.textContent = this.wordLimit - this.contentEle.value.length;

    if (+countEle.textContent <= 0) {
      countEle.classList.add(CSS_ALERT);
    } else {
      countEle.classList.remove(CSS_ALERT);
    }
  }

}

function getTop(eles) {
  let tops = Array.prototype.slice.call(eles).map(ele => ele.getBoundingClientRect().top);

  return tops.map(top => top - tops[0]);
}

function renderCarList() {
  reqwest({
    url: "/data/corp/list",
    type: "json",
    data: {
      key: ""
    }
  }).then(function(data) {
    if (data && data.success) {
      var list = data.msg.list,
          length = list.length,
          str = '';

      for (var i = 0; i < length; i++) {
          str += '<li class="message-car-item">'
              +  '  <p class="message-sub-title" data-number="' + list[i].vehicles + '">'
              +  '    <span class="message-toggle" data-id="' + list[i].id + '"></span>'
              +  '    <label class="message-sub-comp"><input class="cb-comp" type="checkbox" data-id="' + list[i].id + '">' + list[i].abbrName + '</label>'
              +  '  </p>'
              +  '  <ul class="message-sub-list"></ul>'
              +  '</li>';
      }

      document.querySelector(".message-car-list").innerHTML = str;
    }
  })
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

module.exports = Message;