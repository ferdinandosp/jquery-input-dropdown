(function($) {

    $.fn.inputDropdown = function(options) {
        var settings, $container, $input, $dropdownContainer, $listItems, $dropdownArrow, list, dropdownHeight, dropdownOpened, selectedValue;

        function log(args) {
            args = [].slice.call(arguments);
            var ret = args.reduce(function(acc, val, i) {
                return acc.concat(typeof val === 'object' ? JSON.stringify(val) : val);
            }, []);
            if (settings.debug && window.console) {
                console.log.apply(console, ret);
            }
        }

        function isTypeOf(v, type) {
            return typeof v === type;
        }

        function not(fn) {
            return !fn;
        }

        function fail(error) {
            throw error;
        }

        function result(o) {
            if (typeof settings.data === 'function') {
                return o();
            }
            return o;
        }

        function dashify(str) {
            return str.replace(/\s+/, '-');
        }

        function buildList(o, i) {
            var item = ['<li><span>',o,'</span></li>'];
            if (settings.image) {
                item.splice(1,0,'<img src="',settings.image(o),'" alt="">');
            }
            return item.join('');
        }

        function listItemSelect() {
            var $this = $(this),
                value = $this.text();
            if (settings.image) {
                var imageUrl = $this.find('img').attr('src');
                log('Selected image: ' + imageUrl);
                updateInputBg(imageUrl);
            }
            $input.val(value);
            closeDropdown();
            setSelectedValue(value);
        }

        function selectFirst() {
            listItemSelect.call($listItems.filter(':visible').eq(0));
        }

        function setSelectedValue(value) {
            selectedValue = value;
            log('Selected: ' + value);
            settings.onSelect(value);
        }

        function updateInputBg(imageUrl) {
            var image = 'none';
            if (imageUrl) {
                image = 'url(' + imageUrl + ')';
            }
            $input.css({
                'background-image': image
            });
        }

        function openDropdown() {
            if (dropdownOpened) {
                closeDropdown();
            } else {
                $container.addClass('opened');
                $dropdownContainer.show();
                dropdownOpened = true;
                updateDropdownPosition();
            }
        }

        function closeDropdown() {
            $container.removeClass('opened');
            $dropdownContainer.hide();
            dropdownOpened = false;
        }

        function updateDropdownPosition() {
            var offsetTop = $dropdownContainer.offset().top,
                offsetLeft = $dropdownContainer.offset().left;
            dropdownHeight = $(window).height() - offsetTop - 20;
            $dropdownContainer.css({
                'max-height': dropdownHeight,
                position: 'fixed',
                top: offsetTop,
                left: offsetLeft,
                width: $input.outerWidth()
            });
            log('Dropdown offsetTop: ' + offsetTop);
        }

        function inputKeyup(e) {
            var $this = $(this),
                value = $this.val().toLowerCase();
            setSelectedValue(null);

            if (e.keyCode === 13) {
                e.preventDefault();
                selectFirst();
                return;
            }

            if (!dropdownOpened) {
                $input.on('keyup', openDropdown);
            }

            if (settings.image && settings.defaultImage) {
                updateInputBg(settings.defaultImage);
            }

            $listItems.each(function() {
                if (!!~$(this).text().toLowerCase().search(value)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }

        function onEsc() {
            closeDropdown();
        }

        function docKeyup(e) {
            if (e.keyCode === 27) {
                onEsc();
            }
        }

        function init() {

            settings = $.extend({
                container: null,
                onSelect: null,
                data: null,
                toggleButtonl: null,
                image: false,
                debug: false
            }, options);

            if (not(isTypeOf(settings.image, 'function'))) {
                fail(new TypeError('image must be a function'));
            }

            if (not(isTypeOf(settings.onSelect, 'function'))) {
                fail(new TypeError('onSelect must be a function'));
            }

            settings.data = result(settings.data);

            if (!$.isArray(settings.data)) {
                fail(new TypeError('data must evaluate to an array'));
            }

            $container = $(settings.container);
            $input = this;
            $dropdownContainer = $(settings.dropdownContainer);
            $dropdownArrow = $(settings.toggleButton);
            dropdownOpened = false;

            $dropdownContainer.hide();

            list = ['<ul>',
                    $.map(settings.data, buildList).join(''),
                    '</ul>'].join('');

            $dropdownContainer.html(list);
            $listItems = $dropdownContainer.find('li');

            $input.on('keyup.input-dropdown', inputKeyup);
            $listItems.on('click.input-dropdown', listItemSelect);
            $dropdownArrow.on('click.input-dropdown', openDropdown);
            $(document).on('keyup.input-dropdown', docKeyup);
            $(window).on('resize.input-dropdown', updateDropdownPosition);
        }

        init.apply(this, arguments);

    };

})(jQuery);
