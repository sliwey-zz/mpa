<aside class="aside aside-company">
	<ul class="nav-list"><!-- 插入位置 --></ul>
</aside>
<script>
    var asideTpl = __inline("aside.handlebars");

    asideMenu = asideMenu.map(function(x) {
        if (pathname.indexOf(x.url) > -1) {
            x.checked = true;
        }

        return x;
    });

    document.querySelector(".nav-list").innerHTML = asideTpl({list: asideMenu});
</script>
