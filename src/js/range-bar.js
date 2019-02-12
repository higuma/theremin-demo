import $ from 'jquery';
import MIDI_NOTE from './midi-note';

// constants
const RANGE_MIN = 12,   // C0
      RANGE_MAX = 137,  // F10
      RANGE_INIT_L = 48,
      RANGE_INIT_H = 84,
      WIDTH_MIN = 12,
      WIDTH_MAX = RANGE_MAX - RANGE_MIN;

// internal helper function
const limitLH = (x, L, H) => x < L ? L
                                   : x > H ? H
                                           : x; 

// Range bar
// --------
class RangeBar {
  constructor(selectorRange, selectorOffset, selectorBar, application) {
    this.$document = $(document);
    this.$range = $(selectorRange);
    this.$offset = $(selectorOffset);
    this.$bar = $(selectorBar);
    this.application = application;
    this.$range.on('mousedown', (event) => this.mouseDown(event));
    this.L = RANGE_INIT_L;
    this.H = RANGE_INIT_H;
    this.updateBar();
  }

  // getter (read only)
  get rangeL() {
    return this.L;
  }

  get rangeH() {
    return this.H;
  }

  // internal (event handlers)
  mouseDown(event) {
    this.$document.on('mousemove', (event) => this.mouseMove(event));
    this.$document.on('mouseup', (event) => this.mouseUp(event));
    const r = this.$bar[0].getBoundingClientRect();
    this.x0 = event.clientX;
    this.dx = this.$range[0].clientWidth / WIDTH_MAX;
    if (this.x0 < (r.left +  r.right) / 2) {
      this.n0 = this.L;
      this.dragging = 'L';
    } else {
      this.n0 = this.H;
      this.dragging = 'H';
    }
  }

  mouseMove(event) {
    let n = this.n0 + Math.round((event.clientX - this.x0) / this.dx);
    if (this.dragging == 'L') {
      n = limitLH(n, RANGE_MIN, this.H - WIDTH_MIN);
      if (n != this.L) {
        this.L = n;
        this.updateBar();
        this.application.rangeL = n;
      }
    } else {
      n = limitLH(n, this.L + WIDTH_MIN, RANGE_MAX);
      if (n != this.H) {
        this.H = n;
        this.updateBar();
        this.application.rangeH = n;
      }
    }
  }

  mouseUp(event) {
    this.$document.off('mousemove');
    this.$document.off('mouseup');
    this.dragging = null;
  }

  updateBar() {
    this.$offset.css('width', `${100 * (this.L - RANGE_MIN) / WIDTH_MAX}%`);
    this.$bar.css('width', `${100 * (this.H - this.L) / WIDTH_MAX}%`)
             .text(`${MIDI_NOTE[this.L]}-${MIDI_NOTE[this.H]}`);
  }
}

export default RangeBar;
