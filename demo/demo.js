(function(global) {

    function dashify(str) {
        return str.replace(/\s+/, '-');
    }

    $('.indpn-input').inputDropdown({
        data: function() {
            return $.map(global.DEMO.countries, function(o,i) {
                return o.text;
            });
        },
        onSelect: function(selected) {
            //console.log('selected:', selected);
        },
        toggleButton: $('.indpn-dropdown-arrow'),
        container: $('.indpn-container'),
        dropdownContainer: $('.indpn-dropdown'),
        image: function(item) {
            return ['images/flags/32/',dashify(item),'.png'].join('');
        },
        defaultImage: 'images/search.png',
        debug: true
    });
})(this);
