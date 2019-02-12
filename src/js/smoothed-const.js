/***********************************************************************
Smoothed constant
=================

[ConstantSource]-->[BiquadFilter]

***********************************************************************/

class SmoothedConstant {
  constructor(audioContext, smoothingTime) {
    this.constant = audioContext.createConstantSource();
    this.constant.offset.value = 0;
    this.filter = audioContext.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1 / smoothingTime;
    this.filter.Q.value = 0;
    this.constant.connect(this.filter);
    this.constant.start();
  }

  get node() {
    return this.filter;
  }

  get value() {
    return this.constant.offset.value;
  }

  set value(value) {
    this.constant.offset.value = value;
  }
}

export default SmoothedConstant;
