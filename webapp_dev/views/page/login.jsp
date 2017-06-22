<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt"  uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="path" value="${pageContext.request.contextPath}" />
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
	<meta charset="utf-8">
	<title>登录窗口</title>
</head>
<body>
	<form>
		<table>
			<tr>
				<td>用户名：</td>
				<td><input type="text" name="username" value="" id="username"></td>
			</tr>
			<tr>
				<td>用户密码：</td>
				<td><input type="text" name="password" value="" id="password"></td>
			</tr>
			<tr>
				<td><input type="button" name="btn" value="登录" id="loginBtn"></td>
			</tr>
		</table>
	</form>
</body>
</html>