import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-coconut',
    templateUrl: './coconut.component.html',
    styleUrls: ['./coconut.component.scss'],
    standalone: false
})
export class CoconutComponent implements OnInit {
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


BananaVarieties = [
    {
      name: 'Tall Varieties',
      description: 'Tall coconut palms are long-lived,typically grown up to 15-20 meters. They take 6-10 years to bear fruit but offer a high yield of large nuts.',
      image: 'assets/images/Prdpage/Coconut/v1.webp' 
    },
    {
      name: 'Dwarf Varieties',
      description: 'Dwarf coconut palms are shorter (5-10 meters), early-bearing (3-5 years), and suited for smaller spaces.',
      image: 'assets/images/Prdpage/Coconut/v2.jpg' 
    },
    {
      name: 'Hybrid Coconuts',
      description: 'Hybrid varieties are crosses between Tall and Dwarf palms, combining desirable traits like early bearing, moderate height, and good yield.',
      image: 'assets/images/Prdpage/Coconut/v3.jpg' 
    }
 
  ];

coconutBenefitsLeft = [
  { icon: 'fa-solid fa-suitcase-medical', text: 'Boosts immunity with antibacterial and antiviral properties' },
  { icon: 'fa-solid fa-gut', text: 'Improves digestion and supports gut health' },
  { icon: 'fa-solid fa-bolt', text: 'Provides quick natural energy from healthy fats' },
  { icon: 'fa-solid fa-heart-pulse', text: 'Promotes heart health with good cholesterol (HDL)' },
  { icon: 'fa-solid fa-face-smile-beam', text: 'Enhances skin and hair health naturally' },
];

 
coconutBenefitsRight = [
  { icon: 'fa-solid fa-weight-scale', text: 'Supports weight management with healthy medium-chain fats' },
  { icon: 'fa-solid fa-droplet', text: 'Deeply hydrates the body and prevents dehydration' },
  { icon: 'fa-solid fa-shield-heart', text: 'Strengthens the immune system and improves healing' },
  { icon: 'fa-solid fa-apple-whole', text: 'Provides essential minerals like potassium and manganese' },
];


processingSteps = [
  {
    title: 'Harvesting & Collection',
    icon: 'fa-solid fa-seedling',
    description: 'Fully matured coconuts are harvested using climbing tools or hooked knives. Nuts are collected based on size, shell hardness, and maturity level.',
    note: 'Only well-matured and damage-free coconuts are selected for further processing.'
  },
  {
    title: 'De-Husking & Cleaning',
    icon: 'fa-solid fa-fan',
    description: 'Coconuts are de-husked manually or using machines. The nuts are cleaned to remove soil, fibers, and external impurities.',
    note: 'Proper cleaning maintains hygiene and prepares the nuts for grading.'
  },
  {
    title: 'Drying & Storage',
    icon: 'fa-solid fa-temperature-low',
    description: 'Coconuts are sun-dried or stored in well-ventilated areas to reduce moisture and extend shelf life. Tender coconuts are stored in cool conditions.',
    note: 'Ideal storage: dry, cool area with good airflow to avoid fungal contamination.'
  },
  {
    title: 'Grading & Packing',
    icon: 'fa-solid fa-box-open',
    description: 'Coconuts are graded by weight, shell quality, water volume, and overall appearance. Packed in mesh bags or cartons suitable for domestic and export shipping.',
    note: 'Export grade usually ranges from 450g – 650g with strong shell and uniform shape.'
  }
];



features = [
  {
    icon: 'fa-solid fa-hand-holding-seedling',
    title: 'Sourced from Premium Pineapple Farms',
    description:
      'Directly procured from certified growers in Tamil Nadu, Kerala, Andhra Pradesh & West Bengal — ensuring traceable and high-quality produce.'
  },
  {
    icon: 'fa-solid fa-certificate',
    title: 'Export-Grade Quality & Certification',
    description:
      'Pineapples are graded for sweetness, size, ripeness, and shell strength. Fully compliant with APEDA, Global GAP, and international export standards.'
  },
  {
    icon: 'fa-solid fa-seedling',
    title: 'Top Pineapple Varieties',
    description:
      'Includes Queen, Mauritius, Kew (Giant), and MD-2 varieties — known for superior flavor, aroma, and excellent shelf life.'
  },
  {
    icon: 'fa-solid fa-globe',
    title: 'Global Export Excellence',
    description:
      'Supplying fresh pineapples to Middle East, Europe, Maldives & Sri Lanka with strong cold-chain logistics and reliable packaging.'
  }
];



sellers = [
  {
    name: 'Kerala Premium Coconut Farmers',
    location: 'Thrissur, Kerala',
    description:
      'Producers of high-quality mature coconuts, coir-grade nuts, and tender coconuts — Kerala is India’s top coconut hub known for consistent quality.',
    rating: 4.9,
    image: 'assets/images/Prdpage/Coconut/sel3.webp',
    tags: [
      { label: 'Verified', class: 'verified' },
      { label: 'Traceable', class: 'traceable' }
    ]
  },
  {
    name: 'Tamil Nadu Coconut Estates',
    location: 'Pollachi, Tamil Nadu',
    description:
      'Known for premium matured coconuts and tender coconuts — highly preferred for export due to uniform size and high water content.',
    rating: 4.8,
    image: 'assets/images/Prdpage/Coconut/se1.jpg',
    tags: [
      { label: 'Export Ready', class: 'export' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Karnataka Coconut Growers',
    location: 'Tumkur, Karnataka',
    description:
      'Producers of quality coconuts used for edible, copra, oil extraction and fresh tender coconut supply across India & abroad.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Coconut/sel1.webp',
    tags: [
      { label: 'Organic', class: 'organic' },
      { label: 'Verified', class: 'verified' }
    ]
  },
 
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
      console.log('Avocado Enquiry:', this.formData);
      alert('Your enquiry for bulk avocados has been sent successfully!');
      this.formData = { name: '', email: '', quantity: '' };
    } else {
      alert('Please fill out all fields before submitting.');
    }
  }


 



}
