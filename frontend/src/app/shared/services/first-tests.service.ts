import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirstTestsService {

  constructor(private httpClient: HttpClient) {
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
