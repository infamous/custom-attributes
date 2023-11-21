const forEach = Array.prototype.forEach;
export class CustomAttributeRegistry {
    ownerDocument;
    _attrMap = new Map();
    _elementMap = new WeakMap();
    _observer = new MutationObserver(mutations => {
        forEach.call(mutations, (m) => {
            if (m.type === 'attributes') {
                const attr = this._getConstructor(m.attributeName);
                if (attr)
                    this._handleChange(m.attributeName, m.target, m.oldValue);
            }
            // chlidList
            else {
                forEach.call(m.removedNodes, this._elementDisconnected);
                forEach.call(m.addedNodes, this._elementConnected);
            }
        });
    });
    constructor(ownerDocument) {
        this.ownerDocument = ownerDocument;
        if (!ownerDocument)
            throw new Error('Must be given a document');
    }
    define(attrName, Class) {
        this._attrMap.set(attrName, Class);
        this._upgradeAttr(attrName);
        this._reobserve();
    }
    get(element, attrName) {
        const map = this._elementMap.get(element);
        if (!map)
            return;
        return map.get(attrName);
    }
    _getConstructor(attrName) {
        return this._attrMap.get(attrName);
    }
    _observe() {
        this._observer.observe(this.ownerDocument, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: Array.from(this._attrMap.keys()),
            // attributeFilter: [...this._attrMap.keys()], // Broken in Oculus
            // attributeFilter: this._attrMap.keys(), // This works in Chrome, but TS complains, and not clear if it should work in all browsers yet: https://github.com/whatwg/dom/issues/1092
        });
    }
    _unobserve() {
        this._observer.disconnect();
    }
    _reobserve() {
        this._unobserve();
        this._observe();
    }
    _upgradeAttr(attrName, node = this.ownerDocument) {
        const matches = node.querySelectorAll('[' + attrName + ']');
        // Possibly create custom attributes that may be in the given 'node' tree.
        // Use a forEach as Edge doesn't support for...of on a NodeList
        forEach.call(matches, (element) => this._handleChange(attrName, element, null));
    }
    _elementConnected = (element) => {
        if (element.nodeType !== 1)
            return;
        // For each of the connected element's attribute, possibly instantiate the custom attributes.
        // Use a forEach as Safari 10 doesn't support for...of on NamedNodeMap (attributes)
        forEach.call(element.attributes, (attr) => {
            if (this._getConstructor(attr.name))
                this._handleChange(attr.name, element, null);
        });
        // Possibly instantiate custom attributes that may be in the subtree of the connected element.
        this._attrMap.forEach((_constructor, attr) => this._upgradeAttr(attr, element));
    };
    _elementDisconnected = (element) => {
        const map = this._elementMap.get(element);
        if (!map)
            return;
        map.forEach(inst => inst.disconnectedCallback?.(), this);
        this._elementMap.delete(element);
    };
    _handleChange(attrName, el, oldVal) {
        let map = this._elementMap.get(el);
        if (!map)
            this._elementMap.set(el, (map = new Map()));
        let inst = map.get(attrName);
        const newVal = el.getAttribute(attrName);
        // Attribute is being created
        if (!inst) {
            const Constructor = this._getConstructor(attrName);
            inst = new Constructor();
            map.set(attrName, inst);
            inst.ownerElement = el;
            inst.name = attrName;
            if (newVal == null)
                throw new Error('Not possible!');
            inst.value = newVal;
            inst.connectedCallback?.();
            return;
        }
        // Attribute was removed
        if (newVal == null) {
            inst.disconnectedCallback?.();
            map.delete(attrName);
        }
        // Attribute changed
        else if (newVal !== inst.value) {
            inst.value = newVal;
            if (oldVal == null)
                throw new Error('Not possible!');
            inst.changedCallback?.(oldVal, newVal);
        }
    }
}
// Avoid errors trying to use DOM APIs in non-DOM environments (f.e. server-side rendering).
if (globalThis.window?.document) {
    const _attachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function attachShadow(options) {
        const root = _attachShadow.call(this, options);
        if (!root.customAttributes)
            root.customAttributes = new CustomAttributeRegistry(root);
        return root;
    };
}
//# sourceMappingURL=CustomAttributeRegistry.js.map