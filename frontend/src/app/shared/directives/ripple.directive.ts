import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: 'button, [whaleRipple]',
  standalone: true
})
export class RippleDirective {
  @Input('whaleRippleColor') color: string = 'rgba(0, 0, 0, 0.2)';

  private _disabled = false;

  @Input('whaleRippleDisabled') 
  set whaleRippleDisabled(value: any) {
    this._disabled = value === '' || value === true || value === 'true';
  }
  
  get whaleRippleDisabled() {
    return this._disabled;
  }

  private _isOpen = false;
  private animationDuration = 800; // ms

  constructor(private el: ElementRef, private renderer: Renderer2) {
    const style = window.getComputedStyle(this.el.nativeElement);
    if (style.position === 'static' || !style.position) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    }
    this.renderer.setStyle(this.el.nativeElement, 'overflow', 'hidden');
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this._disabled) return;

    const element = this.el.nativeElement;

    const ripple = this.renderer.createElement('span');
    this.renderer.appendChild(element, ripple);

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const offsetX = event.clientX - rect.left - size / 2;
    const offsetY = event.clientY - rect.top - size / 2;

    // Ripple styles
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${offsetX}px`);
    this.renderer.setStyle(ripple, 'top', `${offsetY}px`);
    this.renderer.setStyle(ripple, 'background', `${this.color}`);
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', `ripple-effect ${this.animationDuration}ms ease-out`);
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    this.renderer.setStyle(ripple, 'z-index', '1');

    setTimeout(() => {
      this.renderer.removeChild(element, ripple);
    }, this.animationDuration);
  }

  private addKeyframes(): void {
    const styleSheet = this.renderer.createElement('style');
    this.renderer.appendChild(document.head, styleSheet);

    const keyframes = `
      @keyframes ripple-effect {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;

    styleSheet.type = 'text/css';
    styleSheet.innerHTML = keyframes;
  }

  public ngOnInit(): void {
    this.addKeyframes();
  }
}
