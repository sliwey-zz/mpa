/**
 * @require progressRing.scss
 */
var template = __inline("progressRing.handlebars");

function Ring(id, color, number, percent) {
    this.element = document.getElementById(id);
    this.color = color;

    this.element.innerHTML = template({
        num: number,
        percent: percent + "%"
    });

    this.number = this.element.querySelector(".data-num");
    this.percent = this.element.querySelector(".data-percent");

    this.canvas = this.element.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.element.querySelector(".progress-ring").clientWidth;
    this.canvas.height = this.element.querySelector(".progress-ring").clientHeight;

    this.ctx.fillStyle = color;

    animation(this.canvas, percent);
}

Ring.prototype = {
    update: function(number, percent) {
        if (+this.number.innerText === number && this.percent.innerText === percent + "%") {
            return;
        }

        this.number.innerText = number;
        this.percent.innerText = percent + "%";

        animation(this.canvas, percent);
    }
}

function animation(canvas, percent) {
    var ctx = canvas.getContext("2d"),
        p = 0;

    function _animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(55,55);
        ctx.arc(55, 55, 55, -Math.PI/2, Math.PI*2*p*0.01 - Math.PI/2, false);
        ctx.closePath();
        ctx.fill();

        if (p++ <= percent) {
            requestAnimationFrame(_animate);
        }
    }

    requestAnimationFrame(_animate);
}

var progressRing = {
    init: function(id, color, number, percent) {
        return new Ring(id, color, number, percent);
    }
};

module.exports = progressRing;