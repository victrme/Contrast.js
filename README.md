# ![Contrast.js logo](https://raw.githubusercontent.com/victrme/Contrast.js/master/assets/logo.png)

This is a ESM port of Contrast.js which is a tiny library with no dependencies that adds responsiveness to the color or background attributes of DOM elements based on the section of background image behind the target element.
The library analyzes the background behind the bounding box of the target element by getting the average RGB values of pixels in the sub-rectangle behind the element and finding the best contrasting color.

In simple words, never worry about your color matching the background image again! No more countless media queries.

![GIF demo](img/demo-2.gif)

## Buy mishka a coffee

Whether you use this project, have learned something from it, or just like it, please consider supporting it by buying mishka a coffee, so that he can dedicate more time on open-source projects like this :)

<a href="https://www.buymeacoffee.com/mishka" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-1.svg" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

## Features

-   Vanilla JS - no jQuery or any other dependencies
-   Very simple setup/activation
-   Support for responsive font color
-   Support for responsive div background color
-   Support for background-size: cover;
-   Support for background-size: 100%;
-   Option to add custom colors to switch between (Light/Dark)
-   Option to change activation class names
-   Option to turn on/off activation on window resize event

## Install

Contrast.js can be installed with [`npm`](https://www.npmjs.com/package/contrast-js)

```sh
$ npm install contrast-js
```

…and include the file in your script

```js
import Contrast from 'contrast-js'
```

## Run

Add an element that has the background image and a target element, like this:

```html
<div class="contrast-bg">
  <h1 class="contrast-el">Resize and watch my color change</h1>
</div>
```

To run Contrast.js, create new instance of Contrast class, add the background and target selectors, and invoke launch() method on it.

```javascript
import Contrast from 'contrast-js'

new Contrast('.contrast-bg', '.contrast-el').launch()
```

Contrast also accepts options:

```javascript
import Contrast from 'contrast-js'

const contrast = new Contrast(
  ".background",   // The CSS selector for the element containing the image
  ".target",       // The CSS selector for the target element
  {
    once: true,               // The module runs only once; on window resize by default
    backgroundSize: "cover",  // "cover" or "contain" based on the background-size property in css
    backgroundColor: false,   // Apply contrast to background color; font color by default
    theme: {                  // If you want to prebuild light & dark colors
      light: "#bddfe0",       // Light color HEX
      dark: "#334054"         // Dark color HEX
    },
  }
);

contrast.launch();
```

## What's not there yet

-   Currently the library supports changing color for only ONE element.
-   background-position isn't supported yet

## Proud to mention

Created at <a style="color:#52337c;" href="https://fictiontribe.com">Fiction Tribe ®</a> in Portland, OR

## License

> You can check out the full license [here](https://github.com/victrme/Contrast.js/LICENSE.md)

This project is licensed under the terms of the **MIT** license.
