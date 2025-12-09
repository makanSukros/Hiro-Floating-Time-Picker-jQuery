/*! Fancy Floating Time Picker (jQuery)
 *  Author: makanSukros
 *  Version: 1.0.1
 *  Features:
 *    - 12-hour view (hours, minutes, AM/PM)  -> mode: "12h"
 *    - 24-hour view (hours, minutes only)    -> mode: "24h"
 *    - minuteStep list (default: 5)
 *    - floating popup anchored ke input
 *    - autoApply & closeOnScroll
 *
 *  Options:
 *    - mode:         "12h" | "24h" (default: "12h")
 *    - selectedTime: Date | "HH:mm" | "hh:mm AM/PM"
 *                    (contoh: "05:30", "05:30 PM")
 *    - minuteStep:   number (default: 5)  // 1..30
 *    - autoApply:    boolean (default: false)
 *    - closeOnScroll:boolean (default: false)
 *    - onChange:     function(timeObj, formattedStr)
 *                    // timeObj: {hours:0-23, minutes:0-59, totalMinutes}
 *                    // formattedStr:
 *                    //   mode "24h" => "HH:mm"
 *                    //   mode "12h" => "hh:mm AM/PM"
 *
 *  Usage:
 *    $('input').simpleTimePicker({ mode: '24h', ... });
 */

(function ($) {
  'use strict';

  // =========================
  //  Inject CSS (once)
  // =========================
function injectStyles() {
  if (document.getElementById('fancy-time-picker-style')) return;

  var css = ''
    + '.stp-popup{position:absolute;z-index:9999;background:#FFFFFF;'
    // border + shadow persis seperti datepicker
    + 'border-radius:8px;border:1px solid rgba(226,232,240,0.95);'
    + 'box-shadow:0 18px 40px -24px rgba(15,23,42,0.20),0 0 0 1px rgba(148,163,184,0.15);'
    + 'width:188px;display:inline-flex;flex-direction:column;align-items:flex-start;'
    + 'opacity:0;transform:translateY(-4px);pointer-events:none;'
    + 'transition:opacity 0.14s ease-out,transform 0.14s ease-out;}\n'
    + '.stp-popup.stp-open{opacity:1;transform:translateY(0);pointer-events:auto;}\n'
    + '.stp-popup *{box-sizing:border-box;font-family:Mulish,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}\n'

    + '.stp-main{align-self:stretch;overflow:hidden;display:flex;flex-direction:column;align-items:center;}\n'
    + '.stp-main-inner{align-self:stretch;display:flex;flex-direction:column;align-items:flex-start;}\n'
    + '.stp-cols{align-self:stretch;display:inline-flex;justify-content:center;align-items:flex-start;}\n'
    + '.stp-col{flex:1 1 0;padding-top:16px;padding-bottom:16px;'
    + 'display:inline-flex;flex-direction:column;align-items:stretch;}\n'
    + '.stp-col--border{border-right:1px #EAECF0 solid;}\n'

    + '.stp-list{width:100%;display:flex;flex-direction:column;align-items:center;}\n'
    + '.stp-items{display:flex;flex-direction:column;align-items:center;gap:0;}\n'

    // scroll cantik hanya untuk jam & menit di mode 24 jam
    + '.stp-mode-24h .stp-col-hours .stp-list,'
    + '.stp-mode-24h .stp-col-minutes .stp-list{'
    + 'max-height:240px;overflow-y:auto;padding-right:4px;'
    + 'scrollbar-width:thin;scrollbar-color:#CBD2E0 transparent;}\n'
    + '.stp-mode-24h .stp-col-hours .stp-list::-webkit-scrollbar,'
    + '.stp-mode-24h .stp-col-minutes .stp-list::-webkit-scrollbar{width:6px;}\n'
    + '.stp-mode-24h .stp-col-hours .stp-list::-webkit-scrollbar-track,'
    + '.stp-mode-24h .stp-col-minutes .stp-list::-webkit-scrollbar-track{background:transparent;}\n'
    + '.stp-mode-24h .stp-col-hours .stp-list::-webkit-scrollbar-thumb,'
    + '.stp-mode-24h .stp-col-minutes .stp-list::-webkit-scrollbar-thumb{background:#CBD2E0;border-radius:3px;}\n'
    + '.stp-mode-24h .stp-col-hours .stp-list::-webkit-scrollbar-thumb:hover,'
    + '.stp-mode-24h .stp-col-minutes .stp-list::-webkit-scrollbar-thumb:hover{background:#A0AEC0;}\n'

    + '.stp-item{width:40px;height:40px;border-radius:9999px;'
    + 'display:flex;align-items:center;justify-content:center;'
    + 'cursor:pointer;background:transparent;border:none;margin:0;}\n'
    + '.stp-item span{display:block;width:24px;text-align:center;'
    + 'color:#30374F;font-size:14px;font-weight:400;line-height:20px;}\n'
    + '.stp-item--selected{background:#404968;}\n'
    + '.stp-item--selected span{color:#FFFFFF;font-weight:500;'
    + 'font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}\n'
    + '.stp-item:hover:not(.stp-item--selected){background:#EFF1F5;}\n'

    + '.stp-footer{align-self:stretch;padding:16px;border-top:1px #EAECF0 solid;'
    + 'display:flex;flex-direction:column;gap:12px;}\n'
    + '.stp-footer-inner{align-self:stretch;display:flex;flex-direction:column;gap:12px;}\n'
    + '.stp-btn-apply{align-self:stretch;padding:10px 16px;'
    + 'background:linear-gradient(10deg,#8E24AA 0%,#FF6E40 100%);'
    + 'box-shadow:0 1px 2px rgba(16,24,40,0.05);border-radius:6px;'
    + 'outline:1px #8E24AA solid;outline-offset:-1px;border:none;cursor:pointer;'
    + 'display:inline-flex;justify-content:center;align-items:center;gap:8px;}\n'
    + '.stp-btn-apply span{color:#FFFFFF;font-size:14px;font-weight:600;line-height:20px;}\n'
    + '.stp-btn-apply.stp-disabled{opacity:0.5;cursor:default;}\n';

  var style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'fancy-time-picker-style';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  document.head.appendChild(style);
}


  // =========================
  //  Utils waktu
  // =========================
  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  // parse string waktu: "HH:mm" (24h) atau "hh:mm AM/PM"
  function parseTime(value) {
    if (!value) return null;

    if (Object.prototype.toString.call(value) === '[object Date]') {
      return {
        hours: value.getHours(),
        minutes: value.getMinutes()
      };
    }

    if (typeof value === 'string') {
      var str = value.trim();
      if (!str) return null;

      var m = str.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
      if (!m) return null;

      var h = parseInt(m[1], 10);
      var min = parseInt(m[2], 10);
      var mer = m[3] ? m[3].toUpperCase() : null;

      if (isNaN(h) || isNaN(min) || min < 0 || min > 59) return null;

      if (mer) {
        if (h < 1 || h > 12) return null;
        if (mer === 'AM') {
          if (h === 12) h = 0;
        } else if (mer === 'PM') {
          if (h !== 12) h = h + 12;
        }
      } else {
        if (h < 0 || h > 23) return null;
      }

      return { hours: h, minutes: min };
    }

    return null;
  }

  function formatTime24(timeObj) {
    if (!timeObj) return '';
    return pad2(timeObj.hours) + ':' + pad2(timeObj.minutes);
  }

  function getHour12(hours24) {
    var h = hours24 % 12;
    return h === 0 ? 12 : h;
  }

  function getPeriod(hours24) {
    return hours24 < 12 ? 'AM' : 'PM';
  }

  function formatTime12(timeObj) {
    if (!timeObj) return '';
    var h12 = getHour12(timeObj.hours);
    var period = getPeriod(timeObj.hours);
    return pad2(h12) + ':' + pad2(timeObj.minutes) + ' ' + period;
  }

  function formatDisplayTime(timeObj, mode) {
    if (!timeObj) return '';
    if (mode === '24h') return formatTime24(timeObj);
    return formatTime12(timeObj);
  }

  function normalizeTimeToStep(timeObj, step) {
    if (!timeObj) return null;
    var h = timeObj.hours;
    var m = timeObj.minutes;
    if (step > 1) {
      if (m < 0) m = 0;
      if (m > 59) m = 59;
      m = m - (m % step);
    }
    return { hours: h, minutes: m };
  }

  function toHour24(hour12, period) {
    var h = parseInt(hour12, 10);
    if (isNaN(h)) h = 12;
    h = h % 12;
    if (h === 0) h = 12;
    if (period === 'AM') {
      return h === 12 ? 0 : h;
    } else {
      return h === 12 ? 12 : h + 12;
    }
  }

  // =========================
  //  Helper: throttle + rAF
  // =========================
  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      var remaining = wait - (now - last);
      var ctx = this, args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        last = now;
        fn.apply(ctx, args);
      } else if (!timer) {
        timer = setTimeout(function () {
          last = Date.now();
          timer = null;
          fn.apply(ctx, args);
        }, remaining);
      }
    };
  }

  function rAF(fn) {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(fn);
    } else {
      setTimeout(fn, 16);
    }
  }

  // =========================
  //  Defaults
  // =========================
  var defaults = {
    mode: '12h',
    selectedTime: null,
    minuteStep: 5,
    autoApply: false,
    closeOnScroll: false,
    onChange: function (timeObj, formattedStr) { }
  };

  // =========================
  //  Instance per input
  // =========================
  function createInstance($input, opts) {
    var options = $.extend({}, defaults, opts || {});

    var mode = (options.mode === '24h') ? '24h' : '12h';
    options.mode = mode;

    var minuteStep = parseInt(options.minuteStep, 10);
    if (!minuteStep || minuteStep < 1 || minuteStep > 30) {
      minuteStep = 5;
    }

    var initialVal = $input.val();
    var committed = null;

    if (options.selectedTime) {
      committed = parseTime(options.selectedTime);
    } else if (initialVal) {
      committed = parseTime(initialVal);
    }

    if (!committed) {
      var now = new Date();
      committed = {
        hours: now.getHours(),
        minutes: now.getMinutes()
      };
    }

    committed = normalizeTimeToStep(committed, minuteStep);

    var state = {
      pending: { hours: committed.hours, minutes: committed.minutes },
      committed: { hours: committed.hours, minutes: committed.minutes },
      minuteStep: minuteStep
    };

    var instanceId = 'stp' + Math.random().toString(36).slice(2, 10);
    var popupId = 'stp-' + instanceId;

    // =========================
    //  HTML popup
    // =========================
    var popupHtml =
      '<div class="stp-popup" role="dialog" aria-modal="true" id="' + popupId + '" ' +
      'data-stp-id="' + instanceId + '" style="display:none;">' +
      '  <div class="stp-main">' +
      '    <div class="stp-main-inner">' +
      '      <div class="stp-cols">' +
      '        <div class="stp-col stp-col--border stp-col-hours">' +
      '          <div class="stp-list stp-list-hours">' +
      '            <div class="stp-items stp-items-hours"></div>' +
      '          </div>' +
      '        </div>' +
      '        <div class="stp-col stp-col-minutes stp-col--border">' +
      '          <div class="stp-list stp-list-minutes">' +
      '            <div class="stp-items stp-items-minutes"></div>' +
      '          </div>' +
      '        </div>' +
      '        <div class="stp-col stp-col-period">' +
      '          <div class="stp-list stp-list-period">' +
      '            <div class="stp-items stp-items-period"></div>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="stp-footer">' +
      '    <div class="stp-footer-inner">' +
      '      <button type="button" class="stp-btn-apply"><span>Apply</span></button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var $popup = $(popupHtml);
    $popup.addClass('stp-mode-' + options.mode);
    $('body').append($popup);

    var $hoursWrap = $popup.find('.stp-items-hours');
    var $minutesWrap = $popup.find('.stp-items-minutes');
    var $periodWrap = $popup.find('.stp-items-period');
    var $applyBtn = $popup.find('.stp-btn-apply');
    var $colMinutes = $popup.find('.stp-col-minutes');
    var $colPeriod = $popup.find('.stp-col-period');

    // input readonly + ARIA
    $input
      .attr('readonly', 'readonly')
      .attr('aria-haspopup', 'dialog')
      .attr('aria-expanded', 'false')
      .attr('aria-controls', popupId);

    // =========================
    //  Internal helpers
    // =========================
    function updateInputFromCommitted() {
      var t = state.committed;
      var display = t ? formatDisplayTime(t, options.mode) : '';
      $input.val(display);

      if (typeof options.onChange === 'function') {
        var obj = t
          ? {
            hours: t.hours,
            minutes: t.minutes,
            totalMinutes: t.hours * 60 + t.minutes
          }
          : null;
        options.onChange(obj, display);
      }
    }

    function render() {
      $hoursWrap.empty();
      $minutesWrap.empty();
      $periodWrap.empty();

      var base = state.pending || state.committed;
      if (!base) {
        base = { hours: 0, minutes: 0 };
      }
      var h24 = base.hours;
      var m = base.minutes;

      if (options.mode === '12h') {
        var h12 = getHour12(h24);
        var period = getPeriod(h24);

        for (var h = 1; h <= 12; h++) {
          var $itemH = $('<button type="button" class="stp-item stp-item-hour"><span></span></button>');
          $itemH.attr('data-hour12', h);
          $itemH.find('span').text(pad2(h));
          if (h === h12) {
            $itemH.addClass('stp-item--selected');
          }
          $hoursWrap.append($itemH);
        }

        var step = state.minuteStep;
        for (var mm = 0; mm < 60; mm += step) {
          var $itemM = $('<button type="button" class="stp-item stp-item-minute"><span></span></button>');
          $itemM.attr('data-minute', mm);
          $itemM.find('span').text(pad2(mm));
          if (mm === m) {
            $itemM.addClass('stp-item--selected');
          }
          $minutesWrap.append($itemM);
        }

        ['AM', 'PM'].forEach(function (p) {
          var $itemP = $('<button type="button" class="stp-item stp-item-period"><span></span></button>');
          $itemP.attr('data-period', p);
          $itemP.find('span').text(p);
          if (p === period) {
            $itemP.addClass('stp-item--selected');
          }
          $periodWrap.append($itemP);
        });

        $colMinutes.addClass('stp-col--border');
        $colPeriod.show();

      } else {
        // 24h
        for (var hh = 0; hh <= 23; hh++) {
          var $itemH24 = $('<button type="button" class="stp-item stp-item-hour24"><span></span></button>');
          $itemH24.attr('data-hour24', hh);
          $itemH24.find('span').text(pad2(hh));
          if (hh === h24) {
            $itemH24.addClass('stp-item--selected');
          }
          $hoursWrap.append($itemH24);
        }

        var step24 = state.minuteStep;
        for (var mm24 = 0; mm24 < 60; mm24 += step24) {
          var $itemM24 = $('<button type="button" class="stp-item stp-item-minute"><span></span></button>');
          $itemM24.attr('data-minute', mm24);
          $itemM24.find('span').text(pad2(mm24));
          if (mm24 === m) {
            $itemM24.addClass('stp-item--selected');
          }
          $minutesWrap.append($itemM24);
        }

        $colMinutes.removeClass('stp-col--border');
        $colPeriod.hide();
      }
    }

    function positionPopup() {
      var offset = $input.offset();
      if (!offset) return;
      var inputHeight = $input.outerHeight();
      var scrollTop = $(window).scrollTop();
      var viewportHeight = $(window).height();
      var popupHeight = $popup.outerHeight();
      var topBelow = offset.top + inputHeight + 4;
      var topAbove = offset.top - popupHeight - 4;
      var top = topBelow;

      if (topBelow - scrollTop + popupHeight > viewportHeight && topAbove > scrollTop) {
        top = topAbove;
      }

      var left = offset.left;
      var popupWidth = $popup.outerWidth();
      var viewportWidth = $(window).width();
      if (left + popupWidth > viewportWidth) {
        left = offset.left + $input.outerWidth() - popupWidth;
        if (left < 0) left = 0;
      }

      $popup.css({ top: top, left: left });
    }

    function openPopup() {
      if ($popup.hasClass('stp-open')) {
        positionPopup();
        return;
      }
      render();
      $popup.show();
      positionPopup();
      rAF(function () {
        $popup.addClass('stp-open');
      });
      $input.attr('aria-expanded', 'true');
    }

    function closePopup() {
      if (!$popup.hasClass('stp-open')) return;
      $popup.removeClass('stp-open');
      $input.attr('aria-expanded', 'false');
      setTimeout(function () {
        if (!$popup.hasClass('stp-open')) {
          $popup.hide();
        }
      }, 160);
    }

    function commitPendingAndClose() {
      if (!state.pending && !state.committed) return;
      if (state.pending) {
        state.committed = {
          hours: state.pending.hours,
          minutes: state.pending.minutes
        };
      }
      updateInputFromCommitted();
      closePopup();
    }

    function handleSelection(kind, value) {
      var base = state.pending || state.committed;
      if (!base) base = { hours: 0, minutes: 0 };

      var h24 = base.hours;
      var m = base.minutes;

      if (options.mode === '12h') {
        if (kind === 'hour12') {
          var period = getPeriod(h24);
          h24 = toHour24(value, period);
        } else if (kind === 'minute') {
          m = value;
        } else if (kind === 'period') {
          var h12 = getHour12(h24);
          h24 = toHour24(h12, value);
        }
      } else {
        if (kind === 'hour24') {
          h24 = value;
        } else if (kind === 'minute') {
          m = value;
        }
      }

      state.pending = { hours: h24, minutes: m };
      render();

      if (options.autoApply) {
        commitPendingAndClose();
      }
    }

    var throttledReposition = throttle(function () {
      if ($popup.hasClass('stp-open')) {
        positionPopup();
      }
    }, 50);

    // =========================
    //  Events
    // =========================
    $input.on('focus.' + instanceId + ' click.' + instanceId, function () {
      openPopup();
    });

    $input.on('keydown.' + instanceId, function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closePopup();
      }
    });

    $popup.on('click.' + instanceId, '.stp-item-hour', function () {
      if (options.mode !== '12h') return;
      var h12 = parseInt($(this).attr('data-hour12'), 10);
      if (isNaN(h12)) return;
      handleSelection('hour12', h12);
    });

    $popup.on('click.' + instanceId, '.stp-item-hour24', function () {
      if (options.mode !== '24h') return;
      var h24 = parseInt($(this).attr('data-hour24'), 10);
      if (isNaN(h24)) return;
      handleSelection('hour24', h24);
    });

    $popup.on('click.' + instanceId, '.stp-item-minute', function () {
      var mm = parseInt($(this).attr('data-minute'), 10);
      if (isNaN(mm)) return;
      handleSelection('minute', mm);
    });

    $popup.on('click.' + instanceId, '.stp-item-period', function () {
      if (options.mode !== '12h') return;
      var p = $(this).attr('data-period');
      if (p !== 'AM' && p !== 'PM') return;
      handleSelection('period', p);
    });

    $popup.on('click.' + instanceId, '.stp-btn-apply', function () {
      if ($applyBtn.hasClass('stp-disabled')) return;
      commitPendingAndClose();
    });

    $(window).on('resize.' + instanceId + ' scroll.' + instanceId, function (e) {
      if (options.closeOnScroll && e.type === 'scroll' && $popup.hasClass('stp-open')) {
        closePopup();
        return;
      }
      throttledReposition();
    });

    $(document).on('mousedown.' + instanceId, function (e) {
      if (!$popup.hasClass('stp-open')) return;
      if (
        $popup.is(e.target) || $popup.has(e.target).length ||
        $input.is(e.target) || $input.has(e.target).length
      ) {
        return;
      }
      closePopup();
    });

    // =========================
    //  Public API
    // =========================
    var api = {
      getTime: function () {
        if (!state.committed) return null;
        return {
          hours: state.committed.hours,
          minutes: state.committed.minutes,
          totalMinutes: state.committed.hours * 60 + state.committed.minutes
        };
      },
      setTime: function (value) {
        var t = value ? parseTime(value) : null;
        if (!t) return;
        t = normalizeTimeToStep(t, state.minuteStep);
        state.committed = { hours: t.hours, minutes: t.minutes };
        state.pending = { hours: t.hours, minutes: t.minutes };
        updateInputFromCommitted();
        if ($popup.hasClass('stp-open')) {
          render();
        }
      },
      open: function () { openPopup(); },
      close: function () { closePopup(); },
      destroy: function () {
        $input.off('.' + instanceId);
        $(window).off('.' + instanceId);
        $(document).off('.' + instanceId);
        $popup.off('.' + instanceId);
        $popup.remove();
        $input.removeData('simpleTimePicker');
      }
    };

    $input.data('simpleTimePicker', api);

    if (state.committed) {
      updateInputFromCommitted();
    }
    render();
  }

  // =========================
  //  jQuery plugin
  // =========================
  $.fn.simpleTimePicker = function (options) {
    injectStyles();
    return this.each(function () {
      createInstance($(this), options);
    });
  };

})(jQuery);
