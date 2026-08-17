// react-dom 19's server renderer schedules work via MessageChannel, which
// jsdom does not provide. Node's worker_threads implementation would work but
// its open ports keep the event loop alive and jest never exits, so this is a
// minimal timer-backed shim instead.
class ShimMessageChannel {
  port1: any = { onmessage: null as null | ((ev: { data: any }) => void), postMessage: () => {}, close: () => {} };
  port2: any;
  constructor() {
    this.port2 = {
      postMessage: (data: any) => {
        setTimeout(() => this.port1.onmessage && this.port1.onmessage({ data }), 0);
      },
      close: () => {}
    };
  }
}

if (typeof (globalThis as any).MessageChannel === 'undefined') {
  (globalThis as any).MessageChannel = ShimMessageChannel;
}

// jest's jsdom environment also lacks the encoding globals react-dom expects.
import { TextEncoder, TextDecoder } from 'node:util';
if (typeof (globalThis as any).TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = TextEncoder;
  (globalThis as any).TextDecoder = TextDecoder;
}
