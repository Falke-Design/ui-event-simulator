**ui-event-simulator** wraps the `UIEvents` into a easy to use functions.

## Installation

```
npm install ui-event-simulator
```

## Usage

```js
import UIEventSimulator from 'ui-event-simulator'
```

| API                                 | Description                                                             |
|-------------------------------------|-------------------------------------------------------------------------|
| fire(`type`, `element`, `options`)  | Fire a event with a specific `type` on a element.                       |
| fireAt(`type`, `x`, `y`, `options`) | Fire a event with a specific `type` on a element at a certain position. |

The available `options` can be taken from the official Event documentation [Used Events](#used-events).

```js
UIEventSimulator.fire('click', document.body);
```


| Constants     | Description                                                                                       |
|---------------|---------------------------------------------------------------------------------------------------|
| EVENTS        | All available event types.                                                                        |
| DOM_DELTA     | [WheelEvent](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/WheelEvent) - deltaMode. |

```js
console.log(UIEventSimulator.EVENTS);
```

## Events

 - [UIEvent](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/UIEvent)
	 - [FocusEvent](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/FocusEvent)
	 - [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent)
	 - [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent)
		 - [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/DragEvent)
		 - [PointerEvent](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent)
		 - [WheelEvent](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/WheelEvent)
	 - [TouchEvent](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)

## Special handling

 - On Chromium Browsers the `click` and `contextmenu` event is fired as a `PointerEvent`, all other Browsers are using `MouseEvent`
 - Some Browsers don't support `TouchEvent` for that Browsers a `UIEvent` is fired.

## Credit

Based on the great tool [happen](https://github.com/tmcw/happen)
