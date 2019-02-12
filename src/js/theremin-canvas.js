import $ from 'jquery';
import MIDI_NOTE from './midi-note';

// Teremin canvas
// --------------
class ThereminCanvas {
  constructor(selector, noteL, noteH) {
    const canvas = $(selector)[0];
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.L = noteL;
    this.H = noteH;
    this.draw();
  }

  // setter
  set rangeL(note) {    // write only
    this.L = note;
    this.draw();
  }

  set rangeH(note) {    // write only
    this.H = note;
    this.draw();
  }

  // internal
  draw() {
    const W = this.width,
          H = this.height,
          ctx = this.ctx;
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e3e3e3';
    ctx.fillStyle = '#777';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let n = this.L; n <= this.H; n++) {
      const x = W * (n - this.L) / (this.H - this.L);
      ctx.beginPath();
      const note = MIDI_NOTE[n],
            isSemitone = note.indexOf('#') != -1;
      ctx.lineWidth = isSemitone ? 2
                                 : (n % 12) == 0 ? 5
                                                 : 3;
      ctx.strokeStyle = isSemitone ? '#d5d5d5'
                                   : (n % 12) == 0 ? '#fbb'
                                                   : '#f0e0e0';
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      if (!isSemitone) {
        ctx.fillText(note, x, 2);
      }
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d5d5d5';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.textBaseline = 'bottom';
    ctx.font = '14px sans-serif';
    for (let level of [[H/8, -36],
                       [H/4, -24],
                       [H/(2*Math.sqrt(2)), -18],
                       [H/2, -12],
                       [H/Math.sqrt(2), -6],
                       [H-1, 0]]) {
      const h = level[0];
      ctx.moveTo(0, h);
      ctx.lineTo(W, h);
      ctx.fillText(`${level[1]}dB`, W/2, h-1);
    }
    ctx.stroke();
  }
}

export default ThereminCanvas;
