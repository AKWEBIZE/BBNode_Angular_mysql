import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface RegionalContact {
  region: string;
  location: string; // Used for map     pointers (e.g., coordinates or unique ID)
  focus: string;
  email: string;
}
@Component({
    selector: 'app-banana',
    templateUrl: './banana.component.html',
    styleUrls: ['./banana.component.scss'],
    standalone: false
})
export class BananaComponent implements OnInit {
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
      name: 'Cavendish Banana',
      description: 'Cavendish is the most common banana variety worldwide. It has a mild, sweet flavor and creamy texture, making it ideal for eating fresh.',
      image: 'assets/images/Prdpage/Banana/cvb.jpg' 
    },
    {
      name: 'Robusta Banana',
      description: 'A close relative of Cavendish, Robusta bananas are also widely grown. They have a slightly firmer texture and a good aroma.',
      image: 'assets/images/Prdpage/Banana/rbb.jpg' 
    },
    {
      name: 'Nendran Banana',
      description: 'Nendran is large, starchy, and less sweet when unripe. It is staple in South Indian cuisine, used extensively in savory dishes.',
      image: 'assets/images/Prdpage/Banana/nbb.jpg' 
    },
    {
      name: 'Poovan Banana',
      description: 'Poovan is a popular Indian variety with sweet and tangy flavor.These small to medium-sized bananas have a thin, yellowish-green skin.',
      image: 'assets/images/Prdpage/Banana/pbb.jpg' 
    },
    {
      name: 'Rasthali Banana',
      description: 'Rasthali bananas are medium-sized with a thin, bright yellow skin. They offer a unique sweet and slightly acidic taste with a firm, floury texture, commonly eaten fresh.',
      image: 'assets/images/Prdpage/Banana/rsb.jpg' 
    }
  ];

  bananaBenefitsLeft = [
  { icon: 'fa-solid fa-seedling', text: 'Rich in essential vitamins like B6 and C' },
  { icon: 'fa-solid fa-bolt', text: 'Instant natural energy booster' },
  { icon: 'fa-solid fa-gut', text: 'Supports digestive health with high fiber' },
  { icon: 'fa-solid fa-heart-pulse', text: 'Promotes heart health with potassium' },
  { icon: 'fa-solid fa-face-smile-beam', text: 'Improves mood naturally with tryptophan' },
];


bananaBenefitsRight = [
  { icon: 'fa-solid fa-weight-scale', text: 'Helps maintain healthy weight' },
  { icon: 'fa-solid fa-droplet', text: 'Keeps skin hydrated and glowing' },
  { icon: 'fa-solid fa-shield-heart', text: 'Boosts immunity and reduces fatigue' },
  { icon: 'fa-solid fa-apple-whole', text: 'Supports bone strength with essential minerals' },
];

 processingSteps = [
  {
    title: 'Harvesting & Sorting',
    icon: 'fa-solid fa-seedling',
    description: 'Bananas are harvested at the mature-green stage to ensure perfect ripening during transport. Fruits are sorted based on length, curvature, size, and quality.',
    note: 'Only clean, bruise-free hands are selected for export-grade packing.'
  },
  {
    title: 'Washing & De-Latexing',
    icon: 'fa-solid fa-fan',
    description: 'Freshly harvested bananas are washed to remove field latex, dirt, and impurities before packing. This improves appearance and reduces staining.',
    note: 'De-latexing in clean water prevents marks and enhances shelf life.'
  },
  {
    title: 'Pre-Cooling & Storage',
    icon: 'fa-solid fa-temperature-low',
    description: 'Bananas are pre-cooled to remove field heat and stored in temperature-controlled rooms to maintain freshness.',
    note: 'Ideal storage conditions: 13–14°C, 85–90% RH.'
  },
  {
    title: 'Grading & Packing',
    icon: 'fa-solid fa-box-open',
    description: 'Bananas are graded based on size, weight, and appearance, then packed in ventilated corrugated cartons for safe export.',
    note: '13–18 kg export cartons ensure proper airflow and minimal damage.'
  }
];


features = [
  {
    icon: 'fa-solid fa-hand-holding-seedling',
    title: 'Sourced from Trusted Banana Farmers',
    description: 'Directly procured from growers in Tamil Nadu, Maharashtra, Gujarat, Andhra Pradesh & Karnataka — ensuring traceability and consistent quality.'
  },
  {
    icon: 'fa-solid fa-certificate',
    title: 'Export-Grade Quality & Certification',
    description: 'Bananas are graded for size, appearance, firmness, and sweetness. Complies with APEDA, Global GAP, and international export standards.'
  },
  {
    icon: 'fa-solid fa-seedling',
    title: 'Premium Banana Varieties',
    description: 'Includes Cavendish, Robusta, Poovan, Nendran & Rasthali — naturally grown, nutrient-rich, and hand-selected for freshness.'
  },
  {
    icon: 'fa-solid fa-globe',
    title: 'Strong Global Export Network',
    description: 'Supplying to Middle East, Maldives, Nepal & Bangladesh with efficient cold-chain logistics and reliable packaging solutions.'
  }
];


sellers = [
  {
    name: 'Tamil Nadu Banana Traders',
    location: 'Nagercoil, Tamil Nadu',
    description: 'Leading suppliers of Cavendish & Robusta bananas — farm-direct sourcing with export-ready cold-chain packing.',
    rating: 4.8,
    image: 'assets/images/Prdpage/Banana/t.jpg',
    tags: [
      { label: 'Verified', class: 'verified' },
      { label: 'Export Ready', class: 'export' }
    ]
  },
  {
    name: 'Andhra Premium Bananas',
    location: 'Nellore, Andhra Pradesh',
    description: 'High-quality bananas grown in fertile coastal belts — known for consistent size, sweetness, and long shelf life.',
    rating: 4.6,
    image: 'assets/images/Prdpage/Banana/ap.jpg',
    tags: [
      { label: 'Traceable', class: 'traceable' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Karnataka Green Farms',
    location: 'Chikkaballapur, Karnataka',
    description: 'Producers of premium Poovan & Rasthali bananas — carefully graded and packed for domestic and export shipments.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Banana/ka.webp',
    tags: [
      { label: 'Organic', class: 'organic' },
      { label: 'Verified', class: 'verified' }
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
      console.log('Avocado Enquiry:', this.formData);
      alert('Your enquiry for bulk avocados has been sent successfully!');
      this.formData = { name: '', email: '', quantity: '' };
    } else {
      alert('Please fill out all fields before submitting.');
    }
  }


  
 

}
