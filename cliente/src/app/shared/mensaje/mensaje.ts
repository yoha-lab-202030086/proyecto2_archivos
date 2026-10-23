import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mensaje',
  standalone: true,
  template: `
    @if (texto) {
      <p class="mensaje" role="status">{{ texto }}</p>
    }
  `,
  styles: [`
    .mensaje {
      padding: 10px;
      border-radius: 6px;
      background: #eaf2f8;
      color: #17365d;
      overflow-wrap: anywhere;
    }
  `]
})
export class Mensaje {
  @Input() texto = '';
}