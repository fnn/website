---
title: How to use FormData in client-side React forms
description: Learn how to use FormData in a client-side React form, and how to get it from an onSubmit callback..
created: "2023-03-18T00:00:00Z"
---

### tl;dr

```js
<form
  onSubmit={(event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData.get("input_name"));
  }}
>
  ...
</form>
```

---

Handling form data is a critical aspect of many React applications. Fortunately, React provides an easy way to handle form data by using the built-in FormData object. In this blog post, we will explore how to get FormData from a form onSubmit callback in a React application.

To get started, we first need to create a form component in our React application. For example, let's say we have a simple login form with two fields, username and password:

```js
function LoginForm() {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData.get("username"));
    console.log(formData.get("password"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" name="username" />

      <label htmlFor="password">Password:</label>
      <input type="password" id="password" name="password" />

      <button type="submit">Submit</button>
    </form>
  );
}
```

In the handleSubmit function, we first prevent the default form submission behavior by calling `event.preventDefault()`. Then, we create a new FormData object by passing in the `event.target` object, which represents the form element that was submitted. We can then access the values of the form fields using the `get` method of the FormData object.

In this example, we simply log the username and password to the console. In a real-world application, we would typically use this data to send an HTTP request to a server.

In conclusion, getting FormData from a form onSubmit callback in a React application is simple and straightforward. By using the built-in FormData object, we can easily access the values of form fields and send them to a server for processing. This approach is flexible and can be used with any type of form, whether it includes text fields, checkboxes, or file uploads.
