import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

// Asegúrate de importar todos los modelos y servicios necesarios
import { VisitorService, Visitor } from '../visitor.service';
import { AttendanceRecordService, CreateAttendancePayload } from '../attendance-record.service';
import { RestrictInputDirective } from '../../directives/restrict-input.directive';

@Component({
  selector: 'app-attendance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RestrictInputDirective
  ],
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss']
})
export class AttendanceFormComponent implements OnInit {
  @Input() recordToEdit: any | null = null; // Usamos 'any' por ahora para simplificar la lógica de edición
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  attendanceForm: FormGroup;
  foundVisitor: Visitor | null = null;
  isLoadingVisitor = false;
  isEditMode = false;

  private namePattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;

  constructor(
    private fb: FormBuilder,
    private visitorService: VisitorService,
    private attendanceRecordService: AttendanceRecordService
  ) {
    this.attendanceForm = this.fb.group({
      ci_number: ['', Validators.required],
      first_name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      last_name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      country: ['Paraguay', Validators.required],
      visit_type: ['General', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.recordToEdit) {
      this.isEditMode = true;
      this.attendanceForm.patchValue(this.recordToEdit);
      // Aquí podrías agregar lógica para deshabilitar campos en modo edición si es necesario
      this.attendanceForm.get('ci_number')?.disable();
      this.attendanceForm.get('first_name')?.disable();
      this.attendanceForm.get('last_name')?.disable();
      this.attendanceForm.get('country')?.disable();
    } else {
      this.onCiNumberChanges();
    }
  }

  onCiNumberChanges(): void {
    this.attendanceForm.get('ci_number')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingVisitor = true;
        this.foundVisitor = null;
        this.attendanceForm.patchValue({ first_name: '', last_name: '' });
        this.disableVisitorFields(false);
      }),
      switchMap(ci => {
        if (!ci || ci.length < 3) return of([]);
        return this.visitorService.checkVisitorByCi(ci);
      })
    ).subscribe(visitors => {
      this.isLoadingVisitor = false;
      if (visitors && visitors.length > 0) {
        this.foundVisitor = visitors[0];
        this.attendanceForm.patchValue({
          first_name: this.foundVisitor.first_name,
          last_name: this.foundVisitor.last_name,
          country: this.foundVisitor.country || 'Paraguay'
        });
        this.disableVisitorFields(true);
      }
    });
  }

  disableVisitorFields(disable: boolean): void {
    const fields = ['first_name', 'last_name', 'country'];
    fields.forEach(field => {
      const control = this.attendanceForm.get(field);
      disable ? control?.disable() : control?.enable();
    });
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.onSubmitUpdate();
    } else if (this.foundVisitor) {
      this.onSubmitExistingVisitor();
    } else {
      this.onSubmitNewVisitor();
    }
  }
  
  // -- ESTE MÉTODO AHORA ESTÁ COMPLETO --
  onSubmitNewVisitor(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.attendanceForm.getRawValue();
    // La variable se declara y asigna aquí
    const newVisitorPayload: Visitor = {
      ci_number: formValue.ci_number,
      first_name: formValue.first_name.toUpperCase(),
      last_name: formValue.last_name.toUpperCase(),
      country: formValue.country,
      visit_type: formValue.visit_type,
      notes: formValue.notes
    };

    this.isLoadingVisitor = true;
    this.visitorService.registerNewVisitor(newVisitorPayload).subscribe({
      next: () => {
        this.formSubmitted.emit();
        this.resetForm();
      },
      error: (err) => {
        alert('Error al registrar el nuevo visitante.');
        this.isLoadingVisitor = false;
        console.error(err);
      }
    });
  }

  // -- ESTE MÉTODO AHORA ESTÁ COMPLETO --
  onSubmitExistingVisitor(): void {
    if (!this.foundVisitor?.id) return;
    
    const formValue = this.attendanceForm.getRawValue();
    // La variable se declara y asigna aquí
    const newAttendancePayload: CreateAttendancePayload = {
      visitor: this.foundVisitor.id,
      visit_type: formValue.visit_type,
      notes: formValue.notes,
    };
    
    this.isLoadingVisitor = true;
    this.attendanceRecordService.registerAttendanceForExistingVisitor(newAttendancePayload).subscribe({
      next: () => {
        this.formSubmitted.emit();
        this.resetForm();
      },
      error: (err) => {
        alert('Error al registrar la asistencia.');
        this.isLoadingVisitor = false;
        console.error(err);
      }
    });
  }

  // -- ESTE MÉTODO AHORA ESTÁ COMPLETO --
  onSubmitUpdate(): void {
    if (this.attendanceForm.invalid || !this.recordToEdit?.id) return;

    const formValue = this.attendanceForm.getRawValue();
    const updatePayload: Partial<any> = { // Usamos Partial<any> para flexibilidad
      visit_type: formValue.visit_type,
      notes: formValue.notes
    };

    this.isLoadingVisitor = true;
    this.attendanceRecordService.updateAttendance(this.recordToEdit.id, updatePayload).subscribe({
        next: () => {
            this.formSubmitted.emit();
            this.resetForm();
        },
        error: (err) => {
            alert('Error al actualizar el registro.');
            this.isLoadingVisitor = false;
            console.error(err);
        }
    });
  }
  
  resetForm(): void {
    this.attendanceForm.reset({
      ci_number: '',
      first_name: '',
      last_name: '',
      country: 'Paraguay',
      visit_type: 'General',
      notes: ''
    });
    this.foundVisitor = null;
    this.isLoadingVisitor = false;
    this.isEditMode = false;
    this.recordToEdit = null;
    this.disableVisitorFields(false);
    this.attendanceForm.get('ci_number')?.enable(); // Asegurarse de re-habilitar en reset
  }

  onCancelClick(): void {
    this.resetForm();
    this.cancel.emit();
  }
}