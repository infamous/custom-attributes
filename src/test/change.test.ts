import '../index.js'

describe('changedCallback()', function () {
	async function later() {
		await new Promise(r => setTimeout(r, 4))
	}

	it('Is called when an attribute changes value', async function () {
		const {resolve, promise: changedPromise} = Promise.withResolvers<void>()

		class SomeAttr {
			changedCallback() {
				resolve()
			}
		}

		customAttributes.define('some-attr', SomeAttr)

		const el = document.createElement('article')
		el.setAttribute('some-attr', 'foo')
		document.body.append(el)

		queueMicrotask(() => el.setAttribute('some-attr', 'bar'))

		await changedPromise

		el.remove()
	})

	it("Is not called when an attribute's value remains the same", async function () {
		let count = 0

		class AnotherAttr {
			changedCallback() {
				count++
			}
		}

		customAttributes.define('another-attr', AnotherAttr)

		const el = document.createElement('span')
		el.setAttribute('another-attr', 'foo')
		document.body.append(el)

		el.setAttribute('another-attr', 'foo')

		await later()

		expect(count).toBe(0)
	})
})
