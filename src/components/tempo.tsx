import type { Signal } from "@builder.io/qwik";

export const Tempo = ({ blackDuration }: { blackDuration: Signal<string> }) => {
  return (
    <>
      <label
        for="duration"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Duration of a black note in milliseconds
      </label>

      <input
        id="duration"
        type="number"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        bind:value={blackDuration}
      />
    </>
  );
};
