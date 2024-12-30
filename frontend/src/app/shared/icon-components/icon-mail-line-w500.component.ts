import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'whale-icon-mail-line-w500',
  standalone: true,
  template: `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 7.48837V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V7.48838C21.0001 7.49562 21.0001 7.50285 21 7.51009V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7.5101C2.99992 7.50286 2.99992 7.49561 3 7.48837ZM19 7L12 12.25L5 7H19ZM19 9.5V17H5L5 9.5L11.4 14.3C11.7556 14.5667 12.2444 14.5667 12.6 14.3L19 9.5Z" [attr.fill]="color"/>
  </svg>
  `
})
export class IconMailLineW500Component {
  @Input() size: string = '24px';
  @Input() color: string = 'currentColor';

  @HostBinding('style.width') get hostWidth() {
    return this.size;
  }

  @HostBinding('style.height') get hostHeight() {
    return this.size;
  }

  @HostBinding('style.color') get hostColor() {
    return this.color;
  }

  @HostBinding('style.display') hostDisplay = 'inline-block';
}
