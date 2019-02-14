import AudioConstant from './audio-constant';

// Smoothed audio rate constant
// ----------------------------
class SmoothedConstant {
  constructor(ctx, smoothingTime) {
    this.constant = new AudioConstant(ctx);
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1 / smoothingTime;
    this.filter.Q.value = 0.0001;
    this.constant.connect(this.filter);
  }

  get value() {
    return this.constant.value;
  }

  set value(val) {
    this.constant.value = val;
  }

  connect(node) {
    this.filter.connect(node);
  }
}

export default SmoothedConstant;
