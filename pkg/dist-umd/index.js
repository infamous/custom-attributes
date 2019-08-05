(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.customAttributes = {}));
}(this, function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var forEach = Array.prototype.forEach;

  var CustomAttributeRegistry =
  /*#__PURE__*/
  function () {
    function CustomAttributeRegistry(ownerDocument) {
      _classCallCheck(this, CustomAttributeRegistry);

      if (!ownerDocument) {
        throw new Error("Must be given a document");
      }

      this.ownerDocument = ownerDocument;
      this._attrMap = new Map();
      this._elementMap = new WeakMap();

      this._observe();
    }

    _createClass(CustomAttributeRegistry, [{
      key: "define",
      value: function define(attrName, Constructor) {
        this._attrMap.set(attrName, Constructor);

        this._upgradeAttr(attrName);
      }
    }, {
      key: "get",
      value: function get(element, attrName) {
        var map = this._elementMap.get(element);

        if (!map) return;
        return map.get(attrName);
      }
    }, {
      key: "_getConstructor",
      value: function _getConstructor(attrName) {
        return this._attrMap.get(attrName);
      }
    }, {
      key: "_observe",
      value: function _observe() {
        var customAttributes = this;
        var root = this.ownerDocument;

        var downgrade = this._downgrade.bind(this);

        var upgrade = this._upgradeElement.bind(this);

        this.observer = new MutationObserver(function (mutations) {
          forEach.call(mutations, function (m) {
            if (m.type === 'attributes') {
              var attr = customAttributes._getConstructor(m.attributeName);

              if (attr) {
                customAttributes._found(m.attributeName, m.target, m.oldValue);
              }
            } // chlidList
            else {
                forEach.call(m.removedNodes, downgrade);
                forEach.call(m.addedNodes, upgrade);
              }
          });
        });
        this.observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true
        });
      }
    }, {
      key: "_upgradeAttr",
      value: function _upgradeAttr(attrName, document) {
        document = document || this.ownerDocument;
        var matches = document.querySelectorAll("[" + attrName + "]"); // Use a forEach as Edge doesn't support for...of on a NodeList

        forEach.call(matches, function (match) {
          this._found(attrName, match);
        }, this);
      }
    }, {
      key: "_upgradeElement",
      value: function _upgradeElement(element) {
        if (element.nodeType !== 1) return; // Use a forEach as Safari 10 doesn't support for...of on NamedNodeMap (attributes)

        forEach.call(element.attributes, function (attr) {
          if (this._getConstructor(attr.name)) {
            this._found(attr.name, element);
          }
        }, this);

        this._attrMap.forEach(function (constructor, attr) {
          this._upgradeAttr(attr, element);
        }, this);
      }
    }, {
      key: "_downgrade",
      value: function _downgrade(element) {
        var map = this._elementMap.get(element);

        if (!map) return;
        map.forEach(function (inst) {
          if (inst.disconnectedCallback) {
            inst.disconnectedCallback();
          }
        }, this);

        this._elementMap.delete(element);
      }
    }, {
      key: "_found",
      value: function _found(attrName, el, oldVal) {
        var map = this._elementMap.get(el);

        if (!map) {
          map = new Map();

          this._elementMap.set(el, map);
        }

        var inst = map.get(attrName);
        var newVal = el.getAttribute(attrName);

        if (!inst) {
          var Constructor = this._getConstructor(attrName);

          inst = new Constructor();
          map.set(attrName, inst);
          inst.ownerElement = el;
          inst.name = attrName;
          inst.value = newVal;

          if (inst.connectedCallback) {
            inst.connectedCallback();
          }
        } // Attribute was removed
        else if (newVal == null) {
            if (inst.disconnectedCallback) {
              inst.disconnectedCallback();
            }

            map.delete(attrName);
          } // Attribute changed
          else if (newVal !== inst.value) {
              inst.value = newVal;

              if (inst.changedCallback) {
                inst.changedCallback(oldVal, newVal);
              }
            }
      }
    }]);

    return CustomAttributeRegistry;
  }();

  var customAttributes = new CustomAttributeRegistry(document);

  exports.CustomAttributeRegistry = CustomAttributeRegistry;
  exports.default = customAttributes;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
