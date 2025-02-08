import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { INotificationLine, NotificationService } from 'app/shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, timer } from 'rxjs';

@Component({
  selector: 'whale-notification-line',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-line.component.html',
  styleUrl: './notification-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('show', [
      state(
        'open',
        style({
          height: '32px',
          opacity: 1,
        }),
      ),
      state(
        'closed',
        style({
          height: 0,
          opacity: 0.6,
        }),
      ),
      transition('open <=> closed', [animate('0.2s ease-in-out')]),
    ]),
  ],
})
export class NotificationLineComponent implements OnInit {
  public text?: string;
  public type?: 'info' | 'success' | 'error' = 'info';

  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);

  public isShown = false;

  ngOnInit(): void {
    this.notificationService.notification$
      .pipe(
        filter((data) => !!data),
        switchMap((data: INotificationLine) => {
          this.text = data.text;
          this.type = data.type;
          this.isShown = true;
          this.cdr.detectChanges();

          return timer(data.closeTimeout).pipe(
            switchMap(() => {
              this.isShown = false;
              this.cdr.detectChanges();
              return [];
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
