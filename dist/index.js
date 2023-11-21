// TODO We don't know when a ShadowRoot is no longer referenced, hence we cannot
// unobserve them. Verify that MOs are cleaned up once ShadowRoots are no longer
// referenced.
import { CustomAttributeRegistry } from './CustomAttributeRegistry.js';
export * from './CustomAttributeRegistry.js';
export let customAttributes;
// Avoid errors trying to use DOM APIs in non-DOM environments (f.e. server-side rendering).
if (globalThis.window?.document)
    customAttributes = globalThis.customAttributes = new CustomAttributeRegistry(document);
export const version = '0.2.3';
//# sourceMappingURL=index.js.map