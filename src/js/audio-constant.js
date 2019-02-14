// Audio rate constant node
// ------------------------

// Audio constant for new API (>= 20180619)
// https://www.w3.org/TR/2018/WD-webaudio-20180619/
class AudioConstant2018 {
  constructor(ctx) {
    // Use ConstanceSourceNode
    this.constant = ctx.createConstantSource();
    this.value = 0;             // call setter method
    this.constant.start();
  }

  get value() {
    return this.constant.offset.value;
  }

  set value(val) {
    this.constant.offset.value = val;
  }

  connect(node) {
    this.constant.connect(node);
  }
}

// Audio constant for old API (<= 20151208)
// https://www.w3.org/TR/2015/WD-webaudio-20151208/
class AudioConstant2015 {
  constructor(ctx) {
    // ConstantSourceNode is not available
    // Use AudioBuffer and AudioBufferSource
    this.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    this.source = ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.loopStart = 0;
    this.source.loopEnd = 0;    // i.e. loops whole buffer endlessly
    this.value = 0;             // call setter method
    this.source.start();
  }

  get value() {
    return this.buffer.getChannelData(0)[0];
  }

  set value(val) {
    this.buffer.getChannelData(0)[0] = val;
  }

  connect(node) {
    this.source.connect(node);
  }
}

// public
class AudioConstant {
  constructor(ctx) {
    // check if ConstantSourceNode is available
    if (ctx.createConstantSource) {
      this.output = new AudioConstant2018(ctx);
    } else {
      this.output = new AudioConstant2015(ctx);
    }
  }

  get value() {
    return this.output.value;
  }

  set value(val) {
    this.output.value = val;
  }

  connect(node) {
    this.output.connect(node);
  }
}

export default AudioConstant;
