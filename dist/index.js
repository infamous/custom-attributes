var _a;
import { CustomAttributeRegistry } from './CustomAttributeRegistry.js';
export * from './CustomAttributeRegistry.js';
export let customAttributes;
if ((_a = globalThis.window) === null || _a === void 0 ? void 0 : _a.document)
    customAttributes = globalThis.customAttributes = new CustomAttributeRegistry(document);
export const version = '0.1.7';
//# sourceMappingURL=index.js.map