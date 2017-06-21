/**
 * @require search.scss
 */
var template = __inline("search.handlebars");

module.exports = {
    init: function(id, placeholder) {
        var element = document.getElementById(id);

        element.innerHTML = template({placeholder: placeholder});
    }
};