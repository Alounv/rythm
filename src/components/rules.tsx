export const Rules = () => {
  return (
    <>
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
          <li>3. For triplets, use 2t.</li>
        </ol>
      </div>
    </>
  );
};
