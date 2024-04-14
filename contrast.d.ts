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
     * @param {Object} [options]
     * @param {boolean} [options.once] - The module runs only once; on window resize by default
     * @param {boolean} [options.backgroundColor] - Apply contrast to background color; font color by default
     * @param {"cover" | "contain"} [options.backgroundSize] - Based on the background-size property in css
     * @param {Object} [options.theme] - If you want to prebuild light & dark colors
     * @param {string} [options.theme.light] - Light color HEX
     * @param {string} [options.theme.dark] - Dark color HEX
     */
    constructor(container: string, target: string, options?: {
        once?: boolean;
        backgroundColor?: boolean;
        backgroundSize?: "cover" | "contain";
        theme?: {
            light?: string;
            dark?: string;
        };
    });
    containerSelector: string;
    targetSelector: string;
    theme: {
        light?: string;
        dark?: string;
    };
    once: boolean;
    backgroundSize: "contain" | "cover";
    backgroundColor: boolean;
    /**
     * This creates a canvas and load the background image.
     * If "once" is specified, no resize eventListeners are added to window
     */
    init(): Promise<void>;
    targetNodes: NodeListOf<Element>;
    container: Element;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    /**
     * You can manually update the contrast of the text defined during initialization.
     *
     * @example
     * const contrast = new Contrast('#background', 'h1').init()
     * const button = document.querySelector('#some-button')
     *
     * button.addEventListener('click', () => {
     *     contrast.update()
     * })
     */
    update(): void;
    containerBox: DOMRect;
    /**
     * Loads image dynamically from the CSS background-image value
     * @private
     */
    private loadImage;
    image: HTMLImageElement;
    /**
     * Determines the average color of the section of the
     * background image right under the supplied element
     * using the target element's bounding box
     * @param {DOMRect} targetBox
     * @returns {{r: number, g: number, b: number}}
     * @private
     */
    private getAverageRgb;
    /**
     * This function will find the good contrast color
     * based on the provided RGB values
     * https://github.com/onury/invert-color
     * @param {{r: number, g: number, b: number}} rgb
     * @returns {string}
     * @private
     */
    private invertColor;
    /**
     * @param {{r: number, g: number, b: number}} rgb
     * @returns {string}
     * @private
     */
    private rgbToHex;
    /**
     * @param {Element} target
     * @param {string} hex
     * @returns {void}
     * @private
     */
    private setElementColor;
    /**
     * @private
     */
    private padZero;
    /**
     * @private
     */
    private getBackgroundCoverScale;
}
