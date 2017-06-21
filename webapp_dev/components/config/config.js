module.exports = {
    getMainLineOption: function(yAxisName, seriesName) {
        return {
            tooltip: {
                formatter: "{c}"
            },
            legend: {
                data:[]
            },
            grid: {
              borderWidth: 0
            },
            xAxis: [
                {
                    name: "(日)",
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
            yAxis: [
                {
                    name: "(" + yAxisName + ")",
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
                    },
                    boundaryGap:[0,0.01]
                }
            ],
            series: [
                {
                    name: seriesName,
                    type: "line",
                    symbol: "emptyCircle",
                    itemStyle: {
                        normal: {
                            color: "#90d7ec",
                        }
                    },
                    barWidth: 10,
                    data: [],
                    markLine: {
                        symbol: "none",
                        data: [{type: "average", name: "平均值"}],
                        itemStyle: {
                            normal: {
                                label: false,
                                lineStyle: {
                                    color: "#5ab1ef",
                                    type: "dashed"
                                }
                            }
                        }
                    },
                    markPoint : {
                        symbol: "pin",
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                color: "#ff0000"
                            }
                        },
                        data : [
                            {
                                type: "max",
                                name: "最大值",
                                symbolSize: 4,
                                itemStyle: {
                                    emphasis: {
                                        label: {
                                            show:false
                                        }
                                    }
                                }
                            },
                            {
                                type: "min",
                                name: "最小值",
                                symbolSize: 4,
                                itemStyle: {
                                    normal: {
                                        color: "#999"
                                    },
                                    emphasis: {
                                        label: {
                                            show:false
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        };
    },
    getLineOption: function(title, yAxisName, seriesName) {
        return {
            title: {
                text: title,
                x: "center",
                textStyle: {
                    color: "#1f87d3"
                }
            },
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
                    name: "(日)",
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
                    name: "(" + yAxisName + ")",
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
                    name: seriesName,
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: "#90d7ec",
                        }
                    },
                    barWidth: 5,
                    data: [],
                }
            ]
        }
    },
    get4LineOption: function(title, yAxisName, seriesNames) {
        return {
            title: {
                text: title,
                x: "center",
                textStyle: {
                    color: "#1f87d3"
                }
            },
            tooltip: {
                formatter: "{a}:{c}"
            },
            legend: {
                y: "bottom",
                data:[]
            },
            grid: {
              borderWidth: 0
            },
            xAxis : [
                {
                    name: "(日)",
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
                    name: "(" + yAxisName + ")",
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
                    name: seriesNames[0],
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: "#2ec7c9",
                        }
                    },
                    barWidth: 5,
                    data: [],
                },
                {
                    name: seriesNames[1],
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: "#90d7ec",
                        }
                    },
                    barWidth: 5,
                    data: [],
                },
                {
                    name: seriesNames[2],
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: "#d87a80",
                        }
                    },
                    barWidth: 5,
                    data: [],
                },{
                    name: seriesNames[3],
                    type: "line",
                    itemStyle: {
                        normal: {
                            color: "#ffb980",
                        }
                    },
                    barWidth: 5,
                    data: [],
                }
            ]
        }
    },
    getPieOption: function(title, seriesName) {
        return {
            title: {
                text: title,
                x: "center",
                textStyle: {
                    color: "#1f87d3"
                }
            },
            tooltip: {
                formatter: "{a}:{c}"
            },
            legend: {
                y: "bottom",
                data:[]
            },
            color: ["#2ec7c9", "#90d7ec", "#d87a80", "#ffb980"],
            series : [
                {
                    name: seriesName,
                    type: "pie",
                    radius: "50%",
                    data: [],
                    itemStyle: {
                        normal: {
                            label:{
                                show: true,
                                formatter: '{c}\n{d}%'
                            },
                            labelLine: {show:true}
                        }
                    }
                }
            ]
        }
    },
    getSpeedOption: function() {
        return {
            tooltip: {
                formatter: "{c}"
            },
            legend: {
                data:[]
            },
            grid: {
                x: 40,
                y: 30,
                x2: 40,
                y2: 30,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: "time",
                    boundaryGap: [0.1, 0.1],
                    scale: true,
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
                        },
                        formatter: function(value) {
                            var hour = value.getHours(),
                                minute = value.getMinutes();

                            if (hour < 10) {
                                hour = "0" + hour;
                            }

                            if (minute < 10) {
                                minute = "0" + minute;
                            }

                            return hour + ":" + minute;
                        }
                    },
                    axisTick:{
                      show: false
                    }
                }
            ],
            yAxis: [
                {
                    name: "km/h",
                    type : "value",
                    scale: true,
                    min: 0,
                    max: 120,
                    splitNumber: 4,
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
            series: [
                {
                    name: "速度",
                    type: "line",
                    symbol: "emptyCircle",
                    itemStyle: {
                        normal: {
                            color: "#90d7ec",
                        }
                    },
                    barWidth: 10,
                    data: []
                }
            ]
        };
    }
}