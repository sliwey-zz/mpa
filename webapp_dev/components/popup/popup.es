/**
 * @require popup.scss
 */
const template = __inline('popup.handlebars');
const util = require('../util/util.js');
const CSS_SHOW = 'show';

class Popup{
  constructor({ wrap = document.body, width = '200px', title = '', content = '' }) {
    const id = ('popup_' + +new Date() + Math.random()).replace(/\./g, '');

    wrap.appendChild(util.parseHTML(template({ id, width, title, content })));

    this.element = document.getElementById(id);
    this.titleEle = this.element.querySelector('.popup-title');
    this.contentEle = this.element.querySelector('.popup-content');
    this.element.querySelector('.popup-close').addEventListener('click', () => {
      this.close();
    }, false);

    return this;
  }

  setTitle(title) {
    this.titleEle.textContent = title;
    return this;
  }

  setContent(content) {
    this.contentEle.innerHTML = content;
    return this;
  }

  open() {
    this.element.classList.add(CSS_SHOW);
  }

  close() {
    this.element.classList.remove(CSS_SHOW);
  }
}

module.exports = Popup;