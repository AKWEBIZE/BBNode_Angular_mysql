import { Component } from '@angular/core';

@Component({
    selector: 'app-new-arrivals',
    templateUrl: './new-arrivals.component.html',
    styleUrls: ['./new-arrivals.component.scss'],
    standalone: false
})
export class NewArrivalsComponent {
  newArrivals = [
    {
      name: 'Ginger',
      price: 115,
      unit: 'kg',
      location: 'Kochi, Kerala',
      timeAgo: '9 days ago',
      image: 'assets/images/New/ging.avif'
    },
    {
      name: 'Apples',
      price: 90,
      unit: 'kg',
      location: 'Shimla, Himachal Pradesh',
      timeAgo: '6 days ago',
      image: 'assets/images/apple.jpg'
    },
    {
      name: 'Cauliflower',
      price: 60,
      unit: 'pce',
      location: 'Neenak, Maharashtra',
      timeAgo: '1 week ago',
      image: 'assets/images/cauliflower.jpg'
    },
    {
      name: 'Turmeric Powder',
      price: 180,
      unit: 'kg',
      location: 'Jainch, Lavir, Rajasthan',
      timeAgo: '1 week ago',
      image: 'assets/images/turmeric.jpg'
    }
  ];
}
