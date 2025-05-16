import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs'; // Importar 'of'
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, map } from 'rxjs/operators'; // Añadir catchError, map
import { AttendanceService } from '../attendance.service';
import { AttendanceRecord } from '../../models/attendance-record.model';
import { Visitor } from '../../models/visitor.model';
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
export class AttendanceFormComponent implements OnInit, OnChanges {
  @Input() recordToEdit: AttendanceRecord | null = null;
  @Output() formSubmitted = new EventEmitter<AttendanceRecord>();
  @Output() cancel = new EventEmitter<void>();

  attendanceForm: FormGroup;
  isEditMode = false;
  foundVisitor: Visitor | null = null;
  isLoadingVisitor = false;
  countries$: Observable<string[]>; // Para la lista de países
  isLoadingCountries = false;

  // Expresión regular para nombres: permite letras (incluyendo acentuadas y ñ) y espacios.
  private namePattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService
  ) {
    this.attendanceForm = this.fb.group({
      ci_number: ['', Validators.required],
      first_name: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(this.namePattern)]],
      last_name: [{ value: '', disabled: false }, [Validators.required, Validators.pattern(this.namePattern)]],
      country: ['Paraguay', Validators.required], // Valor por defecto y campo requerido
      visit_type: ['General', Validators.required],
      notes: ['']
    });

    // Inicializar countries$ aquí para que esté disponible desde el inicio
    this.countries$ = of([]); // Valor inicial mientras se carga
  }

  ngOnInit(): void {
    this.loadCountries(); // Cargar países
    this.onCiNumberChanges();
    if (!this.recordToEdit) {
      this.disableVisitorFields(false);
    }
  }

  loadCountries(): void {
    this.isLoadingCountries = true;
    this.countries$ = this.attendanceService.getCountries().pipe(
      tap(() => this.isLoadingCountries = false),
      catchError(() => {
        this.isLoadingCountries = false;
        console.error('Error al cargar la lista de países. Usando valor por defecto.');
        return of(['Paraguay']); // Fallback
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recordToEdit'] && this.recordToEdit) {
      this.isEditMode = true;
      this.attendanceForm.patchValue({
        ci_number: this.recordToEdit.visitor?.ci_number || this.recordToEdit.ci_number || '',
        first_name: this.recordToEdit.visitor?.first_name || this.recordToEdit.first_name || '',
        last_name: this.recordToEdit.visitor?.last_name || this.recordToEdit.last_name || '',
        country: this.recordToEdit.visitor?.country || this.recordToEdit.country || 'Paraguay',
        visit_type: this.recordToEdit.visit_type || 'General',
        notes: this.recordToEdit.notes || ''
      });
      if (this.recordToEdit.visitor || this.recordToEdit.visitor_id) {
        this.disableVisitorFields(true);
        if (this.recordToEdit.visitor) this.foundVisitor = this.recordToEdit.visitor;
      } else {
        this.disableVisitorFields(false);
        if (this.attendanceForm.get('ci_number')?.value) {
          this.checkVisitor(this.attendanceForm.get('ci_number')?.value);
        }
      }
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  onCiNumberChanges(): void {
    this.attendanceForm.get('ci_number')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingVisitor = true;
        this.foundVisitor = null;
        if (!this.isEditMode || (this.isEditMode && !this.recordToEdit?.visitor_id)) {
            this.attendanceForm.patchValue({ first_name: '', last_name: ''}); // No resetear país aquí
            // Si el país ya fue cargado y es Paraguay por defecto, se mantendrá
            if (!this.attendanceForm.get('country')?.value && !this.isLoadingCountries) {
                 this.attendanceForm.get('country')?.setValue('Paraguay');
            }
            this.disableVisitorFields(false);
        }
      }),
      switchMap(ci => {
        if (!ci || ci.length < 3) {
          this.isLoadingVisitor = false;
          return of(null);
        }
        return this.attendanceService.getVisitorByCI(ci);
      })
    ).subscribe(visitor => {
      this.isLoadingVisitor = false;
      if (visitor) {
        this.foundVisitor = visitor;
        this.attendanceForm.patchValue({
          first_name: visitor.first_name,
          last_name: visitor.last_name,
          country: visitor.country || this.attendanceForm.get('country')?.value || 'Paraguay' // Mantener el país si ya estaba o usar el del visitante
        });
        this.disableVisitorFields(true);
      } else {
        if (!this.isEditMode || (this.isEditMode && !this.recordToEdit?.visitor_id)) {
            this.disableVisitorFields(false);
        }
      }
    });
  }

  checkVisitor(ci: string): void {
    if (!ci) return;
    this.isLoadingVisitor = true;
    this.attendanceService.getVisitorByCI(ci).subscribe(visitor => {
      this.isLoadingVisitor = false;
      if (visitor) {
        this.foundVisitor = visitor;
        this.attendanceForm.patchValue({
          first_name: visitor.first_name,
          last_name: visitor.last_name,
          country: visitor.country || this.attendanceForm.get('country')?.value || 'Paraguay'
        });
        this.disableVisitorFields(true);
      } else {
        this.foundVisitor = null;
        if (!this.isEditMode || (this.isEditMode && !this.recordToEdit?.visitor_id)){
            this.disableVisitorFields(false);
        }
      }
    });
  }

  disableVisitorFields(disable: boolean): void {
    const fields = ['first_name', 'last_name', 'country']; // También deshabilitar país si el visitante existe
    fields.forEach(field => {
      if (disable) {
        this.attendanceForm.get(field)?.disable();
      } else {
        this.attendanceForm.get(field)?.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const formValue = this.attendanceForm.getRawValue(); // Obtiene valores incluso de campos deshabilitados

    let payload: AttendanceRecord = {
      ci_number: formValue.ci_number,
      // Conversión a MAYÚSCULAS
      first_name: formValue.first_name.toUpperCase(),
      last_name: formValue.last_name.toUpperCase(),
      country: formValue.country,
      visit_type: formValue.visit_type,
      notes: formValue.notes
    };

    if (this.isEditMode && this.recordToEdit?.id) {
      payload.id = this.recordToEdit.id;
      // Si es edición y el visitante ya existe, first_name, last_name y country vienen de getRawValue
      // y la API decidirá si los actualiza o no en el visitante.
      // Es importante que la API de PUT /attendance/:id sea idempotente con estos campos del visitante
      // o tenga una lógica clara para actualizarlos.
    }
    // Para un nuevo registro, first_name, last_name, country ya están en el payload.

    this.formSubmitted.emit(payload);
  }

  resetForm(): void {
    this.attendanceForm.reset({
      ci_number: '',
      first_name: '',
      last_name: '',
      country: 'Paraguay', // Default
      visit_type: 'General',
      notes: ''
    });
    this.foundVisitor = null;
    this.isEditMode = false;
    this.recordToEdit = null;
    this.disableVisitorFields(false);
  }

  onCancelClick(): void {
    this.cancel.emit();
  }
}