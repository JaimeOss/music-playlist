import { Component, Input } from '@angular/core';

interface BurstParticle {
  index: number;
  angle: string;
  distance: string;
  color: string;
}

@Component({
  selector: 'app-delete-explosion',
  standalone: true,
  host: {
    class: 'delete-explosion',
    '[class.delete-explosion--large]': 'large',
  },
  templateUrl: './delete-explosion.component.html',
  styleUrl: './delete-explosion.component.scss',
})
export class DeleteExplosionComponent {
  @Input() large = false;

  readonly particles = this.buildParticles();

  private buildParticles(): BurstParticle[] {
    const colors = ['#ef4444', '#f97316', '#fb923c', '#dc2626', '#fbbf24', '#e11d48'];

    return Array.from({ length: 16 }, (_, index) => ({
      index,
      angle: `${(360 / 16) * index + (index % 2 ? 11 : -11)}deg`,
      distance: this.large ? `${58 + (index % 4) * 20}px` : `${34 + (index % 3) * 14}px`,
      color: colors[index % colors.length],
    }));
  }
}
