import {  Component, OnInit, AfterViewInit, ElementRef, ViewChild  } from '@angular/core';

@Component({
    selector: 'app-apple',
    templateUrl: './apple.component.html',
    styleUrls: ['./apple.component.scss'],
    standalone: false
})
export class AppleComponent implements OnInit, AfterViewInit  {

  constructor() { }

  ngOnInit(): void {
  }
@ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  private rafId: number | null = null;
  private scrollSpeed = 0.5; // pixels per frame

  ngAfterViewInit(): void {
    // Wait for the DOM and images to fully render
    setTimeout(() => {
      this.startAutoScroll();
    }, 500);
  }

  private startAutoScroll() {
    const container = this.scrollContainer.nativeElement;
    const maxScroll = container.scrollWidth / 2; // because we duplicated cards

    const step = () => {
      container.scrollLeft += this.scrollSpeed;
      if (container.scrollLeft >= maxScroll) {
        container.scrollLeft = 0; // reset to start
      }
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }


appleVarieties = [
    {
      name: 'Ambri Apple',
      description: 'Kashmiri pride, sweet aroma, greenish-red exterior.',
      image: 'assets/images/Prdpage/Apple/amb.jpg' 
    },
    {
      name: 'McIntosh Apple',
      description: 'Soft, creamy flesh; good for raw eating & butter.',
      image: 'assets/images/Prdpage/Apple/mcl.jpeg'
    },
    {
      name: 'Granny Smith',
      description: 'Classic tart, juicy apple; used in cakes, jams, candies; medicinal benefits.',
      image: 'assets/images/Prdpage/Apple/grany.png'
    },
    {
      name: 'Honeycrisp',
      description: 'Sweet, crispy, long shelf life; popular for exports.',
      image: 'assets/images/Prdpage/Apple/hc.jpeg'
    },
    {
      name: 'Chaubattia Anupam',
      description: 'Hybrid (Red Delicious × Early Shanburry); produced in UP & Uttarakhand.',
      image: 'assets/images/Prdpage/Apple/ch.jpg'
    }
  ];

  

  appleBenefits = [
    { icon: 'fa-solid fa-heart-pulse', text: 'Good for blood pressure & cholesterol control' },
    { icon: 'fa-solid fa-apple-whole', text: 'Supports a healthy immune system' },
    { icon: 'fa-solid fa-ribbon', text: 'Antioxidants play a vital role in cancer prevention' },
    { icon: 'fa-solid fa-brain', text: 'Supports control of Alzheimer’s disease' },
    { icon: 'fa-solid fa-heart', text: 'Good for heart health' },

  ];

  appleBenifit = [
        { icon: 'fa-solid fa-drumstick-bite', text: 'Rich in fiber, aids digestion' },
    { icon: 'fa-solid fa-stethoscope', text: 'Diabetes-friendly, prevents diabetes risk' },
    { icon: 'fa-solid fa-weight-scale', text: 'Supports healthy weight loss' },
    { icon: 'fa-solid fa-lungs', text: 'Boosts immunity & supports fighting asthma' },
  ]

  processingSteps = [
    {
      title: 'Pre-Cooling',
      icon: 'fa-solid fa-fan',
      description: 'Apples placed in ventilated cool area to remove field heat before packing.',
      note: 'Must be moisture-free before grading/packing.'
    },
    {
      title: 'Grading',
      icon: 'fa-solid fa-apple-whole',
      description: 'Based on size, appearance & quality. Grades: A, B, C, AA, AAA, Fancy Class I, Fancy Class II, Extra Fancy.'
    },
    {
      title: 'Storage',
      icon: 'fa-solid fa-temperature-low',
      description: 'Long shelf life (4–8 months). Best in cold storage: 0–1°C, 85–90% RH.'
    },
    {
      title: 'Packing',
      icon: 'fa-solid fa-box-open',
      description: 'Wooden boxes ideal (10–20 kg capacity). Ensure fruit protection during transit.'
    }
  ];

  features = [
    {
      icon: 'fa-solid fa-user-tie',
      title: 'Direct From Farmers',
      description: 'Verified growers from J&K, Himachal, Uttarakhand, Arunachal, Nagaland & Nilgiris.'
    },
    {
      icon: 'fa-solid fa-award',
      title: 'Premium Quality & Certification',
      description: 'Graded A – AAA & Fancy classes, cold-chain storage at 0-1°C for up to 8 months.'
    },
    {
      icon: 'fa-solid fa-apple-whole',
      title: 'Wide Variety Selection',
      description: 'Ambri, McIntosh, Granny Smith, Honeycrisp, Fuji, Red Delicious — fresh or processed.'
    },
    {
      icon: 'fa-solid fa-globe',
      title: 'Global Market Reach',
      description: 'Export-ready logistics — served 75+ countries; strong demand in Middle East & Asia.'
    }
  ];

  sellers = [
    {
      name: 'Sh. Ravinder Chauhan',
      location: 'President, Apple Grower Association of India (HP)',
      description: 'Leading HP – Golden Delicious,McIntosh;cold-chain ready',
      rating: 4.6,
      image: 'assets/images/Prdpage/Apple/hpm.png',
      tags: [
        { label: 'Verified', class: 'verified' },
        { label: 'Graded', class: 'graded' }
      ]
    },
    {
      name: 'Ambri Orchards',
      location: 'Kashmir Valley',
      description: 'Ambri & Sunehari – 120 MT/month',
      rating: 4.4,
      image: 'assets/images/Prdpage/Apple/ambor.png',
      tags: [
        { label: 'Traceable', class: 'traceable' },
        { label: 'Export Ready', class: 'export' }
      ]
    },
    {
      name: 'Uttarakhand Orchards',
      location: 'Dehradun, Uttarakhand',
      description: 'McIntosh & Chaubattia Anupam – Quality checked & graded.',
      rating: 4.5,
      image: 'assets/images/Prdpage/Apple/utor.png',
      tags: [
        { label: 'Verified', class: 'verified' },
        { label: 'Certified', class: 'graded' }
      ]
    }
  ];

  getStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(fullStars).fill(0);
  }



  formData = {
    name: '',
    email: '',
    quantity: ''
  };

  onSubmit() {
    if (this.formData.name && this.formData.email && this.formData.quantity) {
      console.log('Form submitted:', this.formData);
      alert('Enquiry sent successfully!');
      this.formData = { name: '', email: '', quantity: '' };
    } else {
      alert('Please fill out all fields before submitting.');
    }
  }

}
