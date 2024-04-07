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
	constructor(
		container: string,
		target: string,
		options?: {
			once: boolean
			backgroundColor: boolean
			backgroundSize: "cover" | "contain"
			theme: {
				light: string
				dark: string
			}
		},
	)

	resize(): void
	launch(): Promise<void>
}
