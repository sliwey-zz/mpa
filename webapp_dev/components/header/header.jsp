<c:set var="name" value="${user.userNme}_menu" />
<div class="top">
    <span class="top-com">${user.fullName}</span>
    <div class="top-right">
        <span class="top-name" title="${user.userNme}">${user.userNme}</span>
        <a href="/logout" class="top-logout">退出</a>
    </div>
</div>
<header class="header header-company">
    <h1>信电出租车信息管理系统</h1>
    <ul class="header-menu"><!-- 菜单插入位置 --></ul>
</header>
<script>
    var list = ${resource},
        path = "${path}",
        pathname = window.location.pathname,
        util = require("../util/util.js"),
        storage = util.storage("menu"),
        menuId = storage.get(),
        headerTpl = __inline("header.handlebars"),
        asideMenu,
        headerMenu = list.map(function(x) {
            if (x.list.length > 0) {
                x.url = path + x.list[0].url;
            } else {
                x.url = path + x.url;
            }

            if (pathname.split("/")[1] === x.url.split("/")[1]) {
                x.checked = true;
                asideMenu = x.list;
            }

            return x;
        });

    document.querySelector(".header-menu").innerHTML = headerTpl({list: headerMenu});
</script>