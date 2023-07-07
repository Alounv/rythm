import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Rules } from "~/components/rules";
import { EXAMPLE, ScoreInput } from "~/components/score-input";
import { Tempo as TempoInput } from "~/components/tempo";
import { Training } from "~/components/training";

const DEFAULT_BLACK = 1000;

export default component$(() => {
  const textInput = useSignal<string>(EXAMPLE);
  const blackDuration = useSignal<string>(`${DEFAULT_BLACK}`);

  return (
    <div class="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 relative">
      <div class="relative">
        <div class="flex flex-col gap-4 top-6 sticky">
          <TempoInput blackDuration={blackDuration} />
          <ScoreInput textInput={textInput} />
          <Rules />
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <Training textInput={textInput} blackDuration={blackDuration} />
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
