export class RollingWindow {
  private buffer: number[] = [];
  constructor(private maxSize: number) {}

  push(value: number) {
    this.buffer.push(value);
    if (this.buffer.length > this.maxSize) this.buffer.shift();
  }

  mean(): number {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  std(): number {
    if (this.buffer.length < 2) return 0;
    const m = this.mean();
    const variance = this.buffer.reduce((a, v) => a + (v - m) ** 2, 0) / (this.buffer.length - 1);
    return Math.sqrt(variance);
  }

  zScore(value: number): number {
    const s = this.std();
    return s === 0 ? 0 : (value - this.mean()) / s;
  }

  get size() {
    return this.buffer.length;
  }
}
