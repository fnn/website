---
title: How to set macOS Dock animations speed
description: Customize your macOS Ventura dock animation speed in just a few clicks! Learn how in this step-by-step guide.
created: "2023-03-15T00:00:00Z"
---

### tl;dr

Set Dock to open without delay and twice as fast as the default.

```bash
defaults write com.apple.dock autohide-delay -float 0;
defaults write com.apple.dock autohide-time-modifier -float 0.5;
killall Dock
```

---

The Dock is a fundamental feature of macOS that allows you to quickly access your favorite applications, files, and folders. By default, the dock comes with an animation and delay when you want to show the Dock with the mouse. However, some users may find this animation distracting or slow, and want to change the speed of the animation to better suit their preferences. In this post, I will walk you through how to set the macOS dock animation speed.

### Step 1: Open Terminal

The first step is to open the Terminal application on your Mac. You can do this by using Spotlight (Command + Space) and typing "Terminal," or by going to Applications > Utilities > Terminal.

### Step 2: Enter the Commands

Once the Terminal application is open, enter the following commands:

```bash
defaults write com.apple.dock autohide-time-modifier -float X;
defaults write com.apple.dock autohide-delay -float 0
```

Replace the "X" in the command with the number representing the speed you want. The lower the number, the faster the animation. For example, if you want the animation to be twice as fast as the default speed, enter "0.5" instead of "X."

The second command disables the Dock display delay. I like my Dock to open fast and a delay always feels laggy.

### Step 3: Restart Dock

After entering the command, you need to restart the dock to apply the changes. You can do this by entering the following command:

```bash
killall Dock
```

Once you've executed this command, the Dock will restart and apply the new animation speed.

In conclusion, setting the macOS Dock animation speed is a straightforward process that can be done with just a few Terminal commands. By following the steps above, you can customize your dock's animation speed to better suit your preferences and workflow.
