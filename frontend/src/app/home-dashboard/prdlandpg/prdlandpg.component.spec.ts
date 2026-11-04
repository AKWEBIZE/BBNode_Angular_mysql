import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrdlandpgComponent } from './prdlandpg.component';

describe('PrdlandpgComponent', () => {
  let component: PrdlandpgComponent;
  let fixture: ComponentFixture<PrdlandpgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrdlandpgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrdlandpgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
