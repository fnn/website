import { Button as Primitives } from "@kobalte/core";
import { ComponentProps, mergeProps, splitProps } from "solid-js";

type Props = Omit<
  ComponentProps<typeof Primitives.Root>,
  "isDisabled" | "disabled"
> & {
  color?: "blue" | "gray" | "red";
  size?: "1" | "2";
  state?: "normal" | "loading" | "disabled";
};

export default function Button(props: Props) {
  let [local, others] = splitProps(
    mergeProps({ color: "gray", size: "2", state: "normal" }, props),
    ["color", "size", "state", "onClick", "onKeyPress"]
  );

  return (
    <Primitives.Root
      {...others}
      aria-disabled={local.state === "disabled"}
      onClick={local.state === "disabled" ? handleDisabled : local.onClick}
      onKeyPress={
        local.state === "disabled" ? handleDisabled : local.onKeyPress
      }
      class="inline-flex items-center justify-center shrink-0 font-medium select-none outline-none [text-shadow:_0_2px_3px_#00254d0b] transition-all"
      classList={{
        "text-white bg-gradient-to-t from-blue-10 to-blue-9 dark:from-blue-8 dark:to-blue-9 bg-[size:100%_100%] hover:bg-[size:100%_140%] active:bg-[size:100%_200%] shadow-input shadow-blue-a7 hover:shadow-blue-a8 active:shadow-blue-a9 focus-visible:shadow-input-focus focus-visible:shadow-blue-a11":
          local.color === "blue" && local.state === "normal",
        "bg-blue-a3 shadow-input shadow-blue-a5 text-blue-a8 dark:mix-blend-exclusion dark:saturate-50":
          local.color === "blue" && local.state !== "normal",

        "bg-gray-a2 hover:bg-gray-a3 text-gray-12 shadow-input shadow-gray-a7 hover:shadow-gray-a8 active:shadow-gray-a9 focus-visible:shadow-input-focus focus-visible:shadow-gray-a8":
          local.color === "gray" && local.state === "normal",
        "bg-gray-a2 hover:bg-red-a3 text-red-11 shadow-input shadow-gray-a7 hover:shadow-red-a8 active:shadow-red-a9 focus-visible:shadow-input-focus focus-visible:shadow-red-a9":
          local.color === "red" && local.state === "normal",
        "bg-gray-a2 shadow-input shadow-gray-a5 text-gray-a8":
          local.color !== "blue" && local.state !== "normal",

        "px-3 h-7 text-sm rounded-lg": local.size === "1",
        "px-5 h-10 text-base rounded-lg": local.size === "2",
        "cursor-not-allowed": local.state === "disabled",
        "cursor-progress bg-[length:200%_auto] [background-position-x:50%] [contain:style]":
          local.state === "loading",
      }}
    />
  );
}

function handleDisabled(event: MouseEvent | KeyboardEvent) {
  event.preventDefault();
}
