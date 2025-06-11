import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Visitor } from '../models/visitor.model';

export interface Country {
  name: string;
}
@Injectable({ providedIn: 'root' })
export class VisitorService {
  private readonly apiUrl = 'http://192.168.142.61:8000/api/visitors/';
  private readonly apiUrlpais = 'http://192.168.142.61:8000/api/';
  constructor(private http: HttpClient) { }

  checkVisitorByCi(ci: string): Observable<Visitor[]> {
    if (!ci?.trim()) return of([]);
    const params = new HttpParams().set('ci_number', ci.trim());
    return this.http.get<Visitor[]>(this.apiUrl, { params }).pipe(catchError(this.handleError<Visitor[]>('checkVisitorByCi', [])));
  }

  registerNewVisitor(visitorData: Visitor): Observable<any> {
    return this.http.post(this.apiUrl, visitorData).pipe(catchError(this.handleError<any>('registerNewVisitor', null)));
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrlpais}countries/`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}

export type { Visitor };
