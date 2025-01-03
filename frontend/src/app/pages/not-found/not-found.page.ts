import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'whale-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
})
export class NotFoundPageComponent {}
