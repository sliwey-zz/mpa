import reqwest from 'reqwest'
import echarts from 'echarts'
import '../../scss/pages/main.scss'
import '../../scss/pages/home.scss'

// const util = require("../../../components/util/util.js");
// const progressRing = require("../../../components/progressRing/progressRing.js");
const map = new AMap.Map("carMap", {
  view: new AMap.View2D({
    zoom: 12,
    rotation: 0
  }),
  lang:"zh_cn"
});

//业务量图表
const bnChart = echarts.init(document.getElementById("bnChart"));
const option = {
  tooltip: {
    formatter: "{a}:{c}"
  },
  legend: {
    data:[]
  },
  grid: {
    borderWidth: 0
  },
  xAxis : [
    {
      name: "(时)",
      type: "category",
      nameTextStyle: {
        color: "#aaa"
      },
      axisLine: {
        lineStyle: {
          color: "#dfe9ec",
          width: 1
        }
      },
      splitLine: {
        lineStyle: {
        color: "#eff4f5"
        }
      },
      axisLabel: {
        textStyle: {
          color: "#aaa"
        }
      },
      axisTick:{
        show: false
      },
      data: []
    }
  ],
  yAxis : [
    {
      name: "(笔)",
      type : "value",
      nameTextStyle: {
        color: "#aaa"
      },
      axisLine: {
        lineStyle: {
          color: "#dfe9ec",
          width: 1
        }
      },
      splitLine: {
        lineStyle: {
        color: "#eff4f5"
        }
      },
      axisLabel: {
        textStyle: {
          color: "#aaa"
        }
      }
    }
  ],
  series : [
    {
      name:"业务量",
      type:"bar",
      itemStyle: {
        normal: {
          color: "#90d7ec",
        }
      },
      barWidth: 15,
      data: [],
    }
  ]
};
const isFirst = true;
// const ringArr = [
//   progressRing.init("ringEmpty", "#5cb300", 0, 0),
//   progressRing.init("ringHeavy", "#ff7800", 0, 0),
//   progressRing.init("ringTask", "#4096fe", 0, 0),
//   progressRing.init("ringOff", "#ababab", 0, 0)
// ];


document.querySelector(".car-num").addEventListener("click", function(event) {
  var target = event.target,
      id = target.getAttribute("data-id");

  if (target.classList.contains("ov-item")) {

    if (id === "2" || id === "4") {
      window.location.href = "/mon/status?status=" + id;
    }

  }

}, false);

document.querySelector(".exception-num").addEventListener("click", function(event) {
  var target = event.target,
      id = target.getAttribute("data-id");

  if (target.classList.contains("ov-item")) {
    window.location.href = "/mon/status?status=" + id;
  }

}, false);

init();

function init() {

  window.onresize = bnChart.resize;

  getData();

  getNews();

  getAllCarsState();
  setInterval(function() {
      getAllCarsState();
  }, 10000);
}

function getAllCars() {
  reqwest({
      url: "/mon/vehicle/all",
      type: "json"
  }).then(function(data) {
  // console.log(data);
      if (data && data.success) {
          var dataList = data.msg.list || [],
              length = dataList.length,
              carList = [],
              position,
              total = data.msg.count || 0;

          for (var i = 0; i < length; i++) {

              position = util.gps2Mars(+dataList[i].locationText.split(",")[0], +dataList[i].locationText.split(",")[1]);

              carList.push({
                  position: [position.lng, position.lat],
                  state: dataList[i].tflag,
                  stateDesc: dataList[i].tflagDesc,
                  driver: dataList[i].driver,
                  mobile: dataList[i].vehiclePhone,
                  driverType: dataList[i].driverPostsType,
                  carNo: dataList[i].vehicleNumber,
                  comp: dataList[i].corp,
                  speed: dataList[i].speed,
                  direction: dataList[i].heading,
                  time: dataList[i].gpsTime
              });
          }

          document.querySelector(".cp-count").innerHTML = "（" + total + "）";

          addMarkers(map, carList);

          // 更新全部车辆状态
          // getAllCarsState();
      }
  });
}

function getAllCarsState() {
    reqwest({
        url: "/data/vehicle/status",
        type: "json"
    }).then(function(data) {
        if (data && data.success) {
            var dataList = data.msg.list,
                length = dataList.length,
                total = 0,
                dataArr = [];

            for (var i = 0; i < length; i++) {
                if (dataList[i].id === 0 || dataList[i].id === 1 || dataList[i].id === 2 || dataList[i].id === 4) {
                    total += +dataList[i].supplement;
                }
            }

            document.querySelector(".number-total").textContent = total;

            if (total > 0) {
                for (var j = 0; j < length; j++) {
                    if (j < 4) {
                        ringArr[j].update(+dataList[j].supplement, (+dataList[j].supplement / total * 100).toFixed(2));
                    }

                    if (dataList[j].id === 101) {
                        document.getElementById("errorMeter").textContent = dataList[j].supplement;
                    }

                    if (dataList[j].id === 102) {
                        document.getElementById("errorTerminal").textContent = dataList[j].supplement;
                    }

                    if (dataList[j].id === 103) {
                        document.getElementById("errorPic").textContent = dataList[j].supplement;
                    }

                    if (dataList[j].id === 104) {
                        document.getElementById("errorRadio").textContent = dataList[j].supplement;
                    }
                }
            }
        }
    })
}

function getNews() {
    reqwest({
        url: "/info/list",
        type: "json",
        data: {
            page: 1,
            type: 1,
            title: "",
            top: -1,
            pagesize: 9
        }
    }).then(function(data) {
        // console.log(data);
        if (data && data.success) {
            var dataList = data.msg.list || [],
                length = dataList.length,
                str = "";

            if (length === 0) {
                document.querySelector(".com-notice").classList.add("no-data");
            }

            for (var i = 0; i < length; i++) {
                str += '<li class="notice-item">'
                    +  '    <a href="/info/view/' + dataList[i].tid + '" class="notice-link" title="' + dataList[i].title + '">' + dataList[i].title + '</a>'
                    +  '</li>';
            }

            document.querySelector(".notice-list").innerHTML = str;
        } else{
            document.querySelector(".com-notice").classList.add("no-data");
        }
    }).always(function() {
        // loading.classList.remove(CSS_SHOW);
    });
}

function getState(state) {
    var className = "";

    switch (state) {
        case 0:
            className = "empty";
            break;
        case 1:
            className = "heavy";
            break;
        case 2:
            classsName = "task";
            break;
        case 4:
            className = "off";
            break;
        default:
            className = "off";
            break;
    }

    return className;
}

function addMarkers(map, list) {
    var length = list.length,
        markers = new Array(length),
        number;

    for (var i = 0; i < length; i++) {
        number = list[i].carNo;

        if (number in carMap) {
            carMap[number].marker.setPosition(list[i].position);
            carMap[number].marker.setContent('<div data-no="' + number + '"><div class="mi-poi ' + getState(list[i].state) + '"></div></div>');
            carMap[number].marker.setLabel({
                offset: new AMap.Pixel(-20, 30),
                content: '<div class="mi-label ' + getState(list[i].state) + '">浙BT' + number + '</div>'
            });
            carMap[number].state = list[i].state;
            carMap[number].stateDesc = list[i].stateDesc;
            carMap[number].driver = list[i].driver;
            carMap[number].mobile = list[i].mobile;
            carMap[number].driverType = list[i].driverType;
            carMap[number].carNo = list[i].carNo;
            carMap[number].comp = list[i].comp;
            carMap[number].speed = list[i].speed;
            carMap[number].direction = list[i].direction;
            carMap[number].time = list[i].time;
        } else {

            markers[i] = new AMap.Marker({
                map: map,
                position: list[i].position,
                content: '<div data-no="' + number + '"><div class="mi-poi ' + getState(list[i].state) + '"></div></div>'
            });

            // 设置label标签
            markers[i].setLabel({
                offset: new AMap.Pixel(-20, 30),
                content: '<div class="mi-label ' + getState(list[i].state) + '">浙BT' + list[i].carNo + '</div>'
            });

            carMap[number] = {
                marker: markers[i],
                state: list[i].state,
                stateDesc: list[i].stateDesc,
                driver: list[i].driver,
                mobile: list[i].mobile,
                driverType: list[i].driverType,
                carNo: list[i].carNo,
                comp: list[i].comp,
                speed: list[i].speed,
                direction: list[i].direction,
                time: list[i].time
            };
        }
    }

    if (isFirst) {

        var sts=[{
            url: __inline("../../images/map_circle_1.png"),
            size:new AMap.Size(75,75),
            offset:new AMap.Pixel(-16,-30),
            textColor:'#666',
            textSize: 14
        },{
            url: __inline("../../images/map_circle_2.png"),
            size:new AMap.Size(95,95),
            offset:new AMap.Pixel(-16,-30),
            textColor:'#666',
            textSize: 14
        },{
            url: __inline("../../images/map_circle_3.png"),
            size:new AMap.Size(115,115),
            offset:new AMap.Pixel(-24,-45),
            textColor:'#666',
            textSize: 14
        },{
            url: __inline("../../images/map_circle_4.png"),
            size:new AMap.Size(135,135),
            offset:new AMap.Pixel(-24,-45),
            textColor:'#666',
            textSize: 14
        }];

        map.plugin(["AMap.MarkerClusterer"],function() {
            var cluster = new AMap.MarkerClusterer(map,markers, {
                minClusterSize: 5,
                styles: sts
            });
        });

        isFirst = false;
    }
}

function getData() {
    reqwest({
        url: "/operation/statis/day",
        type: "json"
    }).then(function(data) {
        if (data && data.success) {
            var dataList = data.msg.dispatchList || [],
                length = dataList.length,
                timeRange = [],
                values = [];

            document.getElementById("totalNum").innerHTML = data.msg.dispatch;
            document.getElementById("money").innerHTML = data.msg.money;
            document.getElementById("mile").innerHTML = data.msg.distance;
            document.getElementById("seatNum").innerHTML = data.msg.seatDispatch;
            document.getElementById("seatRatio").innerHTML = data.msg.seatDispatchRatio + "%";

            for (var i = 0; i < length; i++) {
                timeRange.push(dataList[i].hour);
                values.push(dataList[i].number);
            }

            option.xAxis[0].data = timeRange;
            option.series[0].data = values;
            bnChart.setOption(option);

        }
    })
}