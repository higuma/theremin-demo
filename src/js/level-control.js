import $ from 'jquery';

// Level control switch
// --------------------
class LevelControl {
  constructor(check, label, application) {
    this.$check = $(check);
    this.$label = $(label);
    this.$check.on('change', () => this.change());
    this.application = application;
    this.bottomToTop = false;
  }

  change() {
    this.bottomToTop = this.$check.prop("checked");
    this.$label.text(this.bottomToTop ? "Bottom to top (↑)" : "Top to bottom (↓)");
    this.application.bottomToTop = this.bottomToTop;
  }
}

export default LevelControl;
