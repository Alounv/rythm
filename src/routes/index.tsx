import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Rules } from "~/components/rules";
import { EXAMPLE, ScoreInput } from "~/components/score-input";
import { Tempo } from "~/components/tempo";
import { Training } from "~/components/training";

const DEFAULT_BLACK = 1000;

export default component$(() => {
  const textInput = useSignal<string>(EXAMPLE);
  const blackDuration = useSignal<string>(`${DEFAULT_BLACK}`);

  return (
    <div class="flex flex-col gap-4">
      <Rules />
      <ScoreInput textInput={textInput} />
      <Tempo blackDuration={blackDuration} />
      <Training textInput={textInput} blackDuration={blackDuration} />
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
