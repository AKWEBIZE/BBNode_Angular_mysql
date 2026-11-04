import { Component } from '@angular/core';
import { ProductService } from '../service/product.service';
import { Product } from '../buyersproducts/product.model';



@Component({
    selector: 'app-buyersproducts',
    templateUrl: './buyersproducts.component.html',
    styleUrls: ['./buyersproducts.component.scss'],
    standalone: false
})
export class BuyersproductsComponent  {

  categories = [
  { name: 'Fruits', image: 'assets/images/Prdimg/apple.jpg' },
  { name: 'Vegetable', image: 'assets/images/Prdimg/car.jpg' },
  { name: 'Spices', image: 'assets/images/Prdimg/pep.jpg' },
  { name: 'Sweetner', image: 'assets/images/Prdimg/jag.jfif' },
  { name: 'Coconut', image: 'assets/images/Prdimg/coconut.png' },
  { name: 'Coffee', image: 'assets/images/Prdimg/cof.jpeg' }
];


  products: Product[] = [];
  selectedCategory = '';

  constructor(private productService: ProductService) {}

onCategoryClick(category: any) {
  this.selectedCategory = category.name;

  this.productService.getProductsByCategory(category.name).subscribe(response => {
    this.products = response._embedded?.productResponseBeanList || [];
  });
}

}
