import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // DatePipe para formatear fechas
import { AttendanceRecord } from '../../models/attendance-record.model';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-list.component.html',
  styleUrls: ['./attendance-list.component.scss']
})
export class AttendanceListComponent {
  @Input() records: AttendanceRecord[] = [];
  @Output() editRecord = new EventEmitter<AttendanceRecord>();
  @Output() deleteRecord = new EventEmitter<number>();

  constructor() { }

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
}