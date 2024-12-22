import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'es-sidebar-spacer',
  template: '',
  styles: [':host { flex-grow: 1; }'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ESSidebarSpacerComponent {}
