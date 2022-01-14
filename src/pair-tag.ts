import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { pairTagStyles } from './styles/pair-tag-styles';

@customElement('pair-tag')
export class PairTag extends LitElement {
  @state()
  public pair?: string;

  static styles = [ pairTagStyles ]

  render () {
    if (this.pair === undefined) return nothing;

    return html`${this.pair}`
  }
}