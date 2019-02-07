// Import Sass
import '../scss/style.scss';

// Use jQuery
import $ from 'jquery';

/*
Oscillator frequency is scale by note pitch (not by frequency).
Its pitch is manupulated by .detune
(.frequency is fixed to C3(48) = 130.81[Hz])
It is mapped to the theremin pad element width.

Sound volume is scaled to the simple quadratic function (x**2).
It is mapped to the element height.
*/

// Oscillator constants
// --------------------
const FreqBase = 130.81,    // Lowest frequency = MIDI A3(48)
      DetuneWidth = 3600;   // 3 octaves

// Simple Theremin with Web Audio API
// ----------------------------------
class Theremin {
  constructor(selector) {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ac = new AudioContext;
    this.$element = $(selector);
    this.element = this.$element[0];
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.detune = this.ac.createConstantSource();
    this.detune.offset.value = 0;
    this.detuneFilter = this.ac.createBiquadFilter();
    this.detuneFilter.type = 'lowpass';
    this.detuneFilter.frequency.value = 20;
    this.detuneFilter.Q.value = 0;
    this.detune.connect(this.detuneFilter);
    this.osc = this.ac.createOscillator();
    this.osc.frequency.value = FreqBase;
    this.detuneFilter.connect(this.osc.detune);
    this.volume = this.ac.createConstantSource();
    this.volume.offset.value = 0;
    this.volumeFilter = this.ac.createBiquadFilter();
    this.volumeFilter.type = 'lowpass';
    this.volumeFilter.frequency.value = 50;
    this.volumeFilter.Q.value = 0;
    this.volume.connect(this.volumeFilter);
    this.gain = this.ac.createGain();
    this.volumeFilter.connect(this.gain.gain);
    this.osc.connect(this.gain);
    this.gain.connect(this.ac.destination);
    this.gain.gain.value = 0;
    this.mute();
    this.detune.start();
    this.volume.start();
    this.osc.start();
    this.$element.on('mousemove', (event) => this.mouseMove(event));
    console.log(this.detuneFilter);
  }

  mute(muted = true) {
    this.muted = muted;
    if (this.muted) this.volume.offset.value = 0;
  }

  mouseMove(event) {
    if (this.muted) return;
    let rect = this.element.getBoundingClientRect();
    let dx = (event.clientX - rect.left) / this.width;
    let dy = (event.clientY - rect.top) / this.height;
    this.volume.offset.value = dy * dy;
    this.detune.offset.value = DetuneWidth * dx;
  }
}

// Startup
// -------

const ThereminPadId = 'theremin-pad',
      ThereminPadSelector = `#${ThereminPadId}`,
      MIDINOTE = 'C3  D3  E3 F3  G3  A3  B3 C4  D4  E4 F4  G4  A4  B4 C5  D5  E5 F5  G5  A5  B5 C6'.split(' ');

// Draw canvas
let canvas = document.getElementById(ThereminPadId),
    W = canvas.width,
    H = canvas.height,
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e3e3e3';
    ctx.fillStyle = '#777';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 36; i++) {
      const x = W * i / 36;
      if (MIDINOTE[i] != '') ctx.fillText(MIDINOTE[i], x, 2);
      ctx.beginPath();
      ctx.strokeStyle = MIDINOTE[i] == '' ? '#e8e8e8' : '#ffd0d0';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e3e3e3';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.textBaseline = 'bottom';
    for (let level of [[H/8, -36], [H/4, -24], [H/(2*Math.sqrt(2)), -18], [H/2, -12], [H/Math.sqrt(2), -6], [H-1, 0]]) {
      let h = level[0];
      ctx.moveTo(0, h);
      ctx.lineTo(W, h);
      ctx.fillText(`${level[1]}dB`, W/2, h-1);
    }
    ctx.stroke();

// Setup button handler
let $startBtn = $('#start-button'),
    theremin = undefined,
    running = false;

$startBtn.on('click', () => {
  if (!theremin) theremin = new Theremin(ThereminPadSelector);
  theremin.mute(running);
  $startBtn.text(running ? 'Start' : 'Running...');
  running = !running;
});
