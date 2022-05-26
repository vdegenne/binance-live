import { css, html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@material/mwc-dialog'
import '@material/mwc-icon-button'
import { Dialog } from '@material/mwc-dialog';
import { TextField } from '@material/mwc-textfield';

@customElement('pair-create-dialog')
export class PairCreateDialog extends LitElement {
  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-textfield') textfield!: TextField;

  static styles = css`
  p {
    margin: 3px 0;
    opacity: 0.6
  }
  `

  render() {
    return html`
    <mwc-dialog heading="Create new Pair" style="--mdc-dialog-min-width:calc(100vw - 32px);">

    <mwc-textfield
      dialogInitialFocus
      style="width:100%;--mdc-text-field-fill-color: #00ff142b;"
      @keyup=${()=>{this.requestUpdate()}}></mwc-textfield>

    <p>Write the pair in the textfield above</p>
    <p>Slash (/) separated. For example "BTC/USDT", "ETH/BTC", ...</p>
    <p>If you just write a symbol (e.g. "BTC") the <i>quote</i> defaults to "USDT".</p>

      <mwc-button outlined slot=secondaryAction dialogAction=close>close</mwc-button>
      <mwc-button unelevated slot=primaryAction
        ?disabled=${!this.textfield?.value}
        @click=${()=>{this.submit()}}>add</mwc-button>
    </mwc-dialog>
    `
  }

  submit() {
    window.app.addPair(this.textfield.value.trim())
    this.dialog.close()
    this.reset()
  }

  async show () {
    this.requestUpdate()
    await this.updateComplete
    this.dialog.show()
  }

  reset () {
    this.textfield.value = ''
  }
}