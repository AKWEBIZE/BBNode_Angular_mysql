import { Component, OnInit,OnDestroy } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent  implements OnInit, OnDestroy {

  images: string[] = [
    'assets/images/Home/h1.jpg',
    'assets/images/Home/h2.jpg',
    'assets/images/Home/h3.jpg',
    'assets/images/Home/h4.jpg',
    'assets/images/Home/h5.jpg'
  ];

  currentSlide = 0;
  slideInterval: any;

  ngOnInit() {
    this.startCarousel();
  }

  startCarousel() {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
    }, 3000); // 3 seconds per slide
  }

  ngOnDestroy() {
    clearInterval(this.slideInterval);
  }

}
