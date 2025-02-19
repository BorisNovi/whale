import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostBinding,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, merge } from 'rxjs';

import { CommonModule } from '@angular/common';
import { resizeObserver } from 'app/shared';

@Component({
  selector: 'es-sidebar-scrollable',
  templateUrl: './sidebar-scrollable.component.html',
  styleUrls: ['./sidebar-scrollable.component.scss'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ESSidebarScrollableComponent implements AfterViewInit {
  @ViewChild('scrollableContainer', { static: true })
  scrollableContainer!: ElementRef<HTMLDivElement>;
  @HostBinding('class.es-sidebar-scrollable') class = true;

  public isScrollable = false;
  public isBeforeScroll = false;
  public isAfterScroll = true;

  constructor(
    private cd: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  public ngAfterViewInit(): void {
    merge(
      resizeObserver(this.scrollableContainer.nativeElement, {
        observe: 'width',
      }),
      resizeObserver(this.scrollableContainer.nativeElement, {
        observe: 'height',
      }),
    )
      .pipe(debounceTime(25), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateScrollableState();
      });

    this.updateScrollableState();
  }

  public updateScrollableState(): void {
    const container = this.scrollableContainer.nativeElement;
    this.isScrollable = container.scrollHeight > container.clientHeight;
    this.onScroll(); // Initialize the scroll state
    this.cd.detectChanges();
  }

  public onScroll(): void {
    const container = this.scrollableContainer.nativeElement;
    this.isBeforeScroll = container.scrollTop > 0;
    this.isAfterScroll = !(
      container.scrollTop >=
      container.scrollHeight - container.clientHeight
    );
    this.cd.detectChanges();
  }
}
