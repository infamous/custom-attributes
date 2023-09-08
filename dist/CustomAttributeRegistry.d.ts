import type { Constructor } from 'lowclass';
export declare class CustomAttributeRegistry {
    ownerDocument: Document | ShadowRoot;
    private _attrMap;
    private _elementMap;
    private _observer;
    constructor(ownerDocument: Document | ShadowRoot);
    define(attrName: string, Class: Constructor): void;
    get(element: Element, attrName: string): CustomAttribute | undefined;
    private _getConstructor;
    private _observe;
    private _unobserve;
    private _reobserve;
    private _upgradeAttr;
    private _elementConnected;
    private _elementDisconnected;
    private _handleChange;
}
export interface CustomAttribute {
    ownerElement: Element;
    name: string;
    value: string;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
    changedCallback?(oldValue: string, newValue: string): void;
}
//# sourceMappingURL=CustomAttributeRegistry.d.ts.map