import '../index.js'

describe('disconnectedCallback()', function () {
	async function later() {
		await new Promise(r => setTimeout(r, 4))
	}

	it('Is called when removeAttribute() is used', async function () {
		const {resolve, promise: disconnectedPromise} = Promise.withResolvers<void>()

		let count = 0

		class MyAttr {
			async connectedCallback() {
				await later().then(() => el.removeAttribute('my-attr'))
			}

			changedCallback() {
				count++
			}

			disconnectedCallback() {
				resolve()
			}
		}

		customAttributes.define('my-attr', MyAttr)

		const el = document.createElement('span')
		document.body.append(el)

		queueMicrotask(() => el.setAttribute('my-attr', 'test'))

		await disconnectedPromise

		expect(count).toBe(0)
	})

	it('Is called when the element is removed', async function () {
		const {resolve, promise: disconnectedPromise} = Promise.withResolvers<void>()

		class SomeAttr {
			async connectedCallback() {
				await later()

				el.remove()
			}

			disconnectedCallback() {
				resolve()
			}
		}

		customAttributes.define('some-attr', SomeAttr)

		const el = document.createElement('span')
		document.body.append(el)

		queueMicrotask(() => el.setAttribute('some-attr', 'test'))

		await disconnectedPromise
	})
})
