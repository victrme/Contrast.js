/**
 * This is an example of how it's possible to dynamically change the font color
 * based on the page or element background, including responsive images.
 *
 * (You can also set bw value to true like invertColor(hex, true) and in this case
 * the font color will switch between black/white or any color pair you set based on
 * the background behind the target element)
 *
 * It is inspired by https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
 * and the following npm package https://github.com/onury/invert-color
 * As well as CS50's image filter project and
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 *
 * @author devmishka
 * @license MIT
 */
export default class Contrast {
	/**
	 * @param {string} container - A CSS selector for the element containing the image
	 * @param {string} target - A CSS selector for the target element
	 * @param {Object} options
	 * @param {boolean} options.once - The module runs only once; on window resize by default
	 * @param {boolean} options.backgroundColor - Apply contrast to background color; font color by default
	 * @param {"cover" | "contain"} options.backgroundSize - Based on the background-size property in css
	 * @param {Object} options.theme - If you want to prebuild light & dark colors
	 * @param {string} options.theme.light - Light color HEX
	 * @param {string} options.theme.dark - Dark color HEX
	 */
	constructor(container, target, options = {}) {
		this.containerSelector = container
		this.targetSelector = target
		this.theme = options.theme
		this.once = options.once ?? false
		this.backgroundSize = options.backgroundSize ?? 'cover'
		this.backgroundColor = options.backgroundColor ?? false

		this.blockSize = 5 // only check every 5 pixels
		this.canvas
		this.context
		this.image
		this.container
		this.containerBox
		this.targetNodes
	}

	prepare() {
		this.targetNodes = document.querySelectorAll(this.targetSelector)
		this.container = document.querySelector(this.containerSelector)
		this.containerBox = this.container.getBoundingClientRect()

		if (!this.canvas || !this.context) {
			this.canvas = document.createElement('canvas')
			this.context = this.canvas.getContext('2d', {
				willReadFrequently: !this.once,
				alpha: false,
			})
		}
	}

	/**
	 * Loads image dynamically from the CSS background-image value
	 */
	async loadImage() {
		const { backgroundImage } = getComputedStyle(this.container)
		const hasQuotes = !!backgroundImage.match(/'|"/)
		let src = ''

		if (!backgroundImage.includes('url')) {
			throw 'Check your element styles. Is the background-image property set correctly ?'
		}

		if (hasQuotes) {
			src = backgroundImage.slice(5, backgroundImage.indexOf(')') - 1)
		} else {
			src = backgroundImage.slice(4, backgroundImage.indexOf(')'))
		}

		await new Promise((resolve, reject) => {
			this.image = new Image()
			this.image.crossOrigin = 'anonymous'
			this.image.onload = resolve
			this.image.onerror = reject
			this.image.src = src
		})
	}

	/**
	 * Determines the average color of the section of the
	 * background image right under the supplied element
	 * using the target element's bounding box
	 * @param {DOMRect} targetBox
	 * @returns {{r: number, g: number, b: number}}
	 */
	getAverageRgb(targetBox) {
		if (!this.context) {
			throw 'Context undefined'
		}

		let { top, left, width, height } = targetBox
		let sx, sy, sw, sh
		let imageData

		top = top - this.containerBox.top
		left = left - this.containerBox.left

		if (this.backgroundSize === 'cover') {
			const scale = this.getBackgroundCoverScale()
			sx = left / scale
			sy = top / scale
			sw = width / scale
			sh = height / scale
		}

		if (this.backgroundSize === 'contain') {
			// Let's find the reverse scale factor of the image
			// so we can multiply our bounding box coordinates by it
			const scale = this.image.naturalWidth / this.container.clientWidth
			sx = left * scale
			sy = top * scale
			sw = width * scale
			sh = height * scale
		}

		// Let's draw the area of the image behind the text
		this.context.drawImage(this.image, sx, sy, sw, sh, 0, 0, width, height)
		imageData = this.context.getImageData(0, 0, width, height)

		const datalength = imageData.data.length
		const step = 4 * this.blockSize
		let [r, g, b] = [0, 0, 0]
		let count = 0
		let index = 0

		for (; index < datalength; index += step) {
			r += imageData.data[index]
			g += imageData.data[index + 1]
			b += imageData.data[index + 2]
			count++
		}

		// ~~ used to floor values
		r = ~~(r / count)
		g = ~~(g / count)
		b = ~~(b / count)

		return { r, g, b }
	}

	/**
	 * This function will find the good contrast color
	 * based on the provided RGB values
	 * https://github.com/onury/invert-color
	 * @param {{r: number, g: number, b: number}} rgb
	 * @returns {string}
	 */
	invertColor(rgb) {
		const hex = this.rgbToHex(rgb)

		// convert 3-digit hex to 6-digits.
		if (hex.length === 3) {
			const [r, g, b] = hex
			hex = r + r + g + g + b + b
		}

		if (hex.length !== 6) {
			throw 'Invalid HEX color.'
		}

		let r = parseInt(hex.slice(0, 2), 16),
			g = parseInt(hex.slice(2, 4), 16),
			b = parseInt(hex.slice(4, 6), 16)

		if (this.theme) {
			// https://stackoverflow.com/a/3943023/112731
			const threshold = r * 0.299 + g * 0.587 + b * 0.114 > 186
			const light = this.theme.light ?? '#FFFFFF'
			const dark = this.theme.dark ?? '#000000'

			return threshold ? dark : light
		}

		// invert color components & pad with zeros
		r = this.padZero((255 - r).toString(16))
		g = this.padZero((255 - g).toString(16))
		b = this.padZero((255 - b).toString(16))

		return `#${r}${g}${b}`
	}

	/**
	 * @param {{r: number, g: number, b: number}} rgb
	 * @returns {string}
	 */
	rgbToHex(rgb) {
		const { r, g, b } = rgb
		const decimal = (1 << 24) + (r << 16) + (g << 8) + b
		const hex = decimal.toString(16).slice(1)
		return hex
	}

	/**
	 * @param {Element} target
	 * @param {string} hex
	 * @returns {void}
	 */
	setElementColor(target, hex) {
		if (this.backgroundColor) {
			target.style.backgroundColor = hex
		} else {
			target.style.color = hex
		}
	}

	apply() {
		for (const target of this.targetNodes) {
			const rect = target.getBoundingClientRect()
			const rgb = this.getAverageRgb(rect)
			const hex = this.invertColor(rgb)
			this.setElementColor(target, hex)
		}
	}

	async launch() {
		this.prepare()
		await this.loadImage()
		this.apply()

		if (!this.once) {
			window.addEventListener('resize', () => {
				this.prepare()
				this.apply()
			})
		}
	}

	//
	//
	//

	padZero(str, len) {
		len = len || 2
		let zeros = new Array(len).join('0')
		return (zeros + str).slice(-len)
	}

	getBackgroundCoverScale() {
		// Get the ratio of the div + the image
		let imageRatio = this.image.width / this.image.height
		let coverRatio = this.container.offsetWidth / this.container.offsetHeight
		let coverHeight, coverWidth, scale

		// Figure out which ratio is greater
		if (imageRatio >= coverRatio) {
			coverHeight = this.container.offsetHeight
			scale = coverHeight / this.image.height
			coverWidth = this.image.width * scale
		} else {
			coverWidth = this.container.offsetWidth
			scale = coverWidth / this.image.width
			coverHeight = this.image.height * scale
		}

		return scale
	}
}
