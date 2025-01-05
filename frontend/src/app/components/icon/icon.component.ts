import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'whale-icon',
  standalone: true,
  imports: [NgStyle],
  template: `
    <span class="icon" [ngStyle]="{ 'font-size': size }">{{ icon }}</span>
  `,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() icon!: string;
  @Input() size = '24px';
}
