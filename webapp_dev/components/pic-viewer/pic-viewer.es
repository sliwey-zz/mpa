/**
 * @require pic-viewer.scss
 */

const Util = require('../util/util.js');
const template = __inline('pic-viewer.handlebars');
const CSS_SHOW = 'show';

class Viewer{

  constructor(urlList = []) {
    this.urlList = urlList;
    this.rotate = 0;
    this.zoom = 1;

    document.body.appendChild(Util.parseHTML(template()));
    this.element = document.querySelector('.pic-viewer-wrap');
    this.imgEle = this.element.querySelector('.pic-viewer-img');

    this.element.querySelector('.pic-viewer-close').addEventListener('click', () => {
      this.close();
    }, false);

    document.body.addEventListener('click', event => {
      let target = event.target;

      if (target.classList.toString().indexOf('pic-viewer-') === -1) {
        this.close();
      }
    }, false);

    this.element.addEventListener('click', event =>{
      let target = event.target;

      if (target.classList.contains('pic-viewer-tool')) {

        if (target.classList.contains('zoom-in')) {
          this.zoom += 0.2;
          this.zoom = this.zoom > 2 ? 2 : this.zoom;
          adjustImage(this.imgEle, this.zoom, this.rotate);
        }

        if (target.classList.contains('zoom-out')) {
          this.zoom -= 0.2;
          this.zoom = this.zoom < 0.6 ? 0.6 : this.zoom;
          adjustImage(this.imgEle, this.zoom, this.rotate);
        }

        if (target.classList.contains('rotate')) {
          this.rotate += 90;
          adjustImage(this.imgEle, this.zoom, this.rotate);
        }

      }
    }, false);

  }

  open() {
    this.imgEle.setAttribute('src', this.urlList[0]);
    this.element.classList.add(CSS_SHOW);
  }

  close() {
    this.zoom = 1;
    this.rotate = 0;
    this.element.classList.remove(CSS_SHOW);

    setTimeout(() => {
      adjustImage(this.imgEle, this.zoom, this.rotate);
    }, 500);
  }

  destory() {
    this.element.parentNode.removeChild(this.element);
  }

  add(url) {
    this.urlList.push(url);
  }

  set(urlList) {
    this.urlList = urlList;
  }

  clear() {
    this.urlList = [];
  }
}

function adjustImage(ele, zoom, rotate) {
  ele.style.webkitTransform = `scale(${zoom}) rotate(${rotate}deg)`;
  ele.style.transform = `scale(${zoom}) rotate(${rotate}deg)`;
}

module.exports = Viewer;