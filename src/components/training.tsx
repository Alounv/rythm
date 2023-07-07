import type { Signal } from "@builder.io/qwik";
import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

export const Training = component$(
  ({
    textInput,
    blackDuration,
  }: {
    textInput: Signal<string>;
    blackDuration: Signal<string>;
  }) => {
    // -- states
    const progression = useSignal<number>(0);
    const isPlaying = useSignal<boolean>(false);

    // -- computed
    const sequence = useComputed$(() => {
      return textInput.value.split("\n").flatMap((line) => {
        const notes = line
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        return notes
          .map((note, i) => {
            const [value, word] = note.split(" ");
            const isTriplet = value.includes("t");
            const duration = isTriplet
              ? parseInt(value.replace("t", "")) * 2
              : parseInt(value) * 3;
            const isLast = i === notes.length - 1;
            return { duration, word, isLast };
          })
          .filter((n) => !isNaN(n.duration));
      });
    });

    const tick = useComputed$(() =>
      Math.floor(parseInt(blackDuration.value) / 12)
    );

    // -- effects
    useTask$(({ track, cleanup }) => {
      track(() => isPlaying.value);

      const totalDuration = sequence.value.reduce(
        (acc, v) => acc + v.duration,
        0
      );

      if (isPlaying.value && progression.value > totalDuration) {
        progression.value = 0;
      }

      const id = setInterval(() => {
        progression.value++;
        if (progression.value > totalDuration) {
          clearInterval(id);
          isPlaying.value = false;
        }
      }, tick.value);

      if (!isPlaying.value) {
        clearInterval(id);
      }

      cleanup(() => clearInterval(id));
    });

    return (
      <>
        <div class="font-medium text-sm">Training</div>

        <div class="flex flex-col gap-4">
          <div class="text-sm opacity-60">Click somewhere to start</div>
          <div class="flex items-start gap-2 flex-wrap">
            {sequence.value.map(({ duration, word, isLast }, i) => {
              const previousDuration = sequence.value
                .slice(0, i)
                .reduce((acc, v) => acc + v.duration, 0);
              return (
                <Note
                  key={i}
                  {...{
                    previousDuration,
                    duration,
                    word,
                    isLast,
                    i,
                    progression,
                    isPlaying,
                  }}
                  tick={tick.value}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }
);

const Note = ({
  previousDuration,
  progression,
  isPlaying,
  duration,
  word,
  isLast,
  i,
  tick,
}: {
  previousDuration: number;
  progression: Signal<number>;
  isPlaying: Signal<boolean>;
  duration: number;
  word: string;
  isLast: boolean;
  i: number;
  tick: number;
}) => {
  const currentProgression = progression.value - previousDuration;
  const isWordPassed = currentProgression > duration;
  const isWordCurrent = currentProgression > 0;

  return (
    <>
      <div
        key={i}
        class="flex flex-col items-center h-8"
        onClick$={() => {
          progression.value = previousDuration;
          isPlaying.value = !isPlaying.value;
        }}
      >
        <div class="flex">
          {new Array(duration).fill("").map((_, i) => {
            const isCurrent = i < currentProgression;
            return <Tick key={i} {...{ isCurrent, word, tick }} />;
          })}
        </div>

        <div
          class={`transition ${isWordCurrent ? "font-bold" : ""} ${
            isWordPassed ? "opacity-20 font-normal" : ""
          }`}
        >
          {word}
        </div>
      </div>

      {isLast ? <div class="basis-full" /> : ""}
    </>
  );
};

const Tick = ({
  isCurrent,
  word,
  tick,
}: {
  isCurrent: boolean;
  word: string;
  tick: number;
}) => {
  const wordCls = !word ? "opacity-20" : "";
  const currentCls = isCurrent ? "translate-x-0" : "";
  return (
    <div
      class={`relative h-2 w-2 bg-gray-900 dark:bg-white overflow-hidden ${wordCls}`}
    >
      <div
        class={`absolute top-0 bottom-0 left-0 right-0 -translate-x-full ${currentCls} bg-sky-400 dark:bg-sky-800 transition ease-[linear]`}
        style={{ transitionDuration: `${tick}ms` }}
      />
    </div>
  );
};
