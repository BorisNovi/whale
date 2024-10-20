import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IToken, IUserAuth } from '../interfaces';
import { SocketService } from '.';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `http://localhost:3000`;

  private socketService = inject(SocketService);
  private store = inject(Store);
  private userS = this.store.selectSignal(selectUser);

  constructor(private httpClient: HttpClient) {
  }

  public logIn(username: string): Observable<IUserAuth> {
    return this.httpClient.post<IUserAuth>(`${this.baseUrl}/api/auth/login`, { username })
  }

  // TODO: Сделать через интерцептор
  public logOut(): Observable<{ success: boolean; message: string }> {
    const userData = this.userS();
    this.socketService.disconnect();

    const body = { username: userData?.username };

    return this.httpClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/api/auth/logout`, body);
  }

  public getToken(): IToken | undefined {
    return this.userS()?.token;
  }

  public refreshToken(): Observable<IToken> {
    const userData = this.userS();
    const body = { refreshToken: userData?.token.refreshToken };

    return this.httpClient.post<IToken>(`${this.baseUrl}/api/auth/refreshToken`, body);
  }
}