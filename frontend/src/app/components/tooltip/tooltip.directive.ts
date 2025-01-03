import {
  Directive,
  ElementRef,
  Input,
  TemplateRef,
  ViewContainerRef,
  ComponentRef,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[whaleTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('whaleTooltip') tooltipContent!: string | TemplateRef<any>;
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipClass = '';

  private tooltipRef: ComponentRef<TooltipComponent> | null = null;
  private closeTimeout: any;

  private _tooltipDisabled = false;

  @Input()
  set tooltipDisabled(value: any) {
    this._tooltipDisabled = value === 'true' || value === true;
  }

  get tooltipDisabled() {
    return this._tooltipDisabled;
  }

  private _tooltipInteractive = false;

  @Input()
  set tooltipInteractive(value: any) {
    this._tooltipInteractive = value === 'true' || value === true;
  }

  get tooltipInteractive() {
    return this._tooltipInteractive;
  }

  constructor(
    private el: ElementRef,
    private viewContainerRef: ViewContainerRef,
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.scheduleTooltipClose();
  }

  @HostListener('focus')
  onFocus() {
    this.showTooltip();
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    // Delay to allow focus to move to a child element
    setTimeout(() => {
      if (!this.isFocusInsideTooltip()) {
        this.scheduleTooltipClose();
      }
    });
  }

  private showTooltip() {
    if (this.tooltipDisabled || !this.tooltipContent) {
      return;
    }

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (!this.tooltipRef) {
      this.tooltipRef = this.viewContainerRef.createComponent(TooltipComponent);
      this.tooltipRef.instance.content = this.tooltipContent;
      this.tooltipRef.instance.position = this.tooltipPosition;
      this.tooltipRef.instance.customClass = this.tooltipClass;

      const hostRect = this.el.nativeElement.getBoundingClientRect();
      this.tooltipRef.instance.setHostElement(hostRect);

      if (this.tooltipInteractive) {
        this.tooltipRef.instance.mouseEnter.subscribe(() => {
          if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
          }
        });

        this.tooltipRef.instance.mouseLeave.subscribe(() => {
          this.scheduleTooltipClose();
        });
      }
    }
  }

  private scheduleTooltipClose() {
    if (!this.tooltipRef) return;

    this.closeTimeout = setTimeout(() => {
      this.closeTooltipImmediately();
    }, 200);
  }

  private closeTooltipImmediately() {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = null;
    }
  }

  private isFocusInsideTooltip(): boolean {
    const activeElement = document.activeElement as HTMLElement;
    const tooltipElement = this.tooltipRef?.location
      .nativeElement as HTMLElement;
    return (
      this.el.nativeElement.contains(activeElement) ||
      tooltipElement?.contains(activeElement)
    );
  }

  ngOnDestroy() {
    this.closeTooltipImmediately();
  }
}
