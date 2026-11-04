import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent implements OnInit {

  currentYear = new Date().getFullYear();

  newsletterEmail = '';
  newsletterSubmitted = false;

  constructor() { }

  ngOnInit(): void {
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail) { return; }
    // TODO: wire to a real mailing-list endpoint once one exists.
    console.log('Newsletter signup:', this.newsletterEmail);
    this.newsletterSubmitted = true;
    this.newsletterEmail = '';
  }

}
