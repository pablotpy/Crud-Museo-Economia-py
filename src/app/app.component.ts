import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">MUSEO APP</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/asistencia" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"></a>
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
export class AppComponent {
  currentYear = new Date().getFullYear();
}