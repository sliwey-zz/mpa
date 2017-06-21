/**
 * @require select.scss
 */
var template = __inline("select.handlebars"),
    util = require("../util/util.js");

var select = {
    init: function(id, theme) {
        var ele = document.getElementById(id),
            options = ele.childNodes,
            theme = theme || "light",
            data = {
                id: "select_" + id,
                value: ele[ele.selectedIndex].innerHTML,
                dataValue: ele.value,
                className: theme + " " + ele.className,
                options: []
            },
            element, input, list, obj, tempEle;

        for (var i = 0; i < options.length; i++) {
            if (options[i].nodeType === 1) {
                obj = {
                    value: options[i].value,
                    text: options[i].text,
                    selected: options[i].selected
                };
                data.options.push(obj);
            }
        }

        // 去重
        tempEle = document.getElementById("select_" + id);
        if (tempEle) {
            tempEle.parentNode.removeChild(tempEle);
        }

        element = util.parseHTML(template(data));

        // add node
        ele.parentNode.insertBefore(element, ele);
        // ele.parentNode.removeChild(ele);

        ele.style.display = "none";

        element = document.getElementById("select_" + id);
        input = element.querySelector(".ui-select-input");
        list = element.querySelector(".ui-select-list");

        element.addEventListener("click", function(event) {
            var CSS_SHOW = "show",
                CSS_SELECTED = "selected",
                newValue = event.target.innerHTML,
                dataValue = event.target.getAttribute("data-value");

            if (list.classList.contains(CSS_SHOW)) {
                list.classList.remove(CSS_SHOW);
            } else {
                list.classList.add(CSS_SHOW);
            }

            if (event.target.classList.contains("ui-select-list-item") && input.getAttribute("value") !== newValue) {

                input.setAttribute("value", newValue);
                input.setAttribute("data-value", dataValue);
                ele.value = dataValue;

                // trigger change event.
                util.fireEvent("change", ele);

                util.each(element.querySelectorAll(".ui-select-list-item"), function() {
                    this.classList.remove(CSS_SELECTED);
                });
                event.target.classList.add(CSS_SELECTED);

            }

        }, false);

        document.addEventListener("click", function(event) {
            var selectId = "select_" + id;

            if (event.target.id !== selectId && event.target.parentNode.id !== selectId) {
                list.classList.remove("show");
            }

        }, false);
    }
}

module.exports = select;