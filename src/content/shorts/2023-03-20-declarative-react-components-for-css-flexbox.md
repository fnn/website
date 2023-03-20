---
title: Declarative React components for CSS Flexbox
description: Create a simple React component with an easy API to use with CSS Flexbox.
created: "2023-03-20T00:00:00Z"
---

### tl;dr

```js
import { forwardRef } from "react";

const Flex = forwardRef(
  (
    { direction = "row", main = "flex-start", cross = "stretch", ...rest },
    ref
  ) => {
    // Replace inline styles with your styling solution.
    const styles = {
      display: "flex",
      flexDirection: direction,
      justifyContent: main,
      alignItems: cross,
    };

    return <div style={styles} ref={ref} {...rest} />;
  }
);

const Row = forwardRef(({ main, cross, ...rest }, ref) => {
  return <Flex main={main} cross={cross} ref={ref} {...rest} />;
});

const Column = forwardRef(({ main, cross, ...rest }, ref) => {
  return (
    <Flex direction="column" main={main} cross={cross} ref={ref} {...rest} />
  );
});
```

---

In modern web development, responsive design is a must-have feature for any website or application. CSS Flexbox is a powerful layout tool that allows developers to create flexible and responsive layouts with ease. However, working with Flexbox in CSS can sometimes be complicated and difficult to manage, especially when working on large-scale projects with many different components.

React, a popular JavaScript library for building user interfaces, provides an elegant solution for managing complex component-based applications. Declarative programming, one of the core principles of React, allows developers to create reusable components that are easy to read and maintain. By combining the power of Flexbox with the declarative programming model of React, we can create flexible, responsive, and reusable components that make building complex layouts a breeze.

Declarative components are good for several reasons. Firstly, they allow developers to write more concise and readable code. With declarative components, developers can describe the layout and behavior of a component using simple and intuitive syntax, without having to worry about the underlying implementation details. This makes it easier to understand and maintain complex codebases over time.

Secondly, declarative components promote code reuse. By encapsulating common layout patterns in reusable components, developers can avoid duplicating code and reduce the amount of time and effort required to build new features. This makes it easier to scale and maintain large projects, as developers can build new features by composing existing components, rather than starting from scratch.

To create the Flex component, we start by importing `forwardRef` from React. We use `forwardRef` to ensure that the component can forward any refs passed to it down to its children.

Next, we define the `Flex` component function, which takes in `direction`, `main`, `cross`, and `rest` as props. `direction` controls the `flex-direction` property, `main` controls `justify-content`, and cross controls `align-items`. `rest` is a rest parameter that captures any additional props passed to the component.

Finally, we return a `div` element with the `styles` object applied as inline styles. We also forward any refs passed to the component using the `ref` prop and spread any additional props using the `rest` parameter. Here's the code for the Flex component:

```js
import { forwardRef } from "react";

const Flex = forwardRef(
  (
    { direction = "row", main = "flex-start", cross = "stretch", ...rest },
    ref
  ) => {
    const styles = {
      display: "flex",
      flexDirection: direction,
      justifyContent: main,
      alignItems: cross,
    };

    return <div style={styles} ref={ref} {...rest} />;
  }
);
```

Now that we have created the `Flex` component, we can build Row and Column components that utilize the Flex component to create declarative layouts.

The Row component is essentially a `Flex` component with a default value of `flex-direction: row`, making it a horizontal row of elements. It also accepts `main` and `cross` props to control the `justify-content` and `align-items` properties of the Flexbox layout.

Here's the code for the Row component:

```js
import { forwardRef } from "react";
import Flex from "./Flex";

const Row = forwardRef(({ main, cross, ...rest }, ref) => {
  return <Flex direction="row" main={main} cross={cross} ref={ref} {...rest} />;
});
```

Similarly, the Column component is a `Flex` component with a default value of `flex-direction: column`, making it a vertical column of elements. It also accepts `main` and `cross` props to control the `justify-content` and `align-items` properties of the Flexbox layout.

Here's the code for the Column component:

```js
import { forwardRef } from "react";
import Flex from "./Flex";

const Column = forwardRef(({ main, cross, ...rest }, ref) => {
  return (
    <Flex direction="column" main={main} cross={cross} ref={ref} {...rest} />
  );
});
```

These components are highly configurable and can be customized to fit a wide range of use cases. For example, to create a row-based layout with items aligned to the end of the main axis, we can use the `Row` component with the `main` prop set to `flex-end`.

```jsx
<Row main="flex-end">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Row>
```

Similarly, to create a column-based layout with items centered along both axes, we can use the `Column` component with the `main` and `cross` props set to `center`.

```jsx
<Column main="center" cross="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Column>
```

One of the benefits of using declarative components is that they can be easily styled using traditional CSS, CSS-in-JS, or any other styling solution. The inline styles used in the example components are only provided as an example and should be replaced with a better styling solution for production use.

Overall, the `Flex`, `Row`, and `Column` components presented above are powerful tools for creating flexible and responsive layouts in React.
