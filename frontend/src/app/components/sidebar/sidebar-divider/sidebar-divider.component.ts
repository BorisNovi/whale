import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

import { ESSidebarCommonAttrService } from '../sidebar-common-attr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'es-sidebar-divider',
  templateUrl: './sidebar-divider.component.html',
  styleUrls: ['./sidebar-divider.component.scss'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ESSidebarDividerComponent {
  constructor(public cas: ESSidebarCommonAttrService) {}
}
