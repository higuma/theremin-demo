// Internal: frequency by MIDI note number
const midiFreq = (note) => 440 * (2 ** ((note - 69) / 12));

/***********************************************************************
THEREMIN INSTRUMENT FOR MICROSOFT EDGE
======================================

      OscillatorNode            GainNode
      +-------------------+     +-----------------+
      |    this.osc       |     |  this.gain      |    AudioDestination
      |                   |     |                 |    +-----------------+
      | AudioParam        |---->| AudioParam      |--->| ctx.destination |
      | +---------------+ |     | +-------------+ |    +-----------------+
   +----> .detune.value | |  +----> .gain.value | |
   |  | +---------------+ |  |  | +-------------+ |
   |  +-------------------+  |  +-----------------+
   |                         |
(Dirent assignment)       (Dirent assignment)

(Feb. 2019) Microsoft Edge supports Web Audio API. But it still does not
support connecting a AudioNode (source) to AudioParam (destination).

This implementation uses direct assignment to (AudioParam).value, which is
available for all versions.

Works fine on Edge 44 (EdgeHTML 18).
***********************************************************************/

// Theremin for Microsoft Edge
// ---------------------------
class ThereminForEdge {
  constructor(ctx, noteL, noteH) {
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
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
    this.osc.detune.value = 100 * this.x * (this.H - this.L);
  }

  updateY() {
    this.gain.gain.value = this.y * this.y;
  }

  updateFrequency() {
    this.osc.frequency.value = midiFreq(this.L);
  }
}

export default ThereminForEdge;
