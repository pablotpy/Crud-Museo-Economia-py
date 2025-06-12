import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Collapse } from 'bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">MUSEO APP</a>
        
        <button class="navbar-toggler" type="button" (click)="toggleNavbar()" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div #navbarNavContent class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/asistencia" routerLinkActive="active" (click)="closeNavbarOnClick()">ASISTENCIA</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/reportes" routerLinkActive="active" (click)="closeNavbarOnClick()">REPORTES</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
    <footer class="bg-light text-center text-lg-start mt-auto py-3">
        <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.05);">
            © {{ currentYear }} Museo App
        </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      flex-grow: 1;
    }
  `]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();

  @ViewChild('navbarNavContent') navbarNavContent!: ElementRef;
  
  private bsCollapse: Collapse | null = null;

  ngAfterViewInit(): void { 
    // cuando la vista está lista. { toggle: false } evita que se abra al inicio.
    this.bsCollapse = new Collapse(this.navbarNavContent.nativeElement, { toggle: false });
  }

  ngOnDestroy(): void {
    // Destruimos la instancia para evitar fugas de memoria
    this.bsCollapse?.dispose();
  }

  // Este método es para el botón "hamburguesa"
  toggleNavbar(): void {
    this.bsCollapse?.toggle();
  }

  // Este método es para los enlaces del menú
  closeNavbarOnClick(): void {
    this.bsCollapse?.hide();
  }
}