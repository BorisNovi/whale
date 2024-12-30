import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';



import { ESSidebarCommonAttrService } from '../sidebar-common-attr.service';
import { CommonModule } from '@angular/common';
import { ESSidebarDividerComponent } from '../public-api';
import { IconChevronLineW300Component } from 'app/shared/icon-components';
import { RippleDirective } from 'app/shared/directives';

@Component({
  selector: 'es-sidebar-toggle',
  templateUrl: './sidebar-toggle.component.html',
  styleUrls: ['./sidebar-toggle.component.scss'],
  imports: [CommonModule, ESSidebarDividerComponent, RippleDirective, IconChevronLineW300Component],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ESSidebarToggleComponent {
  @Input() labelOpen = '';
  @Input() labelClose = '';
  @Input()
  get isOpen(): boolean {
    return this._isOpen;
  }
  set isOpen(value: boolean | string | null) {
    this._isOpen = value === 'true' || value === true;
  }
  private _isOpen = false;

  @Output() openEvent = new EventEmitter<boolean>(false);

  constructor(
    public cas: ESSidebarCommonAttrService,

  ) {

  }

  public _onClick(): void {
    this.isOpen = !this.isOpen;
    this.openEvent.emit(this.isOpen);
  }
}
