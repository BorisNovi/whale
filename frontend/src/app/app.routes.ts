import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login.page';

export const routes: Routes = [
  { path: '', component: LoginPageComponent },
  { path: 'chat/:id', loadComponent: () => import('./pages/chat-room/chat-room.page').then((c) => c.ChatRoomPage)}
];


// src/
// ├── app/
// │   ├── components/
// │   │   ├── chat/
// │   │   │   ├── chat.component.ts
// │   │   │   ├── chat.component.html
// │   │   │   ├── chat.component.scss
// │   │   │   └── chat.component.spec.ts
// │   │   ├── chat-message/
// │   │   │   ├── chat-message.component.ts
// │   │   │   ├── chat-message.component.html
// │   │   │   ├── chat-message.component.scss
// │   │   │   └── chat-message.component.spec.ts
// │   │   ├── chat-input/
// │   │   │   ├── chat-input.component.ts
// │   │   │   ├── chat-input.component.html
// │   │   │   ├── chat-input.component.scss
// │   │   │   └── chat-input.component.spec.ts
// │   │   └── user-list/
// │   │       ├── user-list.component.ts
// │   │       ├── user-list.component.html
// │   │       ├── user-list.component.scss
// │   │       └── user-list.component.spec.ts
// │   ├── pages/
// │   │   ├── chat-room/
// │   │   │   ├── chat-room.page.ts
// │   │   │   ├── chat-room.page.html
// │   │   │   ├── chat-room.page.scss
// │   │   │   └── chat-room.page.spec.ts
// │   │   ├── login/
// │   │   │   ├── login.page.ts
// │   │   │   ├── login.page.html
// │   │   │   ├── login.page.scss
// │   │   │   └── login.page.spec.ts
// │   │   └── register/
// │   │       ├── register.page.ts
// │   │       ├── register.page.html
// │   │       ├── register.page.scss
// │   │       └── register.page.spec.ts
// │   ├── services/
// │   │   ├── chat.service.ts
// │   │   ├── user.service.ts
// │   │   └── auth.service.ts
// │   ├── pipes/
// │   │   ├── short-names.pipe.ts
// │   │   └── date-format.pipe.ts
// │   ├── directives/
// │   │   └── auto-focus.directive.ts
// │   ├── state/
// │   │   ├── chat/
// │   │   │   ├── chat.actions.ts
// │   │   │   ├── chat.reducer.ts
// │   │   │   ├── chat.effects.ts
// │   │   │   └── chat.selectors.ts
// │   │   └── user/
// │   │       ├── user.actions.ts
// │   │       ├── user.reducer.ts
// │   │       ├── user.effects.ts
// │   │       └── user.selectors.ts
// │   └── app.config.ts
// ├── assets/
// │   └── images/
// ├── environments/
// │   ├── environment.ts
// │   └── environment.prod.ts
// └── main.ts
