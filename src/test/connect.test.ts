import '../index.js'

declare global {
	function expect(...args: any[]): any
}

class BgColorAttr {
	declare value: any
	declare ownerElement: any

	connectedCallback() {
		this.setColor()
	}

	changedCallback(_oldValue: any, _newValue: any) {
		this.setColor()
	}

	setColor() {
		const color = this.value || ''
		this.ownerElement.style.backgroundColor = color
	}
}

document.body.insertAdjacentHTML(
	'beforeend',
	/*html*/ `
	<article bg-color="red">
		<p>This article is static</p>
	</article>
`,
)

customAttributes.define('bg-color', BgColorAttr)

describe('connectedCallback()', function () {
	it('Is called when element is already in the DOM', function () {
		const article = document.querySelector('article')!
		expect(article!.style.backgroundColor).toBe('red')
		article.remove()
	})

	it('Is called when an attribute is dynamically created', async function () {
		const article = document.createElement('article')
		article.textContent = 'hello world'
		document.body.append(article)

		article.setAttribute('bg-color', 'blue')

		await new Promise(r => setTimeout(r, 4))

		expect(article.style.backgroundColor).toBe('blue')
		article.remove()
	})

	it('Is called on nested elements when root element is added to the DOM', async function () {
		const article = document.createElement('article')
		const header = document.createElement('header')

		header.setAttribute('bg-color', 'blue')
		article.append(header)

		document.body.append(article)

		await new Promise(r => setTimeout(r, 4))

		expect(header.style.backgroundColor).toBe('blue')
		article.remove()
	})
})
