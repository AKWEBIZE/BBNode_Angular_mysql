import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

interface ProductItem {
   name: string;
  grade: string;
  price: number;
  image: string;
  tags: string[];
}


@Component({
    selector: 'app-Products',
    templateUrl: './Products.component.html',
     styleUrls: ['./Products.component.scss']
,
    standalone: false
})
export class ProductsComponent implements OnInit {

  filteredprod: any[] = [];

  constructor(private router: Router) {}

    @ViewChild('carousel', { static: false }) carousel!: ElementRef;




  
   categories = [
    { name: 'Coffee', icon: 'assets/images/Prdimg/coff.jpg', description: 'Hampteaal...', count: 100,color: '#6f4e37',fontColor: '#ffffff'  },
    { name: 'Spices', icon: 'assets/images/Prdimg/pep1.jpg', description: 'Petai...', count: 10,color: '#d2691e',fontColor: '#ffffff' },
    { name: 'Fruits', icon: 'assets/images/Prdimg/app1.jpg', description: 'Groseta...', count: 21,color: '#e63946',fontColor: '#ffffff' },
    { name: 'Vegetables', icon: 'assets/images/Prdimg/veg.jpg', description: 'Meltliners...', count: 37,color: '#2a9d8f',fontColor: '#ffffff' },
    { name: 'Sweeteners', icon: 'assets/images/Prdimg/cj4.jpg', description: 'Nenti a gor...', count: 20, color: '#f4a261',fontColor: '#ffffff' }
  ];

  product = [
    { name: 'Indian cauliflower', grade: 'Grade A', price: 121, image: 'assets/images/Prdimg/cau1.jpg' },
    { name: 'Certified Organic ripe Banana ', grade: 'Verified', price: 450, image: 'assets/images/Prdimg/b1.jpg' },
    { name: 'Certified Organic ripe Banana ', grade: 'Verified', price: 450, image: 'assets/images/Prdimg/cu2.jpg' },
    { name: 'Certified Organic ripe Banana ', grade: 'Verified', price: 450, image: 'assets/images/Prdimg/dr1.jpg' },
    { name: 'Single Origin indian AVACODO ', grade: 'Organic', price: 121, image: 'assets/images/Prdimg/av3.jpg' }
  ];

  






   allProducts: ProductItem[] = [
    { name: 'Farmer Co.', grade: 'A', price: 1200, image: 'assets/images/farmer.png', tags: ['trending', 'verified'] },
    { name: 'Agro Mart', grade: 'B', price: 950, image: 'assets/images/agro.png', tags: ['trusted'] },
    { name: 'Organic Hub', grade: 'A+', price: 2100, image: 'assets/images/organic.png', tags: ['trending', 'verified'] },
    { name: 'Local Fields', grade: 'B+', price: 800, image: 'assets/images/fields.png', tags: ['verified'] },
        {name: 'Agro Mart',grade: 'B',price: 950,image: 'assets/images/agro.png',tags: ['trending']},
    {name: 'Organic Hub',grade: 'A+',price: 2100,image: 'assets/images/organic.png',tags: ['trending' ]},
    {name: 'Local Fields',grade: 'B+',price: 800,image: 'assets/images/fields.png',tags: ['verified']},
    {name: 'Agro Mart',grade: 'B',price: 950,image: 'assets/images/agro.png',tags: ['trending']},
    {name: 'Organic Hub',grade: 'A+',price: 2100,image: 'assets/images/organic.png',tags: ['trending' ]},
    {name: 'Local Fields',grade: 'B+',price: 800,image: 'assets/images/fields.png',tags: ['verified']},
    {name: 'Agro Mart',grade: 'B',price: 950,image: 'assets/images/agro.png',tags: ['trending']},
    {name: 'Organic Hub',grade: 'A+',price: 2100,image: 'assets/images/organic.png',tags: ['trending' ]},
    {name: 'Local Fields',grade: 'B+',price: 800,image: 'assets/images/fields.png',tags: ['verified']},
    {name: 'Agro Mart',grade: 'B',price: 950,image: 'assets/images/agro.png',tags: ['trending']},
    {name: 'Organic Hub',grade: 'A+',price: 2100,image: 'assets/images/organic.png',tags: ['trending' ]},
    {name: 'Local Fields',grade: 'B+',price: 800,image: 'assets/images/fields.png',tags: ['verified']}
  ];

  filteredProducts: ProductItem[] = [];

  filterButtons = [
    { label: 'All', value: 'all' },
    { label: 'Trending', value: 'trending' },
    { label: 'Verified', value: 'verified' },

  ];

  selectedFilter = 'all';

  ngOnInit(): void {
    // ✅ Default: show all products initially
    this.filteredProducts = [...this.allProducts];
  }

  setFilter(filterValue: string): void {
    this.selectedFilter = filterValue;

    if (filterValue === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else if (filterValue === 'trending-verified') {
      this.filteredProducts = this.allProducts.filter(prod =>
        prod.tags.includes('trending') && prod.tags.includes('verified')
      );
    } else {
      this.filteredProducts = this.allProducts.filter(prod =>
        prod.tags.includes(filterValue)
      );
    }
  }

  scrollLeft(): void {
    this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
}


