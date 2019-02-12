import $ from 'jquery';
import MIDI_NOTE from './midi-note';

const COLOR_BACKGROUND = '#f5f4f3',
      TEXT_COLOR_NOTE = '#676365',
      TEXT_COLOR_LEVEL = '#a1a1a1',
      FONT_NOTE = '16px sans-serif',
      FONT_LEVEL = '14px sans-serif',
      LINE_WIDTH_C = 6,
      LINE_WIDTH_SCALE = 3,
      LINE_WIDTH_SEMITONE = 1,
      LINE_WIDTH_LEVEL = 1,
      LINE_COLOR_C = '#ffb2b2',
      LINE_COLOR_SCALE = '#e9c5c5',
      LINE_COLOR_SEMITONE = '#acacac',
      LINE_COLOR_LEVEL = '#d0d0d0';

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
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = TEXT_COLOR_NOTE;
    ctx.font = FONT_NOTE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let n = this.L; n <= this.H; n++) {
      const x = W * (n - this.L) / (this.H - this.L);
      ctx.beginPath();
      const note = MIDI_NOTE[n],
            isC = n % 12 == 0,
            isSemitone = note.indexOf('#') != -1,
            isWide = this.H - this.L > 60;
      ctx.lineWidth = isSemitone ? LINE_WIDTH_SEMITONE
                                 : isC ? LINE_WIDTH_C : LINE_WIDTH_SCALE;
      ctx.strokeStyle = isSemitone ? LINE_COLOR_SEMITONE
                                   : isC ? LINE_COLOR_C : LINE_COLOR_SCALE;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      if (!isSemitone && (isC || !isWide)) {
        ctx.fillText(note, x, 2);
      }
    }
    ctx.lineWidth = LINE_WIDTH_LEVEL;
    ctx.strokeStyle = LINE_COLOR_LEVEL;
    ctx.fillStyle = TEXT_COLOR_LEVEL;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.textBaseline = 'bottom';
    ctx.font = FONT_LEVEL;
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
