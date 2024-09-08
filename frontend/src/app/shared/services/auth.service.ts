import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserAuth } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `http://localhost:3000`;
  
  constructor(private httpClient: HttpClient) {
  }

  public logIn(username: string): Observable<IUserAuth> {
    return this.httpClient.post<IUserAuth>(`${this.baseUrl}/api/auth/login`, {username})
  }

  public getTest(info: { id: number, key: string }): Observable<any> {
    const { id, key } = info;

    let params = new HttpParams({
      fromObject: {
        ...(id && { id }),
        ...(key && { key }),
      }
    });

    // if (someArr?.length) {
    //   params = params.set('someArrParams', someArr.toString());
    // }

    // if (users?.length) {
    //   params = params.set('usersIds', users.map(item => item.id).toString());
    // }

    // return this.httpClient.get<any>(`${process.env.API_URL}/api/chats${id}`, { params });
    return this.httpClient.get<any>(`http://localhost:3000/api/chats`, { params });
  }
}