// It is inspired by https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
// and the following npm package https://github.com/onury/invert-color
// As well as CS50's image filter project and
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

/**
 * This is an example of how it's possible to dynamically change the font color
 * based on the page or element background, including responsive images.
 *
 * (You can also set bw value to true like invertColor(hex, true) and in this case
 * the font color will switch between black/white or any color pair you set based on
 * the background behind the target element)
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

		this.rgb = { r: 0, g: 0, b: 0 }
		this.blockSize = 5 // only check every 5 pixels
		this.defaultRGB = { r: 0, g: 0, b: 0 } // for non-supporting envs
		this.hex
		this.invertedHex
		this.canvas
		this.context
		this.imgEl
		this.imgSrc
		this.contentEl
		this.contentElBox
	}

	prepare() {
		this.contentEl = document.querySelector(this.targetSelector)
		this.contentElBox = document.querySelector(this.targetSelector).getBoundingClientRect()
		this.bgBlock = document.querySelector(this.containerSelector)
		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d', { willReadFrequently: !this.once, alpha: false })
		return this
	}

	// Function that loads Image dynamically from the CSS background-image value
	// RETURNS A PROMISE
	loadImage() {
		// Let's create an image to draw from
		let style = getComputedStyle(this.bgBlock)

		// Find css background-image property and check whether it has url wrapped
		// in "" or '' or without quotes, then extract it
		if (style.backgroundImage.indexOf('url') != -1) {
			let startOfString, endOfString
			if (style.backgroundImage.indexOf("'") > -1 || style.backgroundImage.indexOf('"') > -1) {
				startOfString = 5
				endOfString = style.backgroundImage.indexOf(')') - 1
			} else {
				startOfString = 4
				endOfString = style.backgroundImage.indexOf(')')
			}
			this.imgSrc = style.backgroundImage.slice(startOfString, endOfString)
		} else {
			console.log("Check your element styles. Looks like you haven't set the background-image property correctly.")
		}

		// Make sure the image is loaded before calling the next function
		return new Promise((resolve, reject) => {
			this.imgEl = new Image()
			this.imgEl.crossOrigin = 'anonymous'
			this.imgEl.onload = () => resolve(this.imgEl)
			this.imgEl.onerror = reject
			this.imgEl.src = this.imgSrc
		})
	}

	// This function is used to assist with background-size:cover
	getCoverScaleFactor() {
		// Get the ratio of the div + the image
		let imageRatio = this.imgEl.width / this.imgEl.height
		let coverRatio = this.bgBlock.offsetWidth / this.bgBlock.offsetHeight
		let coverHeight, coverWidth, scale

		// Figure out which ratio is greater
		if (imageRatio >= coverRatio) {
			coverHeight = this.bgBlock.offsetHeight
			scale = coverHeight / this.imgEl.height
			coverWidth = this.imgEl.width * scale
		} else {
			coverWidth = this.bgBlock.offsetWidth
			scale = coverWidth / this.imgEl.width
			coverHeight = this.imgEl.height * scale
		}

		return scale
	}

	// Function that returns the average color of the section of the
	// background image right under the supplied element
	// using the target element's bounding box
	getAverageHEX() {
		if (!this.context) {
			console.log('CONTEXT UNDEFINED')
			return defaultRGB
		}

		let revScale

		if (this.backgroundSize == 'cover') {
			// Call the function to get the current scale factor of the cover property
			revScale = this.getCoverScaleFactor()

			// Let's draw the area of the image behind the text (contentEL)
			this.context.drawImage(
				this.imgEl,
				this.contentElBox.left / revScale,
				this.contentElBox.top / revScale,
				this.contentElBox.width / revScale,
				this.contentElBox.height / revScale,
				0,
				0,
				this.contentElBox.width,
				this.contentElBox.height
			)
		} else {
			// Let's find the reverse scale factor of the image
			// so we can multiply our bounding box coordinates by it
			revScale = this.imgEl.naturalWidth / this.bgBlock.clientWidth

			// Let's draw the area of the image behind the text (contentEL)
			this.context.drawImage(
				this.imgEl,
				this.contentElBox.left * revScale,
				this.contentElBox.top * revScale,
				this.contentElBox.width * revScale,
				this.contentElBox.height * revScale,
				0,
				0,
				this.contentElBox.width,
				this.contentElBox.height
			)
		}

		try {
			this.data = this.context.getImageData(0, 0, this.contentElBox.width, this.contentElBox.height)
		} catch (e) {
			// security error, img on diff domain
			console.log('Make sure the image is hosted on the same domain')
			return this
		}

		this.length = this.data.data.length

		let i = -4
		let count = 0
		while ((i += this.blockSize * 4) < this.length) {
			++count
			this.rgb.r += this.data.data[i]
			this.rgb.g += this.data.data[i + 1]
			this.rgb.b += this.data.data[i + 2]
		}

		// ~~ used to floor values
		this.rgb.r = ~~(this.rgb.r / count)
		this.rgb.g = ~~(this.rgb.g / count)
		this.rgb.b = ~~(this.rgb.b / count)

		return this
	}

	// This function will find the good contrast color
	// based on the provided RGB values
	// https://github.com/onury/invert-color
	invertColor() {
		if (this.hex.indexOf('#') === 0) {
			this.hex = this.hex.slice(1)
		}

		// convert 3-digit hex to 6-digits.
		if (this.hex.length === 3) {
			this.hex = this.hex[0] + this.hex[0] + this.hex[1] + this.hex[1] + this.hex[2] + this.hex[2]
		}

		if (this.hex.length !== 6) {
			throw new Error('Invalid HEX color.')
		}

		let r = parseInt(this.hex.slice(0, 2), 16),
			g = parseInt(this.hex.slice(2, 4), 16),
			b = parseInt(this.hex.slice(4, 6), 16)

		if (this.theme) {
			const threshold = r * 0.299 + g * 0.587 + b * 0.114 > 186 // https://stackoverflow.com/a/3943023/112731
			const light = this.theme.light ?? '#FFFFFF'
			const dark = this.theme.dark ?? '#000000'

			this.invertedHex = threshold ? dark : light

			return this
		}

		// invert color components
		r = (255 - r).toString(16)
		g = (255 - g).toString(16)
		b = (255 - b).toString(16)

		// pad each with zeros and return
		this.invertedHex = '#' + this.padZero(r) + this.padZero(g) + this.padZero(b)

		return this
	}

	padZero(str, len) {
		len = len || 2
		let zeros = new Array(len).join('0')
		return (zeros + str).slice(-len)
	}

	// Function to convert RGB to HEX
	rgbToHex() {
		this.hex = '#' + ((1 << 24) + (this.rgb.r << 16) + (this.rgb.g << 8) + this.rgb.b).toString(16).slice(1)
		return this
	}

	// Change the color
	setElementColor() {
		if (this.backgroundColor) {
			this.contentEl.style.backgroundColor = this.invertedHex
		} else {
			this.contentEl.style.color = this.invertedHex
		}
	}

	async apply() {
		this.prepare()
		await this.loadImage()
		this.getAverageHEX().rgbToHex().invertColor().setElementColor()
	}

	resize() {
		window.addEventListener('resize', () => this.apply())
	}

	launch() {
		if (!this.once) this.resize()
		this.apply()
	}
}
