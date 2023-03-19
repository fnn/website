---
title: How to use Radix Colors with Tailwind CSS
description: Learn how to use Radix Colors with Tailwind to create accessible and consistent color schemes for your projects.
created: "2023-03-19T00:00:00Z"
---

### tl;dr

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: generateScale("gray"),
      },
    },
  },
};

function generateScale(name) {
  let scale = Array.from({ length: 12 }, (_, i) => {
    let id = i + 1;
    return [
      [id, `var(--${name}${id})`],
      [`a${id}`, `var(--${name}A${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}
```

```css
/* style.css */
@import "@radix-ui/colors/gray.css";
@import "@radix-ui/colors/grayA.css";
@import "@radix-ui/colors/grayDark.css";
@import "@radix-ui/colors/grayDarkA.css";
```

```html
<div class="text-gray-a11">...</div>
```

---

Tailwind is a popular utility-first CSS framework that makes it easy to style web applications with minimal CSS code. However, one limitation of Tailwind for me personally is its support for dark mode and their color palette. Fortunately, we can use Radix Colors, a collection of color palettes, with Tailwind to extend its color options.

In this post, we will explore how to use Radix Colors with Tailwind without any third-party dependencies.

### Installing Tailwind

Before we can start using Tailwind, we need to install it. There are several ways to install Tailwind, but the easiest way is to use npm. Open your terminal and type the following command:

```bash
npm install tailwindcss
```

This will install Tailwind in your project's node_modules directory. Next, we need to create a configuration file for Tailwind.

### Creating a Tailwind Configuration File

Tailwind allows us to customize its configuration by creating a configuration file. To create the configuration file, run the following command in your terminal:

```bash
npx tailwindcss init
```

This will create a file called `tailwind.config.js` in your project's root directory. Open this file in your code editor.

### Using Radix Colors with Tailwind

Radix Colors is a collection of color palettes that are designed to work together. To use Radix Colors with Tailwind, we need to import the color palettes into our project and then use them in our Tailwind configuration.

To import the color palettes, we need to install the `@radix-ui/colors `package. Open your terminal and type the following command:

```bash
npm install @radix-ui/colors
```

This will install the Radix Colors package in your project's node_modules directory. Next, we need to import the color palettes in our CSS file.

In your `style.css` file, import the color palettes that you want to use:

```css
/* style.css */
@import "@radix-ui/colors/gray.css";
@import "@radix-ui/colors/grayA.css";
@import "@radix-ui/colors/grayDark.css";
@import "@radix-ui/colors/grayDarkA.css";
```

This will import the gray color palette and its associated alpha values, as well as the dark mode version of the gray color palette and its associated alpha values.

Next, we need to use the color palettes in our Tailwind configuration. Open your `tailwind.config.js` file and add the following code:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: generateScale("gray"),
      },
    },
  },
};

function generateScale(name) {
  let scale = Array.from({ length: 12 }, (_, i) => {
    let id = i + 1;
    return [
      [id, `var(--${name}${id})`],
      [`a${id}`, `var(--${name}A${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}
```

This code defines a function called `generateScale` that takes a color name as an argument and returns an object with the color palette's colors and alpha values. The function uses the `Array.from` method to create an array of 12 colors and alpha values, and then flattens the array using the `flat` method. Finally, the function uses the `Object.fromEntries` method to convert the array into an object.

Now that we have set up our Tailwind configuration to use Radix Colors, we can use the `text-gray-a11` class in our HTML templates to apply the desired color.

```html
<div class="text-gray-a11">This text is gray.</div>
```

One of the advantages of using Radix Colors with Tailwind is that we no longer need to use the `dark:` prefix to specify dark mode colors. With Radix Colors, the dark mode color palettes are designed to work seamlessly with their light mode counterparts, making it easier to create accessible color schemes that work well in both light and dark mode. This means we can simply use the `bg-gray-1` class to set the background color of our app, and it will automatically switch to the appropriate color in dark mode, without the need for any extra configuration.

In conclusion, using Radix Colors with Tailwind is a powerful way to create beautiful and accessible designs for our projects. With the ability to generate color scales and support for both light and dark modes, Radix Colors makes it easier to create consistent and accessible color schemes that work well in any context. By combining Radix Colors with Tailwind's utility classes, we can create flexible and easy-to-maintain styles that are tailored to our specific needs.
