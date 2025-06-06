import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AttendanceRecord } from '../../models/attendance-record.model';
import { AttendanceRecordService } from '../attendance-record.service'; // Usamos el servicio correcto
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
  attendanceRecords$: Observable<AttendanceRecord[]>;
  recordToEdit: AttendanceRecord | null = null;
  showForm = false;
  isLoading = false;
  errorMessage: string | null = null;

  private refreshList$ = new Subject<void>();

  constructor(private attendanceRecordService: AttendanceRecordService) { // Inyectamos el servicio correcto
    this.attendanceRecords$ = this.refreshList$.pipe(
      startWith(null),
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
      }),
      // Llamamos al método correcto del servicio correcto
      switchMap(() => this.attendanceRecordService.getAttendanceRecords()),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error al cargar registros:', err);
        this.errorMessage = 'No se pudieron cargar los registros.';
        this.isLoading = false;
        return [];
      })
    );
  }

  loadRecords(): void {
    this.refreshList$.next();
  }

  /**
   * El formulario ahora maneja su propio envío.
   * Este método solo se llama cuando el formulario termina exitosamente.
   */
  handleFormSubmitted(): void {
    alert('Operación realizada con éxito.'); // O una notificación toast
    this.showForm = false;
    this.recordToEdit = null;
    this.loadRecords(); // Refresca la lista
  }

  handleEditRecord(record: AttendanceRecord): void {
    this.recordToEdit = { ...record };
    this.showForm = true;
  }

  handleDeleteRecord(id: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    
    this.isLoading = true;
    this.attendanceRecordService.deleteAttendance(id).subscribe({
      next: () => {
        alert('Registro eliminado con éxito.');
        this.loadRecords();
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