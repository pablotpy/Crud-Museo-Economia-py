import { Component } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AttendanceRecord, PaginatedResponse } from '../../models/attendance-record.model';
import { AttendanceRecordService } from '../attendance-record.service';
import { AttendanceFormComponent } from '../attendance-form/attendance-form.component';
import { AttendanceListComponent } from '../attendance-list/attendance-list.component';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [
    CommonModule,
    AttendanceFormComponent,
    AttendanceListComponent
  ],
  templateUrl: './attendance-page.component.html',
  styleUrls: ['./attendance-page.component.scss']
})
export class AttendancePageComponent {
  paginatedData$: Observable<PaginatedResponse<AttendanceRecord>>;
  private pageChanges$ = new BehaviorSubject<number>(1);

  recordToEdit: AttendanceRecord | null = null;
  showForm = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private attendanceRecordService: AttendanceRecordService) {
    this.paginatedData$ = this.pageChanges$.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
      }),
      switchMap(page => this.attendanceRecordService.getAttendanceRecords(page)),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error al cargar registros:', err);
        this.errorMessage = 'No se pudieron cargar los registros.';
        this.isLoading = false;
        // El uso de 'of' aquí ahora es correcto porque está bien importado
        return of({ count: 0, next: null, previous: null, results: [] });
      })
    );
  }

  loadRecords(): void {
    this.pageChanges$.next(1);
  }

  onPageChange(page: number): void {
    this.pageChanges$.next(page);
  }

  handleFormSubmitted(): void {
    alert('Operación realizada con éxito.');
    this.showForm = false;
    this.recordToEdit = null;
    this.loadRecords();
  }

  handleEditRecord(record: AttendanceRecord): void {
    this.recordToEdit = { ...record };
    this.showForm = true;
  }

  handleDeleteRecord(id: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.attendanceRecordService.deleteAttendance(id).subscribe({
      next: () => {
        alert('Registro eliminado con éxito.');
        this.pageChanges$.next(this.pageChanges$.value);
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.errorMessage = 'Ocurrió un error al eliminar el registro.';
        this.isLoading = false;
      }
    });
  }

  openNewRecordForm(): void {
    this.recordToEdit = null;
    this.showForm = true;
  }

  handleCancelForm(): void {
    this.showForm = false;
    this.recordToEdit = null;
  }
}