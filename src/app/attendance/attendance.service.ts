import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AttendanceRecord } from '../models/attendance-record.model'; // Ajusta la ruta si es necesario
import { Visitor } from '../models/visitor.model'; // Ajusta la ruta si es necesario

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3000/api'; // Asegúrate que esta URL sea correcta

  constructor(private http: HttpClient) { }

  getAttendances(filters?: any): Observable<AttendanceRecord[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.append(key, filters[key]);
        }
      });
    }
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/attendance`, { params })
      .pipe(catchError(this.handleError<AttendanceRecord[]>('getAttendances', [])));
  }

  getVisitorByCI(ci: string): Observable<Visitor | null> {
    if (!ci || ci.trim() === '') {
        return of(null);
    }
    return this.http.get<Visitor>(`${this.apiUrl}/visitors/by-ci/${ci.trim()}`)
      .pipe(
        tap(visitor => console.log('Visitor found:', visitor)),
        catchError(error => {
          if (error.status === 404) {
            console.log(`Visitor with CI ${ci} not found.`);
            return of(null);
          }
          return this.handleError<Visitor | null>(`getVisitorByCI ci=${ci}`, null)(error);
        })
      );
  }

  getCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/countries`).pipe(
      map(countries => {
        // Asegurarse que "Paraguay" esté en la lista y ordenarla
        const countrySet = new Set(countries);
        countrySet.add('Paraguay'); // Garantiza que Paraguay sea una opción
        return Array.from(countrySet).sort();
      }),
      catchError(this.handleError<string[]>('getCountries', ['Paraguay'])) // Fallback con Paraguay
    );
  }

  addAttendance(record: AttendanceRecord): Observable<AttendanceRecord | null> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/attendance`, record)
      .pipe(catchError(this.handleError<AttendanceRecord | null>('addAttendance', null)));
  }

  updateAttendance(id: number, record: Partial<AttendanceRecord>): Observable<AttendanceRecord | null> {
    return this.http.put<AttendanceRecord>(`${this.apiUrl}/attendance/${id}`, record)
      .pipe(catchError(this.handleError<AttendanceRecord | null>('updateAttendance', null)));
  }

  deleteAttendance(id: number): Observable<any | null> {
    return this.http.delete(`${this.apiUrl}/attendance/${id}`)
      .pipe(catchError(this.handleError<any | null>('deleteAttendance', null)));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      // Aquí podrías tener un servicio de logging o mostrar un mensaje al usuario con un Toast de Bootstrap
      return of(result as T);
    };
  }
}