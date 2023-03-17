---
title: How to create a delay function in JavaScript
description: Learn how to create a JavaScript delay function using a promise and setTimeout for cleaner and easier asynchronous code.
created: "2023-03-17T00:00:00Z"
---

### tl;dr

```js
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Simulate async delay
  await delay(1000);
}
```

---

In JavaScript, the `setTimeout()` function is commonly used to delay the execution of a piece of code for a certain amount of time. However, it can be challenging to work with when trying to incorporate it into more complex code. A solution to this problem is to use a promise in conjunction with `setTimeout()` to create a custom delay function.

A promise is an object that represents the eventual completion (or failure) of an asynchronous operation and allows us to write asynchronous code in a synchronous manner. The delay function we will create using a promise and `setTimeout()` will take a specified number of milliseconds as its argument and will resolve the promise after that amount of time has passed.

Here's an example of how to create a delay function using a promise and `setTimeout()`:

```js
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

In this code snippet, we define a function called `delay` that takes a single argument `ms` (the number of milliseconds to delay). We then create a new promise and pass `setTimeout(resolve, ms)` as the function to be executed after the delay. This means that the promise will resolve after the specified number of milliseconds has passed.

We can use this `delay` function to delay the execution of any code that returns a promise. Here's an example of how to use the `delay` function with the `fetch()` function to simulate a network delay:

```js
fetch("https://jsonplaceholder.typicode.com/todos/1")
  .then((response) => delay(3000).then(() => response.json()))
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

In this example, we first call the `fetch()` function to retrieve some data from an API. We then use the `delay` function to wait for 3 seconds before parsing the response as JSON and logging the data to the console. If an error occurs at any point in the process, we catch and log it to the console.

In conclusion, using a promise in conjunction with `setTimeout()` can make it much easier to work with delayed code in JavaScript. The `delay` function we created is a simple and reusable solution for any code that needs to be delayed for a specified amount of time.
