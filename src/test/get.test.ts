import '../index.js'

describe('get()', function () {
	async function later() {
		await new Promise(r => setTimeout(r, 4))
	}

	it('gets the attribute instance', async function () {
		class Foobar {}
		customAttributes.define('foo-bar', Foobar)

		const el = document.createElement('span')
		el.setAttribute('foo-bar', 'baz')
		document.body.append(el)

		await later()

		const fooBar = customAttributes.get(el, 'foo-bar')
		expect(fooBar).toBeInstanceOf(Foobar)
	})

	it('allows passing more complex data types', async function () {
		const {resolve, promise: bazSetPromise} = Promise.withResolvers<void>()

		class Foobar {
			set baz(val: any) {
				expect(val).toBe('hello world')
				resolve()
			}
		}

		customAttributes.define('foo-bar', Foobar)

		const el = document.createElement('span')
		el.setAttribute('foo-bar', 'bam')
		document.body.append(el)

		await later()

		const fooBar = customAttributes.get(el, 'foo-bar')

		queueMicrotask(
			() =>
				// @ts-expect-error TODO make a CustomAttributes map for registering global attribute types.
				(fooBar!.baz = 'hello world'),
		)

		await bazSetPromise
	})
})
