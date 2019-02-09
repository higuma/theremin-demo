// Import Sass
import '../scss/style.scss';

// Use jQuery
import $ from 'jquery';

// Common constants
// ----------------

// MIDI notes (from A0, half tones are just described as null)
const MIDI_NOTE = [
  null, null, null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, 'A0', null, 'B0',
  'C1', null, 'D1', null, 'E1', 'F1', null, 'G1', null, 'A1', null, 'B1',
  'C2', null, 'D2', null, 'E2', 'F2', null, 'G2', null, 'A2', null, 'B2',
  'C3', null, 'D3', null, 'E3', 'F3', null, 'G3', null, 'A3', null, 'B3',
  'C4', null, 'D4', null, 'E4', 'F4', null, 'G4', null, 'A4', null, 'B4',
  'C5', null, 'D5', null, 'E5', 'F5', null, 'G5', null, 'A5', null, 'B5',
  'C6', null, 'D6', null, 'E6', 'F6', null, 'G6', null, 'A6', null, 'B6',
  'C7', null, 'D7', null, 'E7', 'F7', null, 'G7', null, 'A7', null, 'B7',
  'C8', null, 'D8', null, 'E8', 'F8', null, 'G8', null, 'A8', null, 'B8',
  'C9', null, 'D9', null, 'E9', 'F0', null, 'G9'
];

// MIDI frequencies
const MIDI_FREQ = (() => {
  let mf = [];
  for (let i = 0; i < 128; i++)
    mf.push(440 * (2 ** ((i - 69)/12)));
  return mf;
})();

/***********************************************************************
THEREMIN DIAGRAM
================
                           Oscillator
                           +------------+
                           |osc         |
                           |            |
Constant    BiquadFilter   | AudioParam |
+------+   +------------+  | +-------+  |   Gain
|detune|-->|detuneFilter|--->|.detune|  |   +------------+
+------+   +------------+  | +-------+  |-->|gain        |
                           +------------+   |            |
Constant    BiquadFilter                    | AudioParam |
+------+   +------------+                   | +-------+  |   AudioDestination
|volume|-->|volumeFilter|-------------------->| .gain |  |   +-----------+
+------+   +------------+                   | +-------+  |-->|destination|
                                            +------------+   +-----------+

Oscillator frequency is scaled by MIDI note and manupulated by osc.detune,
where osc.frequency is fixed to the lowest frequency.
It is mapped to the mouse X coordinate of the theremin pad element.

Sound volume is scaled by the quadratic function y**2,
which is mapped to the mouse Y coordinate of the element.

***********************************************************************/

// Theremin instrument
// -------------------
class Theremin {
  constructor(selector, range, offset) {
    let aCtx = new (window.AudioContext || window.webkitAudioContext),
        $element = $(selector);
    this.element = $element[0];
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.detune = aCtx.createConstantSource();
    let detuneFilter = aCtx.createBiquadFilter();
    detuneFilter.type = 'lowpass';
    detuneFilter.frequency.value = 20;
    detuneFilter.Q.value = 0;
    this.detune.connect(detuneFilter);
    this.osc = aCtx.createOscillator();
    detuneFilter.connect(this.osc.detune);
    this.volume = aCtx.createConstantSource();
    this.volume.offset.value = 0;
    let volumeFilter = aCtx.createBiquadFilter();
    volumeFilter.type = 'lowpass';
    volumeFilter.frequency.value = 50;
    volumeFilter.Q.value = 0;
    this.volume.connect(volumeFilter);
    let gain = aCtx.createGain();
    volumeFilter.connect(gain.gain);
    this.osc.connect(gain);
    gain.connect(aCtx.destination);
    gain.gain.value = 0;

    this.dx = 0;
    this.dy = 0;
    this.setRange(range);
    this.setOffset(offset);

    this.mute();
    this.detune.start();
    this.volume.start();
    this.osc.start();

    $element.on('mousemove', (event) => this.mouseMove(event));
  }

  mute(muted = true) {
    this.muted = muted;
    if (this.muted) this.volume.offset.value = 0;
  }

  setRange(range) {
    this.range = range;
    this.updateNote();
  }

  setOffset(noteMin) {
    this.osc.frequency.value = MIDI_FREQ[noteMin];
    this.updateNote();
  }

  updateVolume() {
    this.volume.offset.value = this.dy * this.dy;
  }

  updateNote() {
    this.detune.offset.value = 100 * this.range * this.dx;
  }

  mouseMove(event) {
    if (this.muted) return;
    let rect = this.element.getBoundingClientRect();
    this.dx = (event.clientX - rect.left) / this.width;
    this.updateVolume();
    this.dy = (event.clientY - rect.top) / this.height;
    this.updateNote();
  }
}

// Teremin canvas (controller)
// ---------------------------
class ThereminCanvas {
  constructor(selector, range, offset) {
    let canvas = $(selector)[0];
    this.W = canvas.width;
    this.H = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.range = range;
    this.offset = offset;
    this.draw();
  }

  setRange(range) {
    this.range = range;
    this.draw();
  }

  setOffset(offset) {
    this.offset = offset;
    this.draw();
  }

  draw() {
    let W = this.W,
        H = this.H,
        ctx = this.ctx,
        range = this.range,
        offset = this.offset;
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e3e3e3';
    ctx.fillStyle = '#777';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let n = offset, nMax = n + range; n <= nMax; n++) {
      const x = W * (n - offset) / range;
      ctx.beginPath();
      const note = MIDI_NOTE[n];
      ctx.lineWidth = note ? ((n % 12) == 0 ? 5 : 3)
                           : 2;
      ctx.strokeStyle = note ? ((n % 12) == 0 ? '#fbb' : '#f0e0e0')
                             : '#d5d5d5';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      if (note) ctx.fillText(note, x, 2);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d5d5d5';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.textBaseline = 'bottom';
    for (let level of [[H/8, -36],
                       [H/4, -24],
                       [H/(2*Math.sqrt(2)), -18],
                       [H/2, -12],
                       [H/Math.sqrt(2), -6],
                       [H-1, 0]]) {
      let h = level[0];
      ctx.moveTo(0, h);
      ctx.lineTo(W, h);
      ctx.fillText(`${level[1]}dB`, W/2, h-1);
    }
    ctx.stroke();
  }
}

// Application
// -----------
const INSTRUMENT_SELECTOR = '#instrument',
      START_SELECTOR = '#start-button',
      RANGES_SELECTOR = '#range-buttons',
      OFFSETS_SELECTOR = '#offset-buttons',
      INIT_RANGE = 36,
      INIT_OFFSET = 60;

class ThereminApp {
  constructor() {
    this.instrument = null;
    this.running = false;
    this.canvas = new ThereminCanvas(INSTRUMENT_SELECTOR,
                                     INIT_RANGE, INIT_OFFSET);
    this.$start = $(START_SELECTOR);
    const $rangesGroup = $(RANGES_SELECTOR),
          $offsetsGroup = $(OFFSETS_SELECTOR);
    this.$ranges = $rangesGroup.find('.btn-sm');
    this.$offsets = $offsetsGroup.find('.btn-sm');
    this.$start.on('click', () => this.onClickStart());
    $rangesGroup.on('click', (event) => this.onClickRanges(event));
    $offsetsGroup.on('click', (event) => this.onClickOffsets(event));
  }

  initInstrument() {
    if (!this.instrument)
      this.instrument = new Theremin(INSTRUMENT_SELECTOR,
                                     INIT_RANGE, INIT_OFFSET);
  }

  onClickStart() {
    this.initInstrument();
    this.instrument.mute(this.running);
    this.running = !this.running;
    if (this.running)
      this.$start.removeClass('btn-secondary')
                 .addClass('btn-danger')
                 .text('Stop');
    else
      this.$start.removeClass('btn-danger')
                 .addClass('btn-secondary')
                 .text('Start');
  }

  onClickRanges(event) {
    this.initInstrument();
    const name = $(event.target).attr('name');
    this.$ranges.each((index, element) => {
      const $element = $(element),
            isTarget = name == $element.attr('name');
      $element.addClass(isTarget ? 'btn-warning' : 'btn-light')
              .removeClass(isTarget ? 'btn-light' : 'btn-warning');
    });
    const range = parseInt(name[0]) * 12;
    this.instrument.setRange(range);
    this.canvas.setRange(range);
    const oct = range / 12;
    this.$offsets.each((index, element) => {
      const $element = $(element),
            min = parseInt($element.attr('name')[1]);
      $(element).text(`C${min}-C${min+oct}`);
    });
  }

  onClickOffsets(event) {
    this.initInstrument();
    let name = $(event.target).attr('name');
    this.$offsets.each((index, element) => {
      const $element = $(element),
            isTarget = name == $element.attr('name');
      $element.addClass(isTarget ? 'btn-warning' : 'btn-light')
              .removeClass(isTarget ? 'btn-light' : 'btn-warning');
    });
    const offset = (parseInt(name[1]) + 1) * 12;
    this.instrument.setOffset(offset);
    this.canvas.setOffset(offset);
  }
}

// Start application
new ThereminApp;
