(function($) {

  version = '0.0.2';

  $.fn.inputDropdown = function(options) {
    var settings, $input, $list, $listItems, $nextItem, $keyItem, $dropdownArrow, $dropdown, $dropdownInner, $body, list, dropdownHeight, dropdownOpened, selectedValue, currentBackgroundImageValue, keys;

    keys = {
      DOWN: 40,
      UP: 38,
      ENTER: 13
    };

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
      $dropdownInner.css({
        'max-height': dropdownHeight,
        'overflow': 'auto',
        '-webkit-overflow-scrolling': 'touch'
      });
      log('Dropdown offsetTop: ' + offsetTop);
    }

    function inputKeyUp(e) {
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

    function docKeyUp(e) {
      if (e.keyCode === 27) {
        onEsc();
      }
    }

    function docKeyDown(e) {
      if (e.which === keys.DOWN) {
        if (!dropdownOpened) {
          openDropdown();
        }
        if ($keyItem) {
          if ($keyItem.index('li') === $listItems.last().index('li')) { return false; }
          if ($keyItem.position().top + $keyItem.outerHeight()*2 >= $dropdownInner.outerHeight()) {
            $dropdownInner.scrollTop($dropdownInner.scrollTop() + $keyItem.outerHeight());
          }
          $keyItem.removeClass(settings.highlightClass);
          $nextItem = $keyItem.nextAll('li:visible').eq(0);
          if ($nextItem.length > 0){
            $keyItem = $nextItem.addClass(settings.highlightClass);
          } else {
            $keyItem = $listItems.filter(':visible').eq(0).addClass(settings.highlightClass);
          }
        } else {
          $keyItem = $listItems.filter(':visible').eq(0).addClass(settings.highlightClass);
        }
        return false;
      } else if (e.which === keys.UP) {
        if ($keyItem) {
          if ($keyItem.index('li') === 0) { return false; }
          if ($keyItem.position().top === 0) {
            $dropdownInner.scrollTop($dropdownInner.scrollTop() + ($keyItem.position().top - $keyItem.outerHeight()));
          }
          $keyItem.removeClass(settings.highlightClass);
          $nextItem = $keyItem.prevAll('li:visible').eq(0);
          if ($nextItem.length > 0) {
            $keyItem = $nextItem.addClass(settings.highlightClass);
          } else {
            $keyItem = $listItems.filter(':visible').last().addClass(settings.highlightClass);
          }
        } else {
          $keyItem = $listItems.filter(':visible').last().addClass(settings.highlightClass);
        }
        return false;
      }

      if (e.which === keys.ENTER) {
        if ($keyItem) {
          listItemSelect.call($keyItem);
          $keyItem = null;
        }
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
        dropdownClass: '.dropdown',
        highlightClass: '.highlight'
      }, options);

      if (not(isTypeOf(settings.image, 'function'))) {
        fail(new TypeError('image must be a function'));
      }

      if (not(isTypeOf(settings.onSelect, 'function'))) {
        fail(new TypeError('onSelect must be a function'));
      }

      settings.data = result(settings.data);
      settings.highlightClass = stripExceptLetters(settings.highlightClass);

      if (!$.isArray(settings.data)) {
        fail(new TypeError('data must evaluate to an array'));
      }

      $body = $('body');
      $input = this;
      dropdownOpened = false;

      list = ['<div class="',stripExceptLetters(settings.dropdownClass),'"><div class="',stripExceptLetters(settings.dropdownClass) + '-inner','"><ul>',
        $.map(settings.data, buildList).join(''),
        '</ul></div></div>'].join('');

        $body.append(list);
        $dropdown = $(settings.dropdownClass);
        $dropdownInner = $(settings.dropdownClass + '-inner');
        $dropdown.hide();
        $list = $dropdown.find('ul');
        $listItems = $dropdown.find('li');
        currentBackgroundImageValue = settings.defaultImage;

        $input.on('keyup.input-dropdown', inputKeyUp);
        $listItems.on('click.input-dropdown', listItemSelect);
        $(document).on('keyup.input-dropdown', docKeyUp);
        $(window).on('resize.input-dropdown', updateDropdownPosition);
        $(window).on('keydown.input-dropdown', docKeyDown);
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
