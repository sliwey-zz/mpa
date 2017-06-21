/**
 * @require toast.scss
 */
var util = require("../util/util.js");

module.exports = {
    show: function(msg) {
        var node = util.parseHTML('<div class="toast">' + msg + '</div>');
        document.body.appendChild(node);

        setTimeout(function() {
            document.body.removeChild(document.querySelector(".toast"));
        }, 1500);
    }
}