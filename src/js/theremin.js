import SmoothedConstant from './smoothed-constant';

// Internal: frequency by MIDI note number
const midiFreq = (note) => 440 * (2 ** ((note - 69) / 12));

/***********************************************************************
THEREMIN INSTRUMENT
===================

SmoothedConstant       SmoothedConstant
+-------------+        +------------+
| this.detune |        | this.level |
+-------------+        +------------+
       |                     |
       |  OscillatorNode     |  GainNode
       |  +---------------+  |  +-------------+
       |  |   this.osc    |  |  |  this.gain  |    AudioDestination
       |  |               |  |  |             |    +-----------------+
       |  | AudioParam    |---->| AudioParam  |--->| ctx.destination |
       |  | +-----------+ |  |  | +-------+   |    +-----------------+
       +--->| .detune   | |  +--->| .gain |   |
          | +-----------+ |     | +-------+   |
          +---------------+     +-------------+

Oscillator frequency is scaled by MIDI note and manupulated by osc.detune,
where osc.frequency is fixed to the lowest frequency.
It is mapped to the mouse X coordinate of the theremin UI element.

Sound volume is scaled by the quadratic function y**2,
which is mapped to the mouse Y coordinate of the element.

Works fine on Chrome 72, Firefox 65, and Opera 58.
***********************************************************************/
const SMOOTHING_TIME_DETUNE = 0.05,
      SMOOTHING_TIME_LEVEL = 0.02;

// Theremin instrument
// -------------------
class Theremin {
  constructor(ctx, noteL, noteH) {
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.detune = new SmoothedConstant(ctx, SMOOTHING_TIME_DETUNE);
    this.detune.connect(this.osc.detune);
    this.level = new SmoothedConstant(ctx, SMOOTHING_TIME_LEVEL);
    this.level.connect(this.gain.gain);
    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);

    this.L = noteL;
    this.H = noteH;
    this.x = 0;        // 0..1
    this.y = 0;        // 0..1

    this.updateX();
    this.updateY();
    this.updateFrequency();
    this.osc.start();
  }

  // setter (write only)
  set X(x) {
    this.x = x;
    this.updateX();
  }

  set Y(y) {
    this.y = y;
    this.updateY();
  }

  set rangeL(note) {
    this.L = note;
    this.updateFrequency();
    this.updateX();
  }

  set rangeH(note) {
    this.H = note;
    this.updateX();
  }

  // internal
  updateX() {
    this.detune.value = 100 * this.x * (this.H - this.L);
  }

  updateY() {
    this.level.value = this.y * this.y;
  }

  updateFrequency() {
    this.osc.frequency.value = midiFreq(this.L);
  }
}

export default Theremin;
