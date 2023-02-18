import { ComponentProps, splitProps } from "solid-js";

export default function HighlightLink(props: ComponentProps<"a">) {
  let [local, others] = splitProps(props, ["children"]);

  return (
    <a
      {...others}
      class="group relative inline-flex justify-center items-center gap-3 px-5 h-12 font-semibold dark:[text-shadow:_0_2px_3px_#00254daa] shadow-input shadow-gray-a5 hover:shadow-gray-a8 active:shadow-gray-a10 active:bg-gray-a6 rounded-xl overflow-hidden transition duration-500 [&>svg]:text-gray-a11 [-webkit-backface-visibility:hidden] [-moz-backface-visibility:hidden] [-webkit-transform:translate3d(0,0,0)] [-moz-transform:translate3d(0,0,0)]"
    >
      {local.children}
      <div class="absolute -z-10 w-96 h-96 bottom-0 left-0 blur-2xl bg-blend-screen dark:bg-blend-color-dodge [background-image:radial-gradient(170px_at_33%_center,#1f73ff,transparent),radial-gradient(310px_at_top_left,#a93cff,transparent),radial-gradient(270px_at_bottom_right,#ff5e19,transparent),radial-gradient(50px_at_45%_top,#ca0000,transparent)] group-hover:-translate-x-48 group-hover:translate-y-72 transition duration-500" />
    </a>
  );
}
