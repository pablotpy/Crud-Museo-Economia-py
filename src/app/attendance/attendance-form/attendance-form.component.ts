import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { VisitorService, Visitor } from '../visitor.service';
import { AttendanceRecordService, CreateAttendancePayload } from '../attendance-record.service';
import { RestrictInputDirective } from '../../directives/restrict-input.directive';
import { NgxSelectModule } from 'ngx-select-ex';

@Component({
  selector: 'app-attendance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RestrictInputDirective,
    NgxSelectModule
  ],
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss']
})
export class AttendanceFormComponent implements OnInit {
  @Input() recordToEdit: any | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  attendanceForm: FormGroup;
  foundVisitor: Visitor | null = null;
  isLoadingVisitor = false;
  isEditMode = false;
  countries: string[] = []; // Propiedad para almacenar la lista de países

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
      country: ['PARAGUAY', Validators.required],
      visit_type: ['GENERAL', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    
    if (this.recordToEdit) {
      this.isEditMode = true;
      const formData = {
        ci_number: this.recordToEdit.visitor_details?.ci_number,
        first_name: this.recordToEdit.visitor_details?.first_name,
        last_name: this.recordToEdit.visitor_details?.last_name,
        country: this.recordToEdit.visitor_details?.country,
        visit_type: this.recordToEdit.visit_type,
        notes: this.recordToEdit.notes
      };

      this.attendanceForm.patchValue(formData);

      // Deshabilitamos los campos del visitante, ya que en la edición de una asistencia,
      // solo se deberían poder cambiar los datos de la asistencia misma.
      this.attendanceForm.get('ci_number')?.disable();
      this.attendanceForm.get('first_name')?.disable();
      this.attendanceForm.get('last_name')?.disable();
      this.attendanceForm.get('country')?.disable();
    } else {
      this.onCiNumberChanges();
    }
  }

  loadCountries(): void {
    this.visitorService.getCountries().subscribe({
      next: (data) => {
        this.countries = data.map(country => country.name);
      },
      error: (err) => console.error('Error al cargar la lista de países', err)
    });
  }

  onCiNumberChanges(): void {
    this.attendanceForm.get('ci_number')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingVisitor = true;
        this.foundVisitor = null;
        this.attendanceForm.patchValue({ first_name: '', last_name: '', country: 'PARAGUAY' });
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
          country: this.foundVisitor.country || 'PARAGUAY'
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

  onSubmitNewVisitor(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.attendanceForm.getRawValue();
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

  onSubmitExistingVisitor(): void {
    if (!this.foundVisitor?.id) return;

    const formValue = this.attendanceForm.getRawValue();
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

  onSubmitUpdate(): void {
    if (this.attendanceForm.invalid || !this.recordToEdit?.id) return;

    const formValue = this.attendanceForm.getRawValue();
    const updatePayload: Partial<any> = {
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
      country: 'PARAGUAY',
      visit_type: 'General',
      notes: ''
    });
    this.foundVisitor = null;
    this.isLoadingVisitor = false;
    this.isEditMode = false;
    this.recordToEdit = null;
    this.disableVisitorFields(false);
    this.attendanceForm.get('ci_number')?.enable();
  }

  onCancelClick(): void {
    this.resetForm();
    this.cancel.emit();
  }
}