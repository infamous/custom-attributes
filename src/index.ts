// TODO We don't know when a ShadowRoot is no longer referenced, hence we cannot
// unobserve them. Verify that MOs are cleaned up once ShadowRoots are no longer
// referenced.

import {CustomAttributeRegistry} from './CustomAttributeRegistry.js'

export * from './CustomAttributeRegistry.js'

export let customAttributes: CustomAttributeRegistry

// Avoid errors trying to use DOM APIs in non-DOM environments (f.e. server-side rendering).
if (globalThis.window?.document) customAttributes = globalThis.customAttributes = new CustomAttributeRegistry(document)

declare global {
	// const doesn't always work (TS bug). At time of writing this, it doesn't work in this TS playground example:
	// https://www.typescriptlang.org/play?#code/KYDwDg9gTgLgBAbzgXwFCoCbAMYBsCGUwcA5rhAEb66KpxzYQB2AzvAGYQQBccTArgFsKwKKjSoylagBUAFgEsWAOk4Q4Aeg1wAolCjQANHAXwYipgGsWcAAZrbJm0wjws7BU2AYgA
	// And discussions:
	// https://discord.com/channels/508357248330760243/508357248330760249/1019034094060978228
	// https://discord.com/channels/508357248330760243/1019017621397585961
	var customAttributes: CustomAttributeRegistry

	interface ShadowRoot {
		customAttributes: CustomAttributeRegistry
	}

	interface Window {
		customAttributes: CustomAttributeRegistry
	}
}

export const version = '0.2.0'
