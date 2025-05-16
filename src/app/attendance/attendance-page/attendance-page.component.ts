import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Para 'async' pipe y *ngIf
import { AttendanceRecord } from '../../models/attendance-record.model';
import { AttendanceService } from '../attendance.service';
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
export class AttendancePageComponent implements OnInit {
  attendanceRecords$: Observable<AttendanceRecord[]>;
  recordToEdit: AttendanceRecord | null = null;
  showForm = false;
  isLoading = false; // Para feedback general en la página
  errorMessage: string | null = null;

  private refreshList$ = new Subject<void>();
  isEditMode: boolean | undefined;

  constructor(private attendanceService: AttendanceService) {
    this.attendanceRecords$ = this.refreshList$.pipe(
      startWith(null), // Carga inicial
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
      }),
      switchMap(() => this.attendanceService.getAttendances()),
      tap(() => this.isLoading = false),
      catchError(err => {
        console.error('Error al cargar registros:', err);
        this.errorMessage = 'No se pudieron cargar los registros. Intente nuevamente.';
        this.isLoading = false;
        return []; // Devuelve un array vacío en caso de error para que el pipe async no falle
      })
    );
  }

  ngOnInit(): void {}

  loadRecords(): void {
    this.refreshList$.next();
  }

  handleFormSubmitted(record: AttendanceRecord): void {
    this.isLoading = true;
    this.errorMessage = null;
    const operation = record.id && this.isEditMode // Asegúrate de que isEditMode refleje la intención
      ? this.attendanceService.updateAttendance(record.id, record)
      : this.attendanceService.addAttendance(record);

    operation.subscribe({
      next: (response) => {
        if (response) {
           console.log(this.isEditMode ? 'Registro actualizado' : 'Registro agregado');
           // Aquí podrías usar un toast de Bootstrap para notificar éxito
        } else {
            console.error(this.isEditMode ? 'Error al actualizar' : 'Error al agregar');
            this.errorMessage = this.isEditMode ? 'Error al actualizar el registro.' : 'Error al agregar el registro.';
        }
        this.loadRecords(); // Refresca la lista
        this.showForm = false;
        this.recordToEdit = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en la operación:', err);
        this.errorMessage = 'Ocurrió un error al guardar los datos.';
        this.isLoading = false;
      }
    });
  }

  handleEditRecord(record: AttendanceRecord): void {
    this.recordToEdit = { ...record };
    this.isEditMode = true; // Establecer modo edición
    this.showForm = true;
    this.errorMessage = null;
  }

  handleDeleteRecord(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.attendanceService.deleteAttendance(id).subscribe({
      next: (response) => {
        if (response !== null ) { // Asumiendo que el servicio devuelve algo o no devuelve null en error
            console.log('Registro eliminado');
        } else {
            console.error('Error al eliminar');
            this.errorMessage = 'Error al eliminar el registro.';
        }
        this.loadRecords();
        this.isLoading = false;
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
    this.isEditMode = false; // Asegurar que no esté en modo edición
    this.showForm = true;
    this.errorMessage = null;
  }

  handleCancelForm(): void {
    this.showForm = false;
    this.recordToEdit = null;
    this.isEditMode = false;
    this.errorMessage = null;
  }
}