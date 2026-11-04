import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

interface AudienceItem {
  title: string;
  description: string;
}

/**
 * Full-bleed hero for the Contact page: green band across the viewport, content centred in a
 * 1440px container, two columns on desktop and stacked on mobile.
 *
 * The buttons only emit — the Contact page keeps the click handlers (openEnquiry) so the
 * enquiry modal and its topic stay owned by the page, as before.
 */
@Component({
  selector: 'app-contact-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-hero.component.html',
  styleUrls: ['./contact-hero.component.scss']
})
export class ContactHeroComponent {
  /** Primary CTA — the Contact page opens the enquiry modal with the "Buyer Enquiry" topic. */
  @Output() sendEnquiry = new EventEmitter<void>();

  audience: AudienceItem[] = [
    { title: 'Farmers', description: 'Sell produce to verified buyers' },
    { title: 'Buyers', description: 'Source quality agri-commodities' },
    { title: 'Partners', description: 'Logistics, finance and export' }
  ];
}
