import type { Constructor } from 'lowclass/dist/Constructor.js';
export declare class CustomAttributeRegistry {
    #private;
    ownerDocument: Document | ShadowRoot;
    constructor(ownerDocument: Document | ShadowRoot);
    define(attrName: string, Class: Constructor): void;
    get(element: Element, attrName: string): CustomAttribute | undefined;
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