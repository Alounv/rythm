import type { Signal } from "@builder.io/qwik";
import {
  component$,
  useComputed$,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";

const buttonCls =
  "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700";

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
      const notes = textInput.value.split("\n").flatMap((line) => {
        const lineNotes = line
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        return lineNotes
          .map((note, i) => {
            const [value, word] = note.split(" ");
            const isTriplet = value.includes("t");
            const duration = isTriplet
              ? parseInt(value.replace("t", "")) * 2
              : parseInt(value) * 3;
            const isLast = i === lineNotes.length - 1;
            return { duration, word, isLast };
          })
          .filter((n) => !isNaN(n.duration));
      });

      let cumulatedDuration = 0;
      return notes.map((n, i) => {
        cumulatedDuration += n.duration;
        return {
          ...n,
          previousDuration: cumulatedDuration - n.duration,
          index: i,
        };
      });
    });

    const pressCount = useStore<Record<number, number>>({});

    useTask$(({ track }) => {
      track(() => isPlaying.value);
      if (!isPlaying.value) {
        for (const k in pressCount) {
          if (sequence.value[k].previousDuration > progression.value) {
            delete pressCount[k];
          }
        }
      }
    });

    const currentNote = useComputed$(() => {
      const index = sequence.value.findIndex(
        (n) => n.previousDuration > progression.value
      );
      return sequence.value[index - 1];
    });

    const pressed = useSignal<boolean>(false);

    useTask$(({ track }) => {
      track(() => pressed.value);

      if (!pressed.value) return;

      const count = pressCount[currentNote.value.index] || 0;
      pressCount[currentNote.value.index] = count + 1;
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

          <div class="flex gap-4">
            <button
              onClick$={() => (isPlaying.value = !isPlaying.value)}
              class={buttonCls}
            >
              {isPlaying.value ? "Pause" : "Start"}
            </button>
            <PlayButton pressed={pressed} isPlaying={isPlaying} />
          </div>

          <div class="flex items-start gap-2 flex-wrap">
            {sequence.value.map(
              ({ duration, word, isLast, previousDuration }, i) => {
                const isCorrect = word ? pressCount[i] === 1 : !pressCount[i];
                return (
                  <Note
                    key={i}
                    {...{
                      isCorrect,
                      pressed,
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
              }
            )}
          </div>
        </div>
      </>
    );
  }
);

const Note = ({
  isCorrect,
  previousDuration,
  progression,
  isPlaying,
  duration,
  word,
  isLast,
  i,
  tick,
}: {
  isCorrect: boolean;
  previousDuration: number;
  progression: Signal<number>;
  isPlaying: Signal<boolean>;
  duration: number;
  word: string;
  isLast: boolean;
  i: number;
  tick: number;
}) => {
  const isPassed = progression.value > duration + previousDuration;
  const isCurrent = !isPassed && progression.value > previousDuration;

  return (
    <>
      <div
        key={i}
        class="flex flex-col items-center h-8"
        onClick$={() => {
          progression.value = previousDuration;
          isPlaying.value = false;
        }}
      >
        <div class="flex">
          <NoteBar
            {...{
              isCorrect: isCorrect && isPassed,
              isCurrent,
              isPassed,
              duration,
              word,
              tick,
            }}
          />
        </div>

        <div
          class={`transition ${isCurrent ? "font-bold" : ""} ${
            isPassed ? "opacity-20 font-normal" : ""
          }`}
        >
          {word}
        </div>
      </div>

      {isLast ? <div class="basis-full" /> : ""}
    </>
  );
};

const NoteBar = ({
  isCorrect,
  isCurrent,
  isPassed,
  duration,
  word,
  tick,
}: {
  isCorrect: boolean;
  duration: number;
  isCurrent: boolean;
  isPassed: boolean;
  word: string;
  tick: number;
}) => {
  const wordCls = !word ? "opacity-20" : "";
  const passedCls = isPassed ? `translate-x-0` : "";
  const currentCls = isCurrent ? "transition ease-[linear] translate-x-0" : "";
  const correctCls =
    !isCorrect && isPassed
      ? "bg-pink-400 dark:bg-pink-600"
      : "bg-sky-400 dark:bg-sky-600";
  return (
    <div
      class={`relative h-2 bg-gray-900 dark:bg-white overflow-hidden ${wordCls} ${
        isCorrect ? "h-3" : ""
      }`}
      style={{ width: `${duration / 2}rem` }}
    >
      <div
        class={`absolute top-0 bottom-0 left-0 right-0 -translate-x-full ${passedCls} ${currentCls} ${correctCls}`}
        style={{
          ...(isCurrent ? { transitionDuration: `${tick * duration}ms` } : {}),
        }}
      />
    </div>
  );
};

const PlayButton = ({
  pressed,
  isPlaying,
}: {
  pressed: Signal<boolean>;
  isPlaying: Signal<boolean>;
}) => {
  return (
    <button
      onMousedown$={() => {
        pressed.value = true;
        isPlaying.value = true;
      }}
      onKeyDown$={() => {
        pressed.value = true;
        isPlaying.value = true;
      }}
      onMouseup$={() => (pressed.value = false)}
      onKeyUp$={() => (pressed.value = false)}
      class={buttonCls}
    >
      {`Play (${pressed.value ? "pressed" : "released"})`}
    </button>
  );
};
