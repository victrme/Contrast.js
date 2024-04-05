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
		this.image
		this.target
		this.targetBox
		this.container
	}

	prepare() {
		this.target = document.querySelector(this.targetSelector)
		this.targetBox = document.querySelector(this.targetSelector).getBoundingClientRect()
		this.container = document.querySelector(this.containerSelector)

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
			throw 'Check your element styles. Is the background-image property correctly ?'
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
	 */
	getAverageRgb() {
		if (!this.context) {
			console.log('Context undefined')
			return
		}

		const { top, left, width, height } = this.targetBox
		let sx, sy, sw, sh
		let imageData

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

		try {
			imageData = this.context.getImageData(0, 0, width, height)
		} catch (e) {
			// security error, img on diff domain
			console.log('Make sure the image is hosted on the same domain')
			return
		}

		const datalength = imageData.data.length
		const step = 4 * this.blockSize
		let count = 0
		let index = 0

		for (; index < datalength; index += step) {
			this.rgb.r += imageData.data[index]
			this.rgb.g += imageData.data[index + 1]
			this.rgb.b += imageData.data[index + 2]
			count++
		}

		// ~~ used to floor values
		this.rgb.r = ~~(this.rgb.r / count)
		this.rgb.g = ~~(this.rgb.g / count)
		this.rgb.b = ~~(this.rgb.b / count)
	}

	/**
	 * This function will find the good contrast color
	 * based on the provided RGB values
	 * https://github.com/onury/invert-color
	 */
	invertColor() {
		let hex = this.hex.replace('#', '')

		// convert 3-digit hex to 6-digits.
		if (hex.length === 3) {
			const [r, g, b] = hex
			hex = r + r + g + g + b + b
		}

		if (hex.length !== 6) {
			throw new Error('Invalid HEX color.')
		}

		let r = parseInt(hex.slice(0, 2), 16),
			g = parseInt(hex.slice(2, 4), 16),
			b = parseInt(hex.slice(4, 6), 16)

		if (this.theme) {
			// https://stackoverflow.com/a/3943023/112731
			const threshold = r * 0.299 + g * 0.587 + b * 0.114 > 186
			const light = this.theme.light ?? '#FFFFFF'
			const dark = this.theme.dark ?? '#000000'

			this.invertedHex = threshold ? dark : light
			return
		}

		// invert color components & pad with zeros
		r = this.padZero((255 - r).toString(16))
		g = this.padZero((255 - g).toString(16))
		b = this.padZero((255 - b).toString(16))

		this.invertedHex = `#${r}${g}${b}`
	}

	rgbToHex() {
		const { r, g, b } = this.rgb
		const decimal = (1 << 24) + (r << 16) + (g << 8) + b
		const hex = decimal.toString(16).slice(1)

		this.hex = '#' + hex
	}

	setElementColor() {
		if (this.backgroundColor) {
			this.target.style.backgroundColor = this.invertedHex
		} else {
			this.target.style.color = this.invertedHex
		}
	}

	resize() {
		window.addEventListener('resize', () => {
			this.prepare()
			this.getAverageRgb()
			this.rgbToHex()
			this.invertColor()
			this.setElementColor()
		})
	}

	async launch() {
		this.prepare()
		await this.loadImage()
		this.getAverageRgb()
		this.rgbToHex()
		this.invertColor()
		this.setElementColor()

		if (!this.once) {
			this.resize()
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
