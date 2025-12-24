import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentItem } from '../services/content.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  host: {
    class: 'block'
  },
  template: `
    <nav class="sidebar">
      <div class="sidebar-header">
        <h2>System Design Course</h2>
      </div>
      <ul class="nav-list">
        @for (item of contentItems(); track item.id) {
    <li class="nav-item">
  <a
    [routerLink]="item.path"
    routerLinkActive="active"
    #rla="routerLinkActive"
    class="nav-link"
    [attr.aria-current]="rla.isActive ? 'page' : null"
  >
    {{ item.title }}
  </a>
</li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: var(--gray-900);
      color: white;
      padding: 2rem 0;
      overflow-y: auto;
      position: fixed;
      left: 0;
      top: 0;
    }

    .sidebar-header {
      padding: 0 1.5rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1rem;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: block;
      padding: 0.75rem 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      color: white;
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-link.active {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-left-color: var(--bright-blue);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
      }
    }
  `]
})
export class SidebarComponent {
  contentItems = input.required<ContentItem[]>();
}
