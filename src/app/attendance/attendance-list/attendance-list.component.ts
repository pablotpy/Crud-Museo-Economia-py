import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AttendanceRecord, PaginatedResponse } from '../../models/attendance-record.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.component.html',
  imports: [CommonModule], 
  // ...
})
export class AttendanceListComponent {
  // El Input ahora espera el objeto de paginación completo
  @Input() paginatedData: PaginatedResponse<AttendanceRecord> | null = null;
  
  @Output() editRecord = new EventEmitter<AttendanceRecord>();
  @Output() deleteRecord = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  currentPage = 1;
  pageSize = 20; // Coincide con el PAGE_SIZE del backend
  totalPages = 0;
  
  ngOnChanges(): void {
    if (this.paginatedData) {
      this.totalPages = Math.ceil(this.paginatedData.count / this.pageSize);
      // Extraer la página actual de la URL 'next' o 'previous'
      if (this.paginatedData.previous) {
        const pageMatch = this.paginatedData.previous.match(/page=(\d+)/);
        this.currentPage = pageMatch ? parseInt(pageMatch[1], 10) + 1 : 2;
      } else {
        this.currentPage = 1;
      }
    }
  }

  onEdit(record: AttendanceRecord): void {
    this.editRecord.emit(record);
  }

  onDelete(id: number | undefined): void {
    if (id !== undefined) { 
      if (confirm('¿Está seguro de que desea eliminar este registro?')) {
        this.deleteRecord.emit(id);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}