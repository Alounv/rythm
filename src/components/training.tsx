import type { Signal } from "@builder.io/qwik";
import {
  component$,
  useComputed$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

enum S {
  Pressed = "_",
  Press = "P",
  Released = " ",
  Release = "R",
}

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

    const targets = useComputed$(() => {
      return sequence.value.reduce<S[][]>((acc, v) => {
        for (let i = 0; i < v.duration; i++) {
          const isFirst = i === 0;
          const isLast = i === v.duration - 1;
          const isSilence = !v.word;
          const status: S[] = (() => {
            if (isSilence) {
              if (isFirst) return [S.Release, S.Released];
              if (isLast) return [S.Released, S.Press];
              return [S.Released];
            }

            if (isFirst) return [S.Press, S.Pressed];
            if (isLast) return [S.Pressed, S.Release];
            return [S.Pressed];
          })();

          acc.push(status);
        }
        return acc;
      }, []);
    });

    const tick = useComputed$(() =>
      Math.floor(parseInt(blackDuration.value) / 12)
    );

    const currentTargets = useComputed$(() => {
      return targets.value[progression.value];
    });

    console.log(currentTargets.value);
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

    let cumulatedDuration = 0;
    return (
      <>
        <div class="font-medium text-sm">Training</div>

        <div class="flex flex-col gap-4">
          <div class="text-sm opacity-60">Click somewhere to start</div>
          <div class="flex items-start gap-2 flex-wrap">
            {sequence.value.map(({ duration, word, isLast }, i) => {
              cumulatedDuration += duration;
              const previousDuration = cumulatedDuration - duration;
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
  const isPassed = progression.value > duration + previousDuration;
  const isCurrent = !isPassed && progression.value > previousDuration;

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
          <NoteBar
            {...{
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
  isCurrent,
  isPassed,
  duration,
  word,
  tick,
}: {
  duration: number;
  isCurrent: boolean;
  isPassed: boolean;
  word: string;
  tick: number;
}) => {
  const wordCls = !word ? "opacity-20" : "";
  const passedCls = isPassed ? `translate-x-0` : "";
  const currentCls = isCurrent ? "transition ease-[linear] translate-x-0" : "";
  if (word === "gui") {
    console.log(isCurrent, isPassed, duration, word, tick);
  }
  return (
    <div
      class={`relative h-2 bg-gray-900 dark:bg-white overflow-hidden ${wordCls}`}
      style={{ width: `${duration / 2}rem` }}
    >
      <div
        class={`absolute top-0 bottom-0 left-0 right-0 -translate-x-full bg-sky-400 dark:bg-sky-800 ${passedCls} ${currentCls}`}
        style={{
          ...(isCurrent ? { transitionDuration: `${tick * duration}ms` } : {}),
        }}
      />
    </div>
  );
};
