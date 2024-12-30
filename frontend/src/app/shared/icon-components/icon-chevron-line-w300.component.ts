import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'whale-icon-chevron-line-w300',
  standalone: true,
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.29289 11.2929L13.2929 6.29291L14.7071 7.70712L10.4142 12L14.7071 16.2929L13.2929 17.7071L8.29289 12.7071L7.58578 12L8.29289 11.2929Z" [attr.fill]="color"/>
    </svg>
  `
})
export class IconChevronLineW300Component {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';
  @Input() orientation: 'up' | 'down' | 'left' | 'right' = 'left';

  @HostBinding('style.width') get hostWidth() {
    return this.size;
  }

  @HostBinding('style.height') get hostHeight() {
    return this.size;
  }

  @HostBinding('style.color') get hostColor() {
    return this.color;
  }

  @HostBinding('style.transform') get hostTransform() {
    switch (this.orientation) {
      case 'up':
        return 'rotate(90deg)';
      case 'down':
        return 'rotate(-90deg)';
      case 'right':
        return 'rotate(180deg)';
      case 'left':
      default:
        return 'rotate(0deg)';
    }
  }

  @HostBinding('style.display') hostDisplay = 'inline-block';
}
