import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    standalone: false
})
export class CategoryComponent implements OnInit {
  categoryType: string = '';
  items: any[] = [];

 allItems = {
  vegetables: [
    { name: 'Tomato', image: 'assets/images/Prdimg/to1.jpg' },
    { name: 'Potato', image: 'assets/images/Prdimg/pot2.jpg' },
    { name: 'Carrot', image: 'assets/images/Prdimg/ca1.jpg' },
    { name: 'Onion', image: 'assets/images/Prdimg/on1.jpg' },
  ],
  fruits: [
    { name: 'Apple', image: 'assets/images/Prdpage/Apple/apbasket.png' },
    { name: 'Avocado', image: 'assets/images/Prdpage/Avo/avo.jpg' },
    { name: 'Banana', image: 'assets/images/Prdpage/Banana/ba.jpg' },
    { name: 'Pineapple', image: 'assets/images/Prdpage/Pineapple/ip.png' }
  ],
  spices: [
    { name: 'Black Pepper', image: 'assets/images/Prdpage/Pepper/bp.jpg' },
    { name: 'White Pepper', image: 'assets/images/Prdpage/Pepper/wp.jpg' }
  ],
  coconut: [
    { name: 'Coconut', image: 'assets/images/Prdpage/Coconut/co2.jpg' },
    { name: 'Tender Coconut', image: 'assets/images/Prdpage/Coconut/c.jpg' },
    { name: 'Dry Coconut (Copra)', image: 'assets/images/Prdpage/Coconut/cor.png' }
  ]
};

  ngOnInit() {
    this.categoryType = this.route.snapshot.paramMap.get('type') || '';
    this.items = this.allItems[this.categoryType as keyof typeof this.allItems] || [];
  }

  constructor(private route: ActivatedRoute) {}
}
