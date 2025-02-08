import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'whale-icon',
  standalone: true,
  imports: [NgStyle],
  template: `
    <span class="icon" [ngStyle]="{ 'font-size': size }"
      >{{ icon }}
      @if (badge) {
        <span class="icon__badge">{{ badge }}</span>
      }
    </span>
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() icon!: string;
  @Input() size = '24px';
  @Input() badge?: string | number;
}
