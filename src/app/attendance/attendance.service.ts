import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AttendanceRecord } from '../models/attendance-record.model';
import { Visitor } from '../models/visitor.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = 'http://192.168.142.61:8000/api';

  constructor(private http: HttpClient) { }

  /**
   * Busca un visitante por su número de CI usando parámetros de consulta.
   */
  checkVisitorByCi(ci: string): Observable<Visitor[]> {
    if (!ci?.trim()) {
      return of([]);
    }
    const params = new HttpParams().set('ci_number', ci.trim());
    return this.http.get<Visitor[]>(`${this.apiUrl}/visitors/`, { params })
      .pipe(catchError(this.handleError<Visitor[]>('checkVisitorByCi', [])));
  }

  /**
   * Registra un NUEVO visitante. El backend también crea la primera asistencia.
   */
  registerNewVisitor(visitorData: Visitor): Observable<any> {
    return this.http.post(`${this.apiUrl}/visitors/`, visitorData)
      .pipe(catchError(this.handleError<any>('registerNewVisitor', null)));
  }

  /**
   * Registra una NUEVA asistencia para un visitante EXISTENTE.
   */
  registerAttendanceForExistingVisitor(attendanceData: AttendanceRecord): Observable<AttendanceRecord | null> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/attendancerecords/`, attendanceData)
      .pipe(catchError(this.handleError<AttendanceRecord | null>('registerAttendanceForExistingVisitor', null)));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}