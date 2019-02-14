import StartStopButton from './start-stop-button';
import RangeBar from './range-bar';
import ThereminCanvas from './theremin-canvas';
import ThereminUI from './theremin-ui';

const SEL_START_STOP = '#start-stop',
      SEL_RANGE = '#range',
      SEL_OFFSET = '#range-offset',
      SEL_BAR = '#range-bar',
      SEL_CANVAS = '#theremin';

class ThereminApp {
  constructor() {
    this.startStop = new StartStopButton(SEL_START_STOP, this);
    this.rangeBar = new RangeBar(SEL_RANGE, SEL_OFFSET, SEL_BAR, this);
    const rangeL = this.rangeBar.rangeL,
          rangeH = this.rangeBar.rangeH;
    this.canvas = new ThereminCanvas(SEL_CANVAS, rangeL, rangeH);
    // this.ui is created on the first start/stop button click
  }

  // getter/setter
  get rangeL() {        // read from rangeBar
    return this.rangeBar.rangeL;
  }

  set rangeL(note) {    // written from rangeBar
    this.canvas.rangeL = note;
    if (this.ui) {
      this.ui.rangeL = note;
    }
  }

  get rangeH() {        // read from rangeBar
    return this.rangeBar.rangeH;
  }

  set rangeH(note) {    // written from rangeBar
    this.canvas.rangeH = note;
    if (this.ui) {
      this.ui.rangeH = note;
    }
  }

  set running(run) {    // write only - from start/stop button
    if (!this.ui) {
      // create on the first click
      // (Web audio API requires creating audio objects on user operation)
      this.ui = new ThereminUI(SEL_CANVAS, this.rangeL, this.rangeH);
    }
    this.ui.muted = !run;
  }
}

export default ThereminApp;
