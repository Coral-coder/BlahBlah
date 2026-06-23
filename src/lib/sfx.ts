import Sound from "react-native-sound";

// Short UI sound effects. Files are bundled via Metro (require) so there's no
// native resource wiring. Failures are swallowed — audio is a nice-to-have.
Sound.setCategory("Playback", false);

type Name = "correct" | "wrong" | "complete";

const FILES: Record<Name, number> = {
  correct: require("@/assets/sfx/correct.wav"),
  wrong: require("@/assets/sfx/wrong.wav"),
  complete: require("@/assets/sfx/complete.wav"),
};

const cache: Partial<Record<Name, Sound>> = {};

function load(name: Name): Promise<Sound> {
  const existing = cache[name];
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const s = new Sound(FILES[name], (error) => {
      if (error) return reject(error);
      cache[name] = s;
      resolve(s);
    });
  });
}

export function playSfx(name: Name): void {
  load(name)
    .then((s) => {
      s.stop(() => s.play());
    })
    .catch(() => {
      // no-op
    });
}
