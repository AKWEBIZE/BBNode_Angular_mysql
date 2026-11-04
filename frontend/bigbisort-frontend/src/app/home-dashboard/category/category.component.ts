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
    { name: 'Apple', image: 'assets/images/items/apple.jpg' },
    { name: 'Banana', image: 'assets/images/items/banana.jpg' },
    { name: 'Orange', image: 'assets/images/items/orange.jpg' },
    { name: 'Grapes', image: 'assets/images/items/grapes.jpg' }
  ],
  spices: [
    { name: 'Turmeric', image: 'assets/images/items/turmeric.jpg' },
    { name: 'Cinnamon', image: 'assets/images/items/cinnamon.jpg' },
    { name: 'Cloves', image: 'assets/images/items/cloves.jpg' }
  ],
  sweeteners: [
    { name: 'Sugar', image: 'assets/images/items/sugar.jpg' },
  ]
};

  ngOnInit() {
    this.categoryType = this.route.snapshot.paramMap.get('type') || '';
    this.items = this.allItems[this.categoryType as keyof typeof this.allItems] || [];
  }

  constructor(private route: ActivatedRoute) {}
}
