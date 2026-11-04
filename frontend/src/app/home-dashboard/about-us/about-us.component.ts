import { Component, OnInit } from '@angular/core';

interface RegionalTeam {
  region: string;
  focus: string;
}

@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss'],
    standalone: false
})
export class AboutUsComponent implements OnInit {

  constructor() { }

  // Same four desks referenced on the Contact page — kept in one place
  // here so this claim is backed by real, consistent data.
  regionalTeams: RegionalTeam[] = [
    { region: 'Shimla, HP', focus: 'Apple Exports' },
    { region: 'Srinagar, J&K', focus: 'Premium Fruits' },
    { region: 'Coimbatore, TN', focus: 'Logistics & South Ops' },
    { region: 'Chennai (HQ)', focus: 'Corporate & Investor Desk' }
  ];

  ngOnInit(): void {
  }

}
