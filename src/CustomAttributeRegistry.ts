import type {Constructor} from 'lowclass/dist/Constructor.js'

const forEach = Array.prototype.forEach

export class CustomAttributeRegistry {
	#attrMap = new Map<string, Constructor>()
	#elementMap = new WeakMap<Element, Map<string, CustomAttribute>>()

	#observer: MutationObserver = new MutationObserver(mutations => {
		forEach.call(mutations, (m: MutationRecord) => {
			if (m.type === 'attributes') {
				const attr = this.#getConstructor(m.attributeName!)
				if (attr) this.#handleChange(m.attributeName!, m.target as Element, m.oldValue)
			}

			// chlidList
			else {
				forEach.call(m.removedNodes, this.#elementDisconnected)
				forEach.call(m.addedNodes, this.#elementConnected)
			}
		})
	})

	constructor(public ownerDocument: Document | ShadowRoot) {
		if (!ownerDocument) throw new Error('Must be given a document')
	}

	define(attrName: string, Class: Constructor) {
		this.#attrMap.set(attrName, Class)
		this.#upgradeAttr(attrName)
		this.#reobserve()
	}

	get(element: Element, attrName: string) {
		const map = this.#elementMap.get(element)
		if (!map) return
		return map.get(attrName)
	}

	#getConstructor(attrName: string) {
		return this.#attrMap.get(attrName)
	}

	#observe() {
		this.#observer.observe(this.ownerDocument, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: Array.from(this.#attrMap.keys()),
			// attributeFilter: [...this._attrMap.keys()], // Broken in Oculus
			// attributeFilter: this._attrMap.keys(), // This works in Chrome, but TS complains, and not clear if it should work in all browsers yet: https://github.com/whatwg/dom/issues/1092
		})
	}

	#unobserve() {
		this.#observer.disconnect()
	}

	#reobserve() {
		this.#unobserve()
		this.#observe()
	}

	#upgradeAttr(attrName: string, node: Element | Document | ShadowRoot = this.ownerDocument) {
		const matches = node.querySelectorAll('[' + attrName + ']')

		// Possibly create custom attributes that may be in the given 'node' tree.
		// Use a forEach as Edge doesn't support for...of on a NodeList
		forEach.call(matches, (element: Element) => this.#handleChange(attrName, element, null))
	}

	#elementConnected = (element: Element) => {
		if (element.nodeType !== 1) return

		// For each of the connected element's attribute, possibly instantiate the custom attributes.
		// Use a forEach as Safari 10 doesn't support for...of on NamedNodeMap (attributes)
		forEach.call(element.attributes, (attr: Attr) => {
			if (this.#getConstructor(attr.name)) this.#handleChange(attr.name, element, null)
		})

		// Possibly instantiate custom attributes that may be in the subtree of the connected element.
		this.#attrMap.forEach((_constructor, attr) => this.#upgradeAttr(attr, element))
	}

	#elementDisconnected = (element: Element) => {
		const map = this.#elementMap.get(element)
		if (!map) return

		map.forEach(inst => inst.disconnectedCallback?.(), this)

		this.#elementMap.delete(element)
	}

	#handleChange(attrName: string, el: Element, oldVal: string | null) {
		let map = this.#elementMap.get(el)
		if (!map) this.#elementMap.set(el, (map = new Map()))

		let inst = map.get(attrName)
		const newVal = el.getAttribute(attrName)

		// Attribute is being created
		if (!inst) {
			const Constructor = this.#getConstructor(attrName)!
			inst = new Constructor() as CustomAttribute
			map.set(attrName, inst)
			inst.ownerElement = el
			inst.name = attrName
			if (newVal == null) throw new Error('Not possible!')
			inst.value = newVal
			inst.connectedCallback?.()
			return
		}

		// Attribute was removed
		if (newVal == null) {
			inst.disconnectedCallback?.()
			map.delete(attrName)
		}

		// Attribute changed
		else if (newVal !== inst.value) {
			inst.value = newVal
			if (oldVal == null) throw new Error('Not possible!')
			inst.changedCallback?.(oldVal, newVal)
		}
	}
}

// TODO Replace with a class that extends from `Attr` for alignment with the web platform?
export interface CustomAttribute {
	ownerElement: Element
	name: string
	value: string
	connectedCallback?(): void
	disconnectedCallback?(): void
	changedCallback?(oldValue: string, newValue: string): void
}

// Avoid errors trying to use DOM APIs in non-DOM environments (f.e. server-side rendering).
if (globalThis.window?.document) {
	const original = Element.prototype.attachShadow

	Element.prototype.attachShadow = function attachShadow(options) {
		const root = original.call(this, options)

		if (!root.customAttributes) root.customAttributes = new CustomAttributeRegistry(root)

		return root
	}
}
