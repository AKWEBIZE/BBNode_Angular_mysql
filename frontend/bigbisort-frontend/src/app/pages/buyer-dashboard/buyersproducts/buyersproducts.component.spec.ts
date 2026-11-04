import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyersproductsComponent } from './buyersproducts.component';

describe('BuyersproductsComponent', () => {
  let component: BuyersproductsComponent;
  let fixture: ComponentFixture<BuyersproductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyersproductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyersproductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
