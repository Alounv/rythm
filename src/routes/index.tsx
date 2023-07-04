import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const EXAMPLE = `
4, 4, 2, 2 io, 2 ti, 2 se, 6 gui,
2 co, 2 m'i, 2 ri, 2 de, 2 di, 4 pa, 2 ce, 2,
2 lu, 2 ngo, 2 le, 3 vie, 1 del, 4 cie, 4 lo
`;

const DEFAULT_BLACK = 1200;

export default component$(() => {
  const textInput = useSignal<string>(EXAMPLE);
  const blackDuration = useSignal<string>(`${DEFAULT_BLACK}`);
  const tick = useComputed$(() => parseInt(blackDuration.value) / 4);
  const progression = useSignal<number>(0);
  const isPlaying = useSignal<boolean>(false);
  const sequence = useComputed$(() => {
    return textInput.value.split(",").map((note) => {
      const [value, word] = note.trim().split(" ");
      const duration = parseInt(value);
      return { duration, word };
    });
  });

  useTask$(({ track }) => {
    track(() => isPlaying.value);

    const totalDuration = sequence.value.reduce(
      (acc, v) => acc + v.duration,
      0
    );

    if (isPlaying.value && progression.value > totalDuration) {
      progression.value = 0;
    }

    const interval = setInterval(() => {
      progression.value++;
      if (progression.value > totalDuration) {
        clearInterval(interval);
        isPlaying.value = false;
      }
    }, tick.value);

    if (!isPlaying.value) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  });

  return (
    <div class="flex flex-col gap-4">
      <div class="text-sm font-medium">The rules</div>

      <div class="opacity-60 italic text-sm">
        <div>Type the rythme of a song you need to learn.</div>
        <ol>
          <li>1. Each note is separated by a comma.</li>
          <li>
            2. Each note is represented by:
            <br />
            - a number (1 = quarter note, 2 = half note, 3 = dotted half note, 4
            = whole note, and so on)
            <br />- a word (nothing for silences).
          </li>
          <li>3. For triplets, use 1/3, 2/3, 3/3.</li>
        </ol>
      </div>

      <label
        for="score"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Your input
      </label>

      <textarea
        id="score"
        rows={4}
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={textInput}
      />

      <label
        for="duration"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Duration of a black note (4)
      </label>

      <input
        id="duration"
        type="number"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={blackDuration}
      />

      <div class="font-medium text-sm">Training</div>

      <div>
        <div class="flex items-start gap-2 flex-wrap">
          {sequence.value.map(({ duration, word }, i) => {
            const previousDuration = sequence.value
              .slice(0, i)
              .reduce((acc, v) => acc + v.duration, 0);

            const currentProgression = progression.value - previousDuration;
            const isWordPassed = currentProgression > duration;
            const isWordCurrent = currentProgression > 0;

            return (
              <div key={i} class="flex flex-col items-center">
                <div class="flex">
                  {new Array(duration).fill("").map((_, i) => {
                    const isCurrent = i < currentProgression;
                    const wordCls = !word ? "opacity-40" : "font-bold";
                    const currentCls = isCurrent ? "translate-x-0" : "";
                    return (
                      <div
                        key={i}
                        class={`relative h-2 w-4 bg-gray-900 dark:bg-white overflow-hidden ${wordCls}`}
                      >
                        <div
                          class={`
                          absolute top-0 bottom-0 left-0 right-0 
                          transition duration-[${tick.value}ms] ease-[linear] -translate-x-full ${currentCls}
                          bg-sky-100 dark:bg-sky-800
                          `}
                        />
                      </div>
                    );
                  })}
                </div>
                <div
                  class={`transition
                  ${isWordPassed ? "opacity-40" : ""}
                  ${isWordCurrent ? "font-bold" : ""}
                  `}
                >
                  {word}
                </div>
              </div>
            );
          })}
        </div>

        <button
          class="mt-4"
          onClick$={() => (isPlaying.value = !isPlaying.value)}
        >
          {isPlaying.value ? "pause" : "play"}
        </button>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Rythmn",
  meta: [
    {
      name: "description",
      content: "Learn the rythmn of a song",
    },
  ],
};
