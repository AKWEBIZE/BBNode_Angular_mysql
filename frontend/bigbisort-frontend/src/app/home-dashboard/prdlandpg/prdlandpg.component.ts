import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-prdlandpg',
    templateUrl: './prdlandpg.component.html',
    styleUrls: ['./prdlandpg.component.scss'],
    standalone: false
})
export class PrdlandpgComponent implements OnInit {

  // filter categories
  categories = ['All', 'Fruits', 'Vegetables', 'Coffee', 'Sweetener'];

  // selected filter
  selectedCategory: string = 'All';

  // product list (can later come from API)
  products = [                                             
    { name: 'Apple', category: 'Fruits',   image: 'assets/images/Prdimg/app1.jpg',link: '/apple' } ,

    { name: 'Avocado', category: 'Vegetables',  image: 'assets/images/Prdimg/av3.jpg',link: '/avocado' },

    { name: 'Carrot', category: 'Vegetables',  image: 'assets/images/Prdimg/carrs1.png',link: '/carrot' },

    { name: 'Banana', category: 'Fruits',  image: 'assets/images/Prdimg/dp1.png',link: '/banana' },

    { name: 'Pineapple', category: 'Fruits',  image: 'assets/images/Prdpage/Pineapple/ip.png',link: '/pineapple' },

    { name: 'Coconut', category: 'Fruits',  image: 'assets/images/Prdpage/Coconut/coc.avif',link: '/coconut' },

    { name: 'pepper', category: 'Fruits',  image: 'assets/images/Prdpage/Pepper/ld1.png',link: '/pepper' },
 







    { name: 'Carrot', category: 'Vegetables', price: 40, image: 'assets/images/carrot.jpg' },
    { name: 'Broccoli', category: 'Vegetables', price: 80, image: 'assets/images/broccoli.jpg' },
    { name: 'Arabica Coffee', category: 'Coffee', price: 200, image: 'assets/images/coffee.jpg' },
    { name: 'Brown Sugar', category: 'Sweetener', price: 90, image: 'assets/images/sugar.jpg' }
  ];

  filteredProducts: any[] = [];

  ngOnInit(): void {
    this.filteredProducts = this.products; // load all initially
  }

  // filter function
  filterProducts(category: string) {
    this.selectedCategory = category;
    this.filteredProducts = category === 'All'
      ? this.products
      : this.products.filter(p => p.category === category);
  }


  
}
