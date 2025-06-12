import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements AfterViewInit {

  
  // serán inicializadas por Angular y no estarán nulas.
  @ViewChild('tendenciaViaticos') private tendenciaCanvas!: ElementRef;
  @ViewChild('distribucionCapital') private distribucionCanvas!: ElementRef;
  @ViewChild('viaticosBeneficiario') private beneficiarioCanvas!: ElementRef;

  private datosViaticos = {
    "tendencia_mensual": [
      { "mes": "Enero", "monto": 12500000 },
      { "mes": "Febrero", "monto": 10000000 },
      { "mes": "Marzo", "monto": 18700000 },
      { "mes": "Abril", "monto": 15200000 },
      { "mes": "Mayo", "monto": 13500000 }
    ],
    "distribucion_capital": [
      { "lugar": "Capital", "monto": 48000000 },
      { "lugar": "Interior", "monto": 32000000 }
    ],
    "viaticos_beneficiario": [
      { "beneficiario": "Juan Pérez", "monto": 7800000 },
      { "beneficiario": "Ana Gómez", "monto": 6500000 },
      { "beneficiario": "Carlos Ruiz", "monto": 5200000 },
      { "beneficiario": "Marta López", "monto": 4800000 },
      { "beneficiario": "Pedro Díaz", "monto": 4500000 }
    ]
  };

  constructor() { }

  ngAfterViewInit(): void {
    this.crearGraficoTendencia();
    this.crearGraficoDistribucion();
    this.crearGraficoBeneficiario();
  }

  private crearGraficoTendencia(): void {
    new Chart(this.tendenciaCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.datosViaticos.tendencia_mensual.map(item => item.mes),
        datasets: [{
          label: 'Viáticos (Gs.)',
          data: this.datosViaticos.tendencia_mensual.map(item => item.monto),
          backgroundColor: 'rgba(54, 162, 235, 0.3)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private crearGraficoDistribucion(): void {
    new Chart(this.distribucionCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.datosViaticos.distribucion_capital.map(item => item.lugar),
        datasets: [{
          label: 'Distribución',
          data: this.datosViaticos.distribucion_capital.map(item => item.monto),
          backgroundColor: ['#36A2EB', '#FF6384'],
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private crearGraficoBeneficiario(): void {
    new Chart(this.beneficiarioCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.datosViaticos.viaticos_beneficiario.map(item => item.beneficiario),
        datasets: [{
          label: 'Viáticos (Gs.)',
          data: this.datosViaticos.viaticos_beneficiario.map(item => item.monto),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }
}