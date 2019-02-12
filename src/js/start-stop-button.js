import $ from 'jquery';

// Start/Stop button
// -----------------
class StartStopButton {
  constructor(selector, application) {
    this.$element = $(selector);
    this.$element.on('click', () => this.click());
    this.application = application;
    this.running = false;
  }

  click() {
    this.running = !this.running;
    this.$element.removeClass('btn-secondary btn-danger')
                 .addClass(this.running ? 'btn-danger' : 'btn-secondary')
                 .text(this.running ? 'Stop' : 'Start');
    this.application.running = this.running;
  }
}

export default StartStopButton;
