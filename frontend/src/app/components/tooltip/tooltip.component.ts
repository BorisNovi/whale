import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  TemplateRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'whale-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip {{ position }} {{ customClass }}" [ngStyle]="styles">
      <ng-container *ngIf="isTemplate(content); else text">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </ng-container>
      <ng-template #text>{{ content }}</ng-template>
    </div>
  `,
  styles: [
    `
      .tooltip {
        position: fixed;
        background-color: var(--color-monoA-A800);
        color: var(--color-monoB-A900);
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        white-space: nowrap;
        pointer-events: auto;
      }
      .top {
        transform: translateX(-50%);
      }
      .bottom {
        transform: translateX(-50%);
      }
      .left {
        transform: translateY(-50%);
      }
      .right {
        transform: translateY(-50%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() content!: string | TemplateRef<any>;
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() customClass = '';
  @Output() mouseEnter = new EventEmitter<void>();
  @Output() mouseLeave = new EventEmitter<void>();
  styles: Record<string, string> = {};

  setHostElement(hostRect: DOMRect) {
    const tooltipRect = this.calculateTooltipPosition(hostRect);
    this.styles = {
      top: `${tooltipRect.top}px`,
      left: `${tooltipRect.left}px`,
    };
  }

  isTemplate(content: any): content is TemplateRef<any> {
    return content instanceof TemplateRef;
  }

  private calculateTooltipPosition(hostRect: DOMRect): {
    top: number;
    left: number;
  } {
    const tooltipOffset = 10; // Space between tooltip and host
    let top = 0;
    let left = 0;

    switch (this.position) {
      case 'top':
        top = hostRect.top - tooltipOffset;
        left = hostRect.left + hostRect.width / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + tooltipOffset;
        left = hostRect.left + hostRect.width / 2;
        break;
      case 'left':
        top = hostRect.top + hostRect.height / 2;
        left = hostRect.left - tooltipOffset;
        break;
      case 'right':
        top = hostRect.top + hostRect.height / 2;
        left = hostRect.right + tooltipOffset;
        break;
    }
    return { top, left };
  }

  @HostListener('mouseenter')
  onTooltipMouseEnter() {
    this.mouseEnter.emit();
  }

  @HostListener('mouseleave')
  onTooltipMouseLeave() {
    this.mouseLeave.emit();
  }
}
