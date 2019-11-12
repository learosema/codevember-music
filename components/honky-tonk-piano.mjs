
function getNote(element) {
  if (element.nodeName === 'KEY') {
    const value = element.getAttribute('value');
    return value[0] + '#' + value[1];
  }
  if (element.nodeName === 'WHITE') {
    const value = element.parentNode.getAttribute('value');
    return value;
  }
}

export default class HonkyTonkPiano extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.initialized = false;
  }

  static register() {
    customElements.define("honky-tonk-piano", HonkyTonkPiano);
  }

  connectedCallback() {
    if (! this.initialized) {
      this.initialized = true;
      this.render();
      this.piano = this.shadowRoot.querySelector('piano');
      this.piano.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
      this.piano.addEventListener('mousedown', this.handleKeyPressed.bind(this));
      this.piano.addEventListener('mouseup', this.handleKeyReleased.bind(this));
      this.piano.addEventListener('touchstart', this.handleKeyPressed.bind(this));
      this.piano.addEventListener('touchend', this.handleKeyReleased.bind(this));
    }
  }

  emit(eventType, detail) {
    const event = new CustomEvent(eventType, {
      bubbles: true,
      detail
    });
    this.dispatchEvent(event);
  }

  handleKeyPressed(e) {
    e.preventDefault();
    this.emit('note_on', getNote(e.target));
  }

  handleKeyReleased(e) {
    e.preventDefault();
    this.emit('note_off', getNote(e.target));
  }

  disconnectedCallback() {
    this.shadowRoot.innerHTML = '';
    this.piano = null;
    this.initialized = false;
  }

  render() {
    console.log('render');
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/honky-tonk-piano.css">
      <piano>
        <key value="C1"><white></white></key>
        <key value="D1"><white></white></key>
        <key value="E1"><white></white></key>
        <key value="F1"><white></white></key>
        <key value="G1"><white></white></key>
        <key value="A1"><white></white></key>
        <key value="B1"><white></white></key>
        <key value="C2"><white></white></key>
        <key value="D2"><white></white></key>
        <key value="E2"><white></white></key>
        <key value="F2"><white></white></key>
        <key value="G2"><white></white></key>
        <key value="A2"><white></white></key>
        <key value="B2"><white></white></key>
        <key value="C3"><white></white></key>
      </piano>
    `
  }
}
