import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.page';
import { NotFoundPageComponent } from './pages/not-found/not-found.page';
import { ShellComponent } from './components/shell/shell.component';
import { authenticatedGuard, loginGuard } from './shared';

export const routes: Routes = [
  {
    path: '', component: ShellComponent, children: [
      { path: '', canActivate: [loginGuard], pathMatch: 'full', component: LoginPageComponent },
      { path: 'group-chat', canActivate: [authenticatedGuard], loadComponent: () => import('./pages/group-chat/group-chat.component').then((c) => c.GroupChatComponent)},
      { path: 'chat/:id', canActivate: [authenticatedGuard], loadComponent: () => import('./pages/private-chat/private-chat.page').then((c) => c.PrivateChatPage)},

      { path: '**', component: NotFoundPageComponent }
    ]
  }
];
