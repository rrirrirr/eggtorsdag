import chroma from "chroma-js";

const MIN_FREQUENCY = 100;
const MAX_FREQUENCY = 500;
const MIN_GAIN = 0.1;
const MAX_GAIN = 0.5;

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function calculateFrequencyAndGain(color: string) {
  const hsvColor = chroma(color).hsv();

  const hue = hsvColor[0];
  const brightness = hsvColor[2];

  const frequency = mapRange(hue, 0, 360, MIN_FREQUENCY, MAX_FREQUENCY);
  const gain = mapRange(brightness, 0, 1, MIN_GAIN, MAX_GAIN);

  return { frequency, gain };
}

export function calculateAverageFrequencyAndGain(colors: string[][]) {
  const flattenedColors = colors.flat();
  const validColors = flattenedColors.filter(
    (color) => color !== "transparent"
  );

  if (validColors.length === 0) {
    return {
      frequency: (MIN_FREQUENCY + MAX_FREQUENCY) / 2,
      gain: (MIN_GAIN + MAX_GAIN) / 2,
    };
  }

  const hsvColors = validColors.map((color) => chroma(color).hsv());

  const averageHue =
    hsvColors.reduce((sum, hsv) => sum + hsv[0], 0) / hsvColors.length;
  const averageBrightness =
    hsvColors.reduce((sum, hsv) => sum + hsv[2], 0) / hsvColors.length;

  const frequency = mapRange(averageHue, 0, 360, MIN_FREQUENCY, MAX_FREQUENCY);
  const gain = mapRange(averageBrightness, 0, 1, MIN_GAIN, MAX_GAIN);

  return { frequency, gain };
}

export const playDrone = (frequency: number, gain: number): OscillatorNode => {
  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = gain;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(0);

  return oscillator;
};

export const stopDrone = (oscillator: OscillatorNode) => {
  oscillator.stop();
};

export function playSound(frequency: number, gain: number, duration: number) {
  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.value = gain;

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

export function playEggMelody(
  colors: string[][],
  noteDuration: number,
  pauseBetweenNotes: number,
  onStop: () => boolean
) {
  const flattenedColors = colors.flat();
  let noteIndex = 0;

  function playNextNote() {
    if (noteIndex >= flattenedColors.length || onStop()) {
      return;
    }

    const color = flattenedColors[noteIndex];
    if (color !== "transparent") {
      const { frequency, gain } = calculateFrequencyAndGain(color);
      playSound(frequency, gain, noteDuration);
    }

    noteIndex++;
    setTimeout(playNextNote, pauseBetweenNotes);
  }

  playNextNote();
}
