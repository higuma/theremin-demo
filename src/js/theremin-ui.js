import $ from 'jquery';
import Theremin from './theremin';

class ThereminUI {
  constructor(selector, noteL, noteH) {
    this.$element = $(selector);
    this.element = this.$element[0];
    this.$element.on('mousemove', (event) => this.mouseMove(event));
    this.instrument = new Theremin(noteL, noteH);
    this.isMuted = true;
  }

  // setter (write only)
  set rangeL(note) {
    this.instrument.rangeL = note;
  }

  set rangeH(note) {
    this.instrument.rangeH = note;
  }

  set muted(mute) {
    this.isMuted = mute;
    if (this.isMuted) {
      this.instrument.Y = 0;
    }
  }

  // internal
  mouseMove(event) {
    if (!this.isMuted) {
      const r = this.element.getBoundingClientRect();
      this.instrument.X = (event.clientX - r.left) / this.element.clientWidth;
      this.instrument.Y = (event.clientY - r.top) / this.element.clientHeight;
    }
  }
}

export default ThereminUI;