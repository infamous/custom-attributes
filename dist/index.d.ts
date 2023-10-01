import { CustomAttributeRegistry } from './CustomAttributeRegistry.js';
export * from './CustomAttributeRegistry.js';
export declare let customAttributes: CustomAttributeRegistry;
declare global {
    var customAttributes: CustomAttributeRegistry;
    interface ShadowRoot {
        customAttributes: CustomAttributeRegistry;
    }
    interface Window {
        customAttributes: CustomAttributeRegistry;
    }
}
export declare const version = "0.1.7";
//# sourceMappingURL=index.d.ts.map