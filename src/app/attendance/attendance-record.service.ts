import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AttendanceRecord, CreateAttendancePayload } from '../models/attendance-record.model';

@Injectable({ providedIn: 'root' })
export class AttendanceRecordService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/attendancerecords/';
  constructor(private http: HttpClient) { }
  
  getAttendanceRecords(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(this.apiUrl).pipe(catchError(this.handleError<AttendanceRecord[]>('getAttendanceRecords', [])));
  }

  registerAttendanceForExistingVisitor(attendanceData: CreateAttendancePayload): Observable<AttendanceRecord | null> {
    return this.http.post<AttendanceRecord>(this.apiUrl, attendanceData).pipe(catchError(this.handleError<AttendanceRecord | null>('registerAttendanceForExistingVisitor', null)));
  }

  updateAttendance(id: number, record: Partial<AttendanceRecord>): Observable<AttendanceRecord | null> {
    return this.http.patch<AttendanceRecord>(`${this.apiUrl}${id}/`, record).pipe(catchError(this.handleError<AttendanceRecord | null>('updateAttendance', null)));
  }

  deleteAttendance(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(catchError(this.handleError<any>('deleteAttendance', null)));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}

export type { AttendanceRecord };
  export type { CreateAttendancePayload };

