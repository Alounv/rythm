import type { Signal } from "@builder.io/qwik";
import { component$, useVisibleTask$ } from "@builder.io/qwik";

export const ScoreInput = component$(
  ({ textInput }: { textInput: Signal<string> }) => {
    useVisibleTask$(() => {
      textInput.value = getStorage("textInput") || EXAMPLE;
    });

    useVisibleTask$(({ track, cleanup }) => {
      track(() => textInput.value);
      cleanup(() => setStorage("textInput", textInput.value));
    });

    return (
      <>
        <label
          for="score"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Your input
        </label>

        <textarea
          id="score"
          rows={16}
          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          bind:value={textInput}
        />
      </>
    );
  }
);

const getStorage = (key: string) => {
  const value = localStorage.getItem(key);
  if (value) {
    return value;
  }
};

const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const EXAMPLE = `
4, 4, 2, 2 io, 2 ti, 2 se,
6 gui, 2 co, 2 m'i, 2 ri, 2 de, 2 di,
4 pa, 2 ce, 2, 2t lu, 2t ngo, 2t le, 3 vie, 1 del,
4 cie, 4 lo, 2, 2 io, 2 ti, 2 se,
8 gui, 2t co, 2t mu, 2t na, 2 mi, 2 ca,
4 fa, 4 ce, 2t, 2t de, 2t la, 2t no, 2t te, 2t nel,
4 ve, 4 lo, 2, 2 e, 2 te, 2 se,
6 nti, 1 ne, 1 la, 4 lu, 2 ce,1, 1 ne,
4 la, 2 ria, 1 nel, 1 pro, 4 fu, 2 mo, 2 del,
4 fio, 4 ri, 4, 3 e, 1 fu,
4 pie, 2 na, 2 la, 2 stan, 2 za, 2 so, 2 li,
4 ta, 2 ria, 2 Di, 2 te, 2 dei, 2 tuoi, 1, 1 sple,
4 ndo, 4 ri, 4, 4,

16, 
16, 
16,

4, 4, 2, 2 in, 2 te, 2 ra,
4 pi, 2 to, 2 al, 2 suon, 2 de, 2 la, 2 tua,
4 vo, 4 ce, 2t, 2t lu, 2t nga, 2t me, 2t nte, 2t so,
6 gnai, 2, 2 E, 2 de, 2 la,
4 te, 2 ra, 1 ogni, 1 ia, 2 fa, 2 no, 2 o, 2 gni
4 cro, 4 ce, 2t, 2t in, 2t quel, 2t gio, 2t rno, 2t scor,
6 dai, 2, 4, 4,
8 Tor, 2 na, 1, 2t ca, 2t ro, 2t ide,
12 al, 4,
4 to, 2 rna, 2 uni, 2t stan, 2t teA, 2t sor, 2t ri, 2t der, 2t miAn,
8 co, 2 ra, 2, 2 E, 2 a,
2 me, 2 ri, 2 sple, 2 nde, 2 ra, 2 nel, 2 tuo, 2 sem,
4 bian, 4 te, 2t U, 2t na, 2t no, 2 vel, 2 lau,
8 ro, 2 ra, 2 u, 2 na, 2 no, 
4 vel, 2 la, 2 au,  8 rooo,
4 ra, 4, 4, 4,

16,

8 Tor, 2 na, 2 caro, 2 i, 2 de,
4 al, 4, 4, 4,
8 tor, 4 na, 4,
12 tor, 4 na,
`;
