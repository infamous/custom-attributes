import { CustomAttributeRegistry } from './CustomAttributeRegistry.js';
export * from './CustomAttributeRegistry.js';
export let customAttributes;
if (globalThis.window?.document)
    customAttributes = globalThis.customAttributes = new CustomAttributeRegistry(document);
export const version = '0.2.1';
//# sourceMappingURL=index.js.map