---
title: How to chain terminal commands in Bash
description: Learn how to chain terminal commands in bash with semicolon, double ampersand, and pipe operators for greater efficiency.
created: "2023-03-16T00:00:00Z"
---

### tl;dr

```bash
A; B    # Run A and then B, regardless of success of A
A && B  # Run A and, if successful, run B
A || B  # Run A and, if it fails, run B
A | B   # Pass output of A as input for B
```

---

Bash is a command-line shell used in Unix-based operating systems such as Linux and macOS. It is a powerful tool for executing commands, and one of its key features is the ability to chain multiple commands together. Chaining commands allows you to perform complex operations with ease, without having to manually execute each command separately. In this post, I will explain how to chain terminal commands in bash.

The most common way to chain commands in bash is by using the semicolon (;) operator. The semicolon allows you to separate multiple commands and execute them sequentially. For example, if you want to create a new directory and then change into it, you can use the following command:

```bash
mkdir foobar; cd foobar
```

This will create a new directory called "foobar" and then change into it.

Another way to chain commands is by using the double ampersand (&&) operator. The double ampersand executes the second command only if the first command is successful. For example, if you want to update your package list and then upgrade your packages, you can use the following command:

```bash
sudo apt-get update && sudo apt-get upgrade
```

This will update your package list and only if the update is successful, it will then upgrade your packages.

The pipe symbol (|) is another way to chain commands in bash. The pipe operator allows you to pass the output of one command as input to another command. For example, if you want to list all the files in a directory and then search for a specific file, you can use the following command:

```
ls | grep myfile
```

This will list all the files in the current directory and then search for the file named "myfile".

In addition to the semicolon, double ampersand, and pipe operators, there is also the double pipe (||) operator. The double pipe executes the second command only if the first command fails. This is useful for error handling, where you want to execute a backup command if the primary command fails. For example, if you want to install a package using a package manager and then fallback to an alternative package manager if the installation fails, you can use the following command:

```bash
apt-get install package-name || yum install package-name
```

This will attempt to install the package using apt-get and if it fails, it will then try to install the package using yum. The double pipe operator is a powerful tool for handling errors and ensuring that your commands execute correctly.

In conclusion, chaining terminal commands in bash is a powerful way to automate tasks and perform complex operations with ease. By using the semicolon, double ampersand, and pipe operators, you can create chains of commands that execute sequentially, conditionally, or by passing output to input. With practice, you can become proficient in chaining commands and significantly increase your productivity as a developer or system administrator.
