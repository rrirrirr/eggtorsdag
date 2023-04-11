export class EggMelody {
  private context: AudioContext;
  private frequencies: number[] = [];
  private gains: number[] = [];
  private noteDuration: number;
  private isPlaying: boolean;
  private updateMelody: boolean;
  private newFrequencies: number[] = [];
  private newGains: number[] = [];

  constructor(context: AudioContext, noteDuration: number) {
    this.context = context;
    this.noteDuration = noteDuration;
    this.isPlaying = false;
    this.updateMelody = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  addTone(frequency: number, gain: number) {
    this.frequencies.push(frequency);
    this.gains.push(gain);
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.playMelody();
    }
  }

  setMelody(frequencies: number[], gains: number[]) {
    this.newFrequencies = frequencies;
    this.newGains = gains;
    this.updateMelody = true;
  }

  updateMelodyIfRequired() {
    if (this.updateMelody) {
      this.frequencies = this.newFrequencies;
      this.gains = this.newGains;
      this.updateMelody = false;
    }
  }

  playMelody() {
    this.updateMelodyIfRequired();
    this.frequencies.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
      oscillator.type = "sine";

      const gainNode = this.context.createGain();
      gainNode.gain.setValueAtTime(this.gains[index], this.context.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);

      const startTime = this.context.currentTime + index * 0.5;
      const stopTime = startTime + this.noteDuration;
      oscillator.start(startTime);
      oscillator.stop(stopTime);
    });

    setTimeout(() => {
      if (this.isPlaying) {
        this.playMelody();
      }
    }, this.frequencies.length * this.noteDuration * 1000);
  }

  stop() {
    this.isPlaying = false;
  }
}
