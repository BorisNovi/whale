import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserAuth } from '../interfaces';
import { SocketService } from '.';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `http://localhost:3000`;

  private socketService = inject(SocketService);

  constructor(private httpClient: HttpClient) {
  }

  public logIn(username: string): Observable<IUserAuth> {
    return this.httpClient.post<IUserAuth>(`${this.baseUrl}/api/auth/login`, { username })
  }

  public logOut(username: string, token: string): Observable<{ success: boolean; message: string }> {
    this.socketService.disconnect();
    const body = { username, token };
    return this.httpClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/api/auth/logout`, body);
  }
}