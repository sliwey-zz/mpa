<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt"  uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="path" value="${pageContext.request.contextPath}" />
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
  <meta charset="utf-8">
  <meta name="renderer" content="webkit">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
  <title>信电出租车信息管理系统</title>
</head>
<body>
  <%@include file="../layout/header.jsp"%>
  <%@include file="../layout/aside.jsp"%>
  <div class="content">
    <h2 class="crumbs">首页</h2>
    <div class="overview-wrap">
      <div class="ov-left">
        <div class="car-num">
          <div class="ov-item cn-total" data-id="0">
            <div class="cn-wrap">
              <p>车辆总数</p>
              <p class="number-total">0</p>
            </div>
          </div>
          <div class="ov-item" data-id="0">
            <div id="ringEmpty" class="num-ring"></div>
            <p>空车</p>
          </div>
          <div class="ov-item" data-id="1">
            <div id="ringHeavy" class="num-ring"></div>
            <p>重车</p>
          </div>
          <div class="ov-item" data-id="2">
            <div id="ringTask" class="num-ring"></div>
            <p>任务车</p>
          </div>
          <div class="ov-item" data-id="4">
            <div id="ringOff" class="num-ring"></div>
            <p>未登录/停运</p>
          </div>
        </div>
      </div>
      <div class="ov-right">
        <div class="exception-num">
          <div class="ov-item" data-id="101">
            <div id="errorMeter" class="num-round">0</div>
            <p>计价器故障</p>
          </div>
          <div class="ov-item" data-id="102">
            <div id="errorTerminal" class="num-round">0</div>
            <p>终端故障</p>
          </div>
          <div class="ov-item" data-id="103">
            <div id="errorPic" class="num-round">0</div>
            <p>照片故障</p>
          </div>
          <div class="ov-item" data-id="104">
            <div id="errorRadio" class="num-round">0</div>
            <p>录音故障</p>
          </div>
        </div>
      </div>
    </div>
    <div class="overview-wrap">
      <div class="ov-left">
        <div class="business-num">
          <h3 class="bn-title">
            业务量
            <span class="bn-total">
              总量(笔)：<span id="totalNum" class="bn-number">0</span>
            </span>
          </h3>
          <div id="bnChart" class="bn-chart"></div>
        </div>
      </div>
      <div class="ov-right flex-wrap">
        <div class="statistic-num">
          <table class="sn-table">
            <tbody>
              <tr class="sn-row">
                <td class="sn-cell">
                  <p>营收</p>
                  <p>(元)</p>
                </td>
                <td id="money" class="sn-cell" colspan="2">0</td>
              </tr>
              <tr class="sn-row">
                <td class="sn-cell">
                  <p>里程</p>
                  <p>(M)</p>
                </td>
                <td id="mile" class="sn-cell" colspan="2">0</td>
              </tr>
              <tr class="sn-row">
                <td class="sn-cell">电召</td>
                <td id="seatNum" class="sn-cell cell-corner">0</td>
                <td id="seatRatio" class="sn-cell cell-corner">0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="com-notice">
          <h2 class="notice-title">公告</h2>
          <ul class="notice-list"><!--待插入--></ul>
        </div>
      </div>
    </div>
  </div>
  <%@include file="../layout/footer.jsp"%>
  <script src="http://webapi.amap.com/maps?v=1.3&key=539e96e62a32d7818e821d724052cd81"></script>
</body>
</html>