import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="'glass-panel rounded-2xl p-6 transition-all duration-300 ' + (hoverGlow ? 'hover:border-neon-cyan/20 hover:shadow-glass-hover ' : '') + customClass"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class GlassCardComponent {
  @Input() hoverGlow: boolean = true;
  @Input() customClass: string = '';
}
