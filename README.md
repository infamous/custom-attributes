[![Build status](https://github.com/lume/custom-attributes/actions/workflows/tests.yml/badge.svg)](https://github.com/lume/custom-attributes/actions/workflows/tests.yml)
[![npm version](https://badge.fury.io/js/custom-attributes.svg)](http://badge.fury.io/js/custom-attributes)

# custom-attributes

Define custom attributes in the same way you can define custom elements, which allows for rich mixin types of behaviors on elements.

## Spec duscussions

The idea of "custom attributes" (and similar ideas) are being discussed as possibilities for web specs.

Existing conversations (please notify if this needs an update):

- Element Behaviors, and the has="" attribute. A useful alternative to Custom Elements in many cases! WICG/webcomponents#727
- Alternative to customized builtins (custom elements with is=) w3c/tpac2023-breakouts#44
- Proposal: Custom attributes for all elements, enhancements for more complex use cases WICG/webcomponents#1029
- Customized built-in elements WebKit/standards-positions#97
- Make custom attribute rules consistent with custom element name rules whatwg/html#2271

## Install

```shell
npm install @lume/custom-attributes --save
```

Add as a script tag:

```html
<script src="node_modules/@lume/custom-attributes/dist/index.js" type="module"></script>
```

Or import as an ES module:

```js
import {customAttributes} from '@lume/custom-attributes'
```

Or you can just import the CustomAttributeRegistry and create your own instance:

```js
import {CustomAttributeRegistry} from '@lume/custom-attributes'

const customAttributes = new CustomAttributeRegistry(document)
```

## Example

```html
<article bg-color="green">
	<p>This will be shown in a green background!</p>
</article>
```

```js
class BgColor {
	connectedCallback() {
		this.setColor()
	}

	disconnectedCallback() {
		// cleanup here!
	}

	// Called whenever the attribute's value changes
	changedCallback() {
		this.setColor()
	}

	setColor() {
		this.ownerElement.style.backgroundColor = this.value
	}
}

customAttributes.default.define('bg-color', BgColor)
```

## API

custom-attributes follows a very similar API as v1 custom elements, but rather than a class instance representing the host element, the class instance is meant to represent the _attribute_.

### Lifecycle callbacks

#### connectedCallback

This is called when the attribute is first connected to the `document`. If the host element is already in the DOM, and the attribute is set, connectedCallback will be called as all registered attributes are upgraded.

If the host element is already in the DOM and the attribute is programmatically added via `setAttribute`, then connectedCallback will be called asynchronously after.

If the host element is being programmatically created and the attribute is set before the element is inserted into the DOM, connectedCallback will only call when the host element is inserted.

#### disconnectedCallback

Called when the attribute is no longer part of the host element, or the host document. This callback should be used if any cleanup is needed.

If the attribute is removed via `removeAttribute`, then disconnectedCallback will be called asynchronously after this change. If the host element is removed from the DOM, disconnectedCallback will be called asynchronously after as well.

#### changedCallback

Called any time the attribute's `value` changes, after connected. Useful if you need to perform work based on the attribute value such as the example given in this readme.

### Properties

#### ownerElement

`this.ownerElement` refers to the element which the attribute is attached.

#### name

The attribute's name. Since multiple class definitions can be used for multiple attribute names, `this.name` is useful if you need to know what the attribute is being referred to as.

#### value

The current value of the attribute (the string value) is available as `this.value`.

## License

BSD 2 Clause
