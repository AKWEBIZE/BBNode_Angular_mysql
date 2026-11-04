import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-prdlandpg',
    templateUrl: './prdlandpg.component.html',
    styleUrls: ['./prdlandpg.component.scss'],
    standalone: false
})
export class PrdlandpgComponent implements OnInit {

  // filter categories — same taxonomy used on Home/Products/Category
  categories = ['All', 'Fruits', 'Vegetables', 'Spices', 'Coconut'];

  // selected filter
  selectedCategory: string = 'All';

  // product list — real, routed products only (see 30_Products/*), with
  // the same images used on Home/Products/Category for consistency.
  products = [
    { name: 'Apple', category: 'Fruits', image: 'assets/images/Prdpage/Apple/apbasket.png', link: '/apple' },
    { name: 'Avocado', category: 'Fruits', image: 'assets/images/Prdpage/Avo/avo.jpg', link: '/avocado' },
    { name: 'Banana', category: 'Fruits', image: 'assets/images/Prdpage/Banana/ba.jpg', link: '/banana' },
    { name: 'Pineapple', category: 'Fruits', image: 'assets/images/Prdpage/Pineapple/ip.png', link: '/pineapple' },
    { name: 'Carrot', category: 'Vegetables', image: 'assets/images/Prdimg/ca1.jpg', link: '/carrot' },
    { name: 'Pepper', category: 'Spices', image: 'assets/images/Prdpage/Pepper/bp.jpg', link: '/pepper' },
    { name: 'Coconut', category: 'Coconut', image: 'assets/images/Prdpage/Coconut/co2.jpg', link: '/coconut' }
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
