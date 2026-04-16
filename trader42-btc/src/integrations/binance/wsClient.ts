import WebSocket from 'ws';
import { EventEmitter } from 'node:events';

type BinanceTradeMessage = {
  e?: string;
  p?: string;
  q?: string;
  T?: number;
};

export class BinanceWsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private wsUrl: string) {
    super();
  }

  connect(streams: string[]): void {
    const url = `${this.wsUrl}/${streams.join('/')}`;
    this.ws = new WebSocket(url);

    this.ws.on('open', () => this.emit('open'));

    this.ws.on('message', (raw: Buffer) => {
      const msg = JSON.parse(raw.toString());
      this.emit('message', msg);

      if (this.isTradeMessage(msg)) {
        this.emit('trade', {
          price: Number(msg.p),
          volume: Number(msg.q),
          timestamp: new Date(msg.T ?? Date.now()).toISOString(),
        });
      }
    });

    this.ws.on('error', (err: Error) => this.emit('error', err));

    this.ws.on('close', () => {
      this.emit('close');
      this.scheduleReconnect(streams);
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(streams: string[]): void {
    this.reconnectTimer = setTimeout(() => this.connect(streams), 5000);
  }

  private isTradeMessage(message: unknown): message is BinanceTradeMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const candidate = message as BinanceTradeMessage;
    return candidate.e === 'trade' && typeof candidate.p === 'string' && typeof candidate.q === 'string';
  }
}
