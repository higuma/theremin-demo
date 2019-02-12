import $ from 'jquery';
import SmoothedConst from './smoothed-const';

// Internal: frequency by MIDI note number
const midiFreq = (note) => 440 * (2 ** ((note - 69) / 12));

/***********************************************************************
THEREMIN INSTRUMENT DIAGRAM
===========================

               Oscillator
               +-------------+
               |     osc     |
               |             |
SmoothedConst  | AudioParam  |
+----------+   | +---------+ |    Gain
|  detune  |---->| .detune | |    +------------+
+----------+   | +---------+ |--->|    gain    |
               +-------------+    |            |
SmoothedConst                     | AudioParam |
+----------+                      | +-------+  |    AudioDestination
|  volume  |----------------------->| .gain |  |    +-----------------+
+----------+                      | +-------+  |--->| ctx.destination |
                                  +------------+    +-----------------+

Oscillator frequency is scaled by MIDI note and manupulated by osc.detune,
where osc.frequency is fixed to the lowest frequency.
It is mapped to the mouse X coordinate of the theremin UI element.

Sound volume is scaled by the quadratic function y**2,
which is mapped to the mouse Y coordinate of the element.

***********************************************************************/

// Theremin instrument
// -------------------
class Theremin {
  constructor(noteL, noteH) {
    const ctx = new (window.AudioContext || window.webkitAudioContext);
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.detune = new SmoothedConst(ctx, 0.05);
    this.detune.node.connect(this.osc.detune);
    this.level = new SmoothedConst(ctx, 0.02);
    this.level.node.connect(this.gain.gain);
    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);

    this.x = 0;        // 0..1
    this.y = 0;        // 0..1
    this.L = noteL;
    this.H = noteH;
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
