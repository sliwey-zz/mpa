var reqwest = require("reqwest");

document.getElementById("loginBtn").addEventListener("click", function() {
    reqwest({
        url: "/login",
        type: "json",
        method: "post",
        data: {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        }
    }).then(function(data) {
        if (data && data.success) {
            window.location.href = "/home/index";
        }
    });

}, false);