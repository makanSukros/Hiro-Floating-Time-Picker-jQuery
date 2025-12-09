# Fancy Floating Time Picker (jQuery)

A lightweight time picker with a floating popover UI that matches your datepicker:

- **12-hour mode** → 3 columns: **Hour – Minute – AM/PM**
- **24-hour mode** → 2 columns: **Hour – Minute** (no AM/PM)
- Border & shadow styled consistently with your datepicker:
  - `border: 1px solid rgba(226, 232, 240, 0.95);`
  - `box-shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.20), 0 0 0 1px rgba(148, 163, 184, 0.15);`
- Smooth scroll for hours & minutes in 24h mode
- Optional auto-apply
- Auto-reposition on scroll/resize to stay attached to the input


## Installation

1. **jQuery** (minimum 1.8+, recommended 3.x):

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

2. **Plugin JS**:

    <script src="js/simple-time-picker.js"></script>

No extra CSS file is required — styles are automatically injected by `injectStyles()`.


## Usage

### 12-hour mode (3 columns: Hour / Minute / AM-PM)

    <input type="text" id="time-12h" placeholder="Select time (12h)" />
    <script>
      $('#time-12h').simpleTimePicker({
        mode: '12h',
        selectedTime: '05:17 PM',   // also accepts '17:17' or a Date object
        minuteStep: 5,
        autoApply: false,
        closeOnScroll: false,
        onChange: function (timeObj, formatted) {
          // timeObj: {hours, minutes, totalMinutes}
          // formatted: "hh:mm AM/PM"
          console.log('Time (12h) changed:', timeObj, formatted);
        }
      });
    </script>

### 24-hour mode (2 columns: Hour / Minute, with scroll)

    <input type="text" id="time-24h" placeholder="Select time (24h)" />
    <script>
      $('#time-24h').simpleTimePicker({
        mode: '24h',
        selectedTime: '17:15',      // also accepts '05:15 PM' or a Date object
        minuteStep: 5,              // 1..30
        autoApply: false,
        closeOnScroll: true,
        onChange: function (timeObj, formatted) {
          // formatted: "HH:mm" (24h)
          console.log('Time (24h) changed:', timeObj, formatted);
        }
      });
    </script>


## Options

### `mode`

- Type: `"12h"` or `"24h"`
- Default: `"12h"`
- Controls the layout:
  - `12h` → 3 columns (Hour / Minute / AM-PM)
  - `24h` → 2 columns (Hour / Minute), AM-PM hidden


### `selectedTime`

Accepted formats:

- JavaScript `Date`
- `"HH:mm"` (24h), e.g. `"17:30"`
- `"hh:mm AM/PM"`, e.g. `"05:30 PM"`

Examples:

    selectedTime: new Date(),     // current time
    selectedTime: '09:00',        // 09:00 (morning)
    selectedTime: '09:00 PM'      // 21:00


### `minuteStep`

- Type: `number`
- Range: 1..30
- Default: `5`
- Controls the minute interval list (0, 5, 10, 15, etc.)


### `autoApply`

- Type: `boolean`
- Default: `false`

If `true`:

- Clicking any hour/minute/AM-PM instantly:
  - updates `state.committed`
  - updates the input value
  - closes the popup

If `false`:

- The selection remains in `pending`; the user must click **Apply** to commit.


### `closeOnScroll`

- Type: `boolean`
- Default: `false`

If `true`:

- If the popup is open and the window scrolls → popup closes immediately.

If `false`:

- Scroll only triggers repositioning to keep popup aligned with the input.


### `onChange(timeObj, formattedStr)`

Called whenever the time is committed (Apply or autoApply).

- `timeObj`:

      {
        hours: 0..23,
        minutes: 0..59,
        totalMinutes: hours * 60 + minutes
      }

- `formattedStr`:
  - `24h`: `"HH:mm"` (e.g. `"17:05"`)
  - `12h`: `"hh:mm AM/PM"` (e.g. `"05:05 PM"`)

Example:

    onChange: function (timeObj, formatted) {
      console.log('Committed time:', formatted, timeObj);
    }


## Public API

After initialization:

    var api = $('#time-24h').data('simpleTimePicker');

### `getTime()`

    var t = api.getTime();
    // example: { hours: 17, minutes: 15, totalMinutes: 1035 }


### `setTime(value)`

- Accepts:
  - `Date`
  - `"HH:mm"`
  - `"hh:mm AM/PM"`

    api.setTime('08:30');
    api.setTime('08:30 PM');
    api.setTime(new Date());

Minutes will be rounded down to the nearest `minuteStep`.


### `open()`

Manually open the popup.

    api.open();


### `close()`

Manually close the popup.

    api.close();


### `destroy()`

Remove events & delete popup from the DOM.

    api.destroy();


## UX & Layout

- The target input is set to `readonly`:
  - Users select via the popup, not by typing directly.
- Popup:
  - Appears below the input if space allows.
  - Moves above if bottom space is limited.
  - Auto-adjusts horizontally to stay inside the viewport.
- Scroll:
  - Only enabled on hour & minute columns in 24h mode (`max-height: 240px`).
  - `stp-item` remains a full circle (`border-radius:9999px`), so it never looks cut off.
