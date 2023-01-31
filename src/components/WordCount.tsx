import { createMemo, createSignal, For, Show } from "solid-js";

export default function WordCount() {
  let [text, setText] = createSignal("");

  let words = createMemo(() => {
    return text()
      .trim()
      .replace(/\s+/gi, " ")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ");
  });

  let counts = createMemo(() => {
    let wordsCount = text() === "" ? 0 : words().length;
    let charsCount = text().replace(/\n/g, "").length;
    let sentencesCount = text().split(/[.!?]/).length - 1;
    let paragraphs = text().replace(/\n$/gm, "").split(/\n/);
    let paragraphsCount = text() === "" ? 0 : paragraphs.length;

    return {
      words: wordsCount,
      chars: charsCount,
      sentences: sentencesCount,
      paragraphs: paragraphsCount,
    };
  });

  let readingTime = createMemo(() => {
    return Math.ceil(words().length / 250);
  });

  let density = createMemo(() => {
    let densityMap: Map<string, number> = words().reduce(
      (p, c) => p.set(c, (p.get(c) || 0) + 1),
      new Map()
    );
    let density = [...densityMap.entries()].sort((a, b) => b[1] - a[1]);

    return density[0][0] === "" ? [] : density;
  });

  return (
    <div class="flex flex-col gap-6">
      <div class="flex justify-between mx-auto px-10 container max-w-4xl">
        <div class="flex gap-6">
          <Stat label="Characters" value={counts().chars} />
          <Stat label="Words" value={counts().words} />
          <Stat label="Sentances" value={counts().sentences} />
          <Stat label="Paragraphs" value={counts().paragraphs} />
        </div>

        <div class="flex gap-6">
          <Show when={counts().chars > 20}>
            <span class="flex gap-1">
              <Stat label="Reading" value={readingTime()} />
              <span>min</span>
            </span>
          </Show>
        </div>
      </div>

      <div class="mx-auto container max-w-4xl">
        <textarea
          class="p-10 w-full rounded-3xl dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-200 resize-none text-lg shadow-2xl dark:shadow-black/25 shadow-slate-200"
          onInput={(e) => {
            setText(e.currentTarget.value);
          }}
          placeholder="Your text here..."
          rows={20}
        />
      </div>

      <div class="mx-auto px-10 container max-w-4xl">
        <ul class="flex gap-2 flex-wrap justify-center">
          <For each={density()}>
            {(stat) => (
              <li class="flex gap-6 px-2 py-1 border dark:border-slate-700 border-slate-300 rounded">
                <span class="font-semibold">{stat[0]}</span>
                <span class="font-extralight dark:text-slate-400">
                  {stat[1]}
                </span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}

function Stat(props: { label: string; value: number }) {
  return (
    <div class="flex gap-2">
      <span class="font-extralight dark:text-slate-400">{props.label}</span>
      <span class="font-semibold">{props.value}</span>
    </div>
  );
}
