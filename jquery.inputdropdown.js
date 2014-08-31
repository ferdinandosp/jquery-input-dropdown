(function($) {

    version = '0.0.2';

    $.fn.inputDropdown = function(options) {
        var settings, $input, $listItems, $dropdownArrow, $dropdown, $body, list, dropdownHeight, dropdownOpened, selectedValue, currentBackgroundImageValue;

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

        function blur() {
            document.activeElement.blur();
        }

        function lowercase(v) {
            return v.toLowerCase();
        }

        function buildList(o, i) {
            var item = ['<li>','<span>',o,'</span>','</li>'];
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
            blur();
        }

        function selectFirst() {
            listItemSelect.call($listItems.filter(':visible').eq(0));
        }

        function select(value) {
            listItemSelect.call($listItems.filter(function() {
                return lowercase($(this).text()) === lowercase(value);
            }).eq(0));
        }

        function setSelectedValue(value) {
            selectedValue = value;
            log('Selected: ' + value);
            settings.onSelect(value);
        }

        function backgroundImageValue() {
            var url = $input.css('background-image');
            url = /^url\((['"]?)(.*)\1\)$/.exec(url);
            url = url ? url[2] : '';
            url = url.replace([window.location.protocol,'//',window.location.host].join(''), '');
            return url;
        }

        function updateInputBg(imageUrl) {
            var image = 'none';
            if (imageUrl) {
                image = 'url(' + imageUrl + ')';
            }
            currentBackgroundImageValue = imageUrl;
            $input.css({
                'background-image': image
            });
        }

        function openDropdown() {
            if (dropdownOpened) {
                closeDropdown();
            } else {
                $body.addClass('input-dropdown-opened');
                $dropdown.show();
                dropdownOpened = true;
                $dropdown.show();
                updateDropdownPosition();
            }
        }

        function closeDropdown() {
            $body.removeClass('input-dropdown-opened');
            $dropdown.hide();
            dropdownOpened = false;
        }

        function updateDropdownPosition() {
            var offsetTop = $input.offset().top + $input.outerHeight(),
                offsetLeft = $input.offset().left;
            log('offsetTop: ' + offsetTop);
            log('offsetLeft: ' + offsetLeft);
            dropdownHeight = $(window).height() - offsetTop - 20;
            $dropdown.css({
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

            if (e.keyCode === 8 || e.keyCode === 46) {
               currentBackgroundImageValue = null;
            }

            if (!dropdownOpened) {
                $input.on('keyup', openDropdown);
            }

            if (settings.image && settings.defaultImage) {
                log('backgroundImage: ' + backgroundImageValue());
                log('currentBackgroundImage: ' + currentBackgroundImageValue);
                if (backgroundImageValue() !== currentBackgroundImageValue) {
                    log('Image set');
                    updateInputBg(settings.defaultImage);
                }
            }

            if (~$.map(settings.data, lowercase).indexOf(lowercase(value))) {
                log('Match: ' + value);
                select(value);
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

        function stripExceptLetters(c) {
            return c.replace(/[^a-zA-Z-_]/, '');
        }

        function init() {

            settings = $.extend({
                onSelect: null,
                data: null,
                toggleButton: null,
                image: false,
                debug: false,
                dropdownClass: '.dropdown'
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

            $body = $('body');
            $input = this;
            dropdownOpened = false;

            list = ['<div class="',stripExceptLetters(settings.dropdownClass),'"><ul>',
                    $.map(settings.data, buildList).join(''),
                    '</ul></div>'].join('');

            $body.append(list);
            $dropdown = $(settings.dropdownClass);
            $dropdown.hide();
            $listItems = $dropdown.find('li');
            currentBackgroundImageValue = settings.defaultImage;

            $input.on('keyup.input-dropdown', inputKeyup);
            $listItems.on('click.input-dropdown', listItemSelect);
            $(document).on('keyup.input-dropdown', docKeyup);
            $(window).on('resize.input-dropdown', updateDropdownPosition);
            if (settings.toggleButton) {
                $dropdownArrow = $(settings.toggleButton);
                $dropdownArrow.on('click.input-dropdown', openDropdown);
            }
        }

        init.apply(this, arguments);

        return {
          version: version
        };

    };

})(jQuery);
