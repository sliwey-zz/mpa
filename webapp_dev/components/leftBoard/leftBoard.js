var template = __inline("leftBoard.handlebars"),
    reqwest = require("reqwest");

function Board(id) {
    this.element = document.getElementById(id);

    this.element.innerHTML = template();

    this.avgVehicle = document.getElementById("avgVehicle");
    this.avgTime = document.getElementById("avgTime");

    this.beginPrice = document.getElementById("beginPrice");
    this.baf = document.getElementById("baf");

    // this.weather = document.getElementById("weather");
    this.holiday = document.getElementById("holiday");

    this.percentEle = [
        this.avgVehicle.querySelector(".board-percent"),     // 日均营运车辆
        this.avgTime.querySelector(".board-percent"),        // 日均营运时间
        this.beginPrice.querySelector(".board-percent"),     // 起步价
        this.baf.querySelector(".board-percent"),            // 燃油价
        this.holiday.querySelector(".board-percent"),        // 假期
    ];

    this.CSS_LOADING = "loading";
}

Board.prototype = {
    updateDate: function(year, month, corpId, isMom) {

        // Add Loading.
        this.avgVehicle.classList.add(this.CSS_LOADING);
        this.avgTime.classList.add(this.CSS_LOADING);
        this.beginPrice.classList.add(this.CSS_LOADING);
        this.baf.classList.add(this.CSS_LOADING);
        // this.weather.classList.add(this.CSS_LOADING);
        this.holiday.classList.add(this.CSS_LOADING);

        // 日均营运车辆、日均营运时间
        reqwest({
            url: "/operation/statis/ov",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: 1
            }
        }).then(function(data) {
            if (data && data.success) {

                this.avgVehicle.querySelector(".board-num").innerHTML = data.msg.vehicleNum;
                this.avgTime.querySelector(".board-num").innerHTML = data.msg.serviceTime;

                this.avgVehicle.classList.remove(this.CSS_LOADING);
                this.avgTime.classList.remove(this.CSS_LOADING);
            }
        }.bind(this));

        // 价格
        reqwest({
            url: "/operation/statis/price",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: 1
            }
        }).then(function(data) {
            if (data && data.success) {

                this.beginPrice.querySelector(".board-num").innerHTML = data.msg.startingFare;
                this.baf.querySelector(".board-num").innerHTML = data.msg.baf;

                this.beginPrice.classList.remove(this.CSS_LOADING);
                this.baf.classList.remove(this.CSS_LOADING);
            }
        }.bind(this));

        // 假期
        reqwest({
            url: "/operation/statis/holiday",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: 1
            }
        }).then(function(data) {
            if (data && data.success) {

                // this.weather.querySelector(".board-num").innerHTML = data.msg.weatherNum;
                this.holiday.querySelector(".board-num").innerHTML = data.msg.total;

                // this.weather.classList.remove(this.CSS_LOADING);
                this.holiday.classList.remove(this.CSS_LOADING);
            }
        }.bind(this));

        this.updateRate(year, month, corpId, isMom);

    },
    updateRate: function(year, month, corpId, isMom) {
        var CSS_UP = "up",
            CSS_DOWN = "down",
            CSS_NODATA = "no-data";

        // Add Loading.
        for (var i = 0; i < this.percentEle.length; i++) {
            this.percentEle[i].classList.remove(CSS_NODATA);
            this.percentEle[i].classList.add(this.CSS_LOADING);
        }

        // 日均营运车辆、日均营运时间
        var promiseBusi = reqwest({
            url: "/operation/statis/ov",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: isMom ? 2 : 1
            }
        });

        // 价格
        var promisePrice = reqwest({
            url: "/operation/statis/price",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: isMom ? 2 : 1
            }
        });

        // 假期
        var promiseHoliday = reqwest({
            url: "/operation/statis/holiday",
            type: "json",
            data: {
                corpId: corpId,
                year: year,
                month: month,
                compare: isMom ? 2 : 1
            }
        });

        Promise.all([promiseBusi, promisePrice, promiseHoliday]).then(function(result) {

            if (result && result[0].success && result[1].success && result[2].success) {

                var percentArr = [
                    getPercent(result[0].msg.lastVehicleNum, result[0].msg.vehicleNum),
                    getPercent(result[0].msg.lastServiceTime, result[0].msg.serviceTime),
                    getPercent(result[1].msg.lastStartingFare, result[1].msg.startingFare),
                    getPercent(result[1].msg.lastBaf, result[1].msg.baf),
                    // getPercent(result[2].msg.lastWeatherNum, result[2].msg.weatherNum),
                    getPercent(result[2].msg.lastTotal, result[2].msg.total)
                ];

                for (var i = 0; i < percentArr.length; i++) {

                    if (isNaN(percentArr[i])) {
                        this.percentEle[i].classList.remove(CSS_DOWN);
                        this.percentEle[i].classList.remove(CSS_UP);
                        this.percentEle[i].classList.add(CSS_NODATA);

                        this.percentEle[i].innerHTML = "--";
                        this.percentEle[i].classList.remove(this.CSS_LOADING);

                        continue;
                    }

                    if (percentArr[i] > 0) {
                        this.percentEle[i].classList.remove(CSS_NODATA);
                        this.percentEle[i].classList.remove(CSS_DOWN);
                        this.percentEle[i].classList.add(CSS_UP);
                    }

                    if (percentArr[i] < 0) {
                        this.percentEle[i].classList.remove(CSS_NODATA);
                        this.percentEle[i].classList.remove(CSS_UP);
                        this.percentEle[i].classList.add(CSS_DOWN);
                    }

                    if (+percentArr[i] === 0 ) {
                        this.percentEle[i].classList.remove(CSS_NODATA);
                        this.percentEle[i].classList.remove(CSS_UP);
                        this.percentEle[i].classList.remove(CSS_DOWN);
                    }

                    this.percentEle[i].innerHTML = Math.abs(percentArr[i]) + "%";
                    this.percentEle[i].classList.remove(this.CSS_LOADING);
                }
            }
        }.bind(this));
    }
}

function getPercent(last, curr) {
    if (last === 0) {
        return NaN;
    } else {
        return ((curr - last) / last * 100).toFixed(2);
    }
}

module.exports = {
    init: function(id) {
        return new Board(id);
    }
};