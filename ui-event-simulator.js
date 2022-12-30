const UIEventSimulator = {
  EVENTS: {
    mouse: ['click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'],
    key: ['keydown', 'keyup', 'keypress'],
    touch: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
    pointer: ['click', 'contextmenu', 'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture'],
    wheel: ['wheel'],
    drag: ['drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop'],
    focus: ['focus', 'blur', 'focusin', 'focusout'],
  },

  DOM_DELTA: {
    PIXEL: 0x00,
    LINE: 0x01,
    PAGE: 0x02,
  },

  _makeEvent(type, options = {}) {

    // deep copy
    const events = JSON.parse(JSON.stringify(this.EVENTS));

    if (navigator?.userAgent?.toLowerCase().includes('chrome')) {
      // Dec 2022 - Click & contextmenu event in Chromium is a PointerEvent, so we need to remove it from the mouse event list
      events.mouse.splice(events.mouse.indexOf('click'), 1);
      events.mouse.splice(events.mouse.indexOf('contextmenu'), 1);
    } else {
      // Dec 2022 - Click & contextmenu event in Chromium is a PointerEvent, so we need to remove it from the pointer event list
      events.pointer.splice(events.pointer.indexOf('click'), 1);
      events.pointer.splice(events.pointer.indexOf('contextmenu'), 1);
    }

    options = this._overwriteOptionsWithBrowserDefaults(events, type, options);

    const EventOptions = {
      bubbles: options.bubbles ?? false,
      cancelable: options.cancelable ?? false,
      composed: options.composed ?? false
    };
    const UIEventOptions = {
      view: options.view ?? window ?? null,
      detail: options.detail ?? 0,
      ...EventOptions
    };
    const EventModifierOptions = {
      ctrlKey: options.ctrlKey ?? false,
      shiftKey: options.shiftKey ?? false,
      altKey: options.altKey ?? false,
      metaKey: options.metaKey ?? false,
    };
    const MouseEventOptions = {
      screenX: options.screenX ?? 0,
      screenY: options.screenY ?? 0,
      clientX: options.clientX ?? 0,
      clientY: options.clientY ?? 0,
      button: options.button ?? 0,
      buttons: options.buttons ?? 0,
      relatedTarget: options.relatedTarget ?? null,
      ...EventModifierOptions,
      ...UIEventOptions
    };

    let evt;
    // Keyboard events
    if (events.key.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent
      evt = new KeyboardEvent(type, {
        key: options.key ?? '',
        code: options.code ?? '',
        location: options.location ?? 0,
        repeat: options.repeat ?? false,
        isComposing: options.isComposing ?? false,
        ...EventModifierOptions,
        ...UIEventOptions,
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? true,
        composed: options.composed ?? true
      });

      // Mouse events
    } else if (events.mouse.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
      evt = new MouseEvent(type, {
        ...MouseEventOptions,
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? true,
        composed: options.composed ?? true
      });

      // Pointer Events
    } else if (events.pointer.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
      evt = new PointerEvent(type, {
        pointerId: options.pointerId ?? 0,
        width: options.width ?? 1,
        height: options.height ?? 1,
        pressure: options.pressure ?? 0,
        tangentialPressure: options.tangentialPressure ?? 0,
        tiltX: options.tiltX ?? 0,
        tiltY: options.tiltY ?? 0,
        twist: options.twist ?? 0,
        pointerType: options.pointerType ?? '',
        isPrimary: options.isPrimary ?? false,
        ...MouseEventOptions,
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? true,
        composed: options.composed ?? true
      });

      // Touch Events
    } else if (events.touch.indexOf(type) > -1) {

      if (typeof window.TouchEvent !== 'undefined') {
        // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
        evt = new TouchEvent(type, {
          changedTouches: this._convertToTouch(options.changedTouches) ?? [],
          targetTouches: this._convertToTouch(options.targetTouches) ?? [],
          touches: this._convertToTouch(options.touches) ?? [],
          ...EventModifierOptions,
          ...UIEventOptions
        });
      } else {
        // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/UIEvent
        evt = new UIEvent(type, {
          changedTouches: options.changedTouches ?? [],
          targetTouches: options.targetTouches ?? [],
          touches: options.touches ?? [],
          ...EventModifierOptions,
          ...UIEventOptions
        });
      }

      // Wheel Events
    } else if (events.wheel.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/WheelEvent
      evt = new WheelEvent(type, {
        deltaX: options.deltaX ?? 0.0,
        deltaY: options.deltaY ?? 0.0,
        deltaZ: options.deltaZ ?? 0.0,
        deltaMode: options.deltaMode ?? this.DOM_DELTA.PIXEL,
        ...MouseEventOptions
      });

      // Drag Events
    } else if (events.drag.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/DragEvent
      evt = new DragEvent(type, {
        dragEventInit: options.dragEventInit ?? null,
        ...MouseEventOptions
      });


      // Focus Events
    } else if (events.focus.indexOf(type) > -1) {
      // https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/FocusEvent

      const FocusEventOptions = {
        relatedTarget: options.relatedTarget ?? null,
        ...UIEventOptions,
      };

      evt = new FocusEvent(type, FocusEventOptions);

    } else {
      throw new Error(`Event type '${type}' not available! `);
    }

    return evt;
  },

  _dispatchEvent(element, evt) {
    element.dispatchEvent(evt);
  },

  _convertToTouch(array) {
    if (!array) {
      return [];
    }

    const TouchList = [];
    for (const obj of array) {

      if (!obj.target) {
        throw new Error(`A 'target' for the Touch-Object ${JSON.stringify(obj)} is required!`);
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Touch/Touch
      const touch = new Touch({
        identifier: obj.identifier || Math.round(Math.random() * 1000),
        target: obj.target,
        screenX: obj.screenX || 0,
        screenY: obj.screenY || 0,
        clientX: obj.clientX || 0,
        clientY: obj.clientY || 0,
        pageX: obj.pageX || 0,
        pageY: obj.pageY || 0,
        radiusX: obj.radiusX || 0,
        radiusY: obj.radiusY || 0,
        rotationAngle: obj.rotationAngle || 0,
        force: obj.force || 0,
      });

      TouchList.push(touch);
    }
    return TouchList;
  },

  _overwriteOptionsWithBrowserDefaults(events, type, options) {
    // simulate browser defaults
    if (events.key.indexOf(type) > -1) {
      options.bubbles = options.bubbles ?? true;
      options.cancelable = options.cancelable ?? true;
      options.composed = options.composed ?? true;

    } else if (events.focus.indexOf(type) > -1) {
      if (type === 'focusin' || type === 'focusout') {
        options.bubbles = options.bubbles ?? true;
      }
      options.composed = options.composed ?? true;

    } else if (events.mouse.indexOf(type) > -1) {
      if (type === 'click' || type === 'contextmenu' || type === 'dblclick' || type === 'mousedown' || type === 'mouseup' || type === 'mousemove' || type === 'mouseout' || type === 'mouseover') {
        options.bubbles = options.bubbles ?? true;
        options.cancelable = options.cancelable ?? true;
        options.composed = options.composed ?? true;
      }
      if (type === 'contextmenu') {
        options.detail = options.detail ?? 1;
      }
      if (type === 'dblclick') {
        options.detail = options.detail ?? 2;
      }

    } else if (events.pointer.indexOf(type) > -1) {
      // TODO: pointercancel needs to be checked
      if (type === 'click' || type === 'contextmenu' || type === 'pointerdown' || type === 'pointerup' || type === 'pointermove' || type === 'pointerout' || type === 'pointerover') {
        options.bubbles = options.bubbles ?? true;
        options.cancelable = options.cancelable ?? true;
        options.composed = options.composed ?? true;
      }

    } else if (events.touch.indexOf(type) > -1) {
      // TODO: touchcancel needs to be checked
      options.bubbles = options.bubbles ?? true;
      options.composed = options.composed ?? true;
      if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
        options.cancelable = options.cancelable ?? true;
      }

    } else if (events.wheel.indexOf(type) > -1) {
      options.bubbles = options.bubbles ?? true;
      options.cancelable = options.cancelable ?? true;
      options.composed = options.composed ?? true;

    } else if (events.drag.indexOf(type) > -1) {
      // TODO: drop needs to be checked
      options.bubbles = options.bubbles ?? true;
      options.composed = options.composed ?? true;
      if (type === 'drag' || type === 'dragenter' || type === 'dragover' || type === 'dragstart') {
        options.cancelable = options.cancelable ?? true;
      }
    }

    return options;
  },

  fire(type, element, options) {
    this._dispatchEvent(element, this._makeEvent(type, options));
  },

  fireAt(type, x, y, options) {
    this.fire(type, document.elementFromPoint(x, y), {
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      which: 1,
      button: 0,
      ...options
    });
  }
};

if (typeof window !== 'undefined') window.UIEventSimulator = UIEventSimulator;
if (typeof module !== 'undefined') module.exports = UIEventSimulator;
