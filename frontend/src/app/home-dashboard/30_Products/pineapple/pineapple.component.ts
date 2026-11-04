import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pineapple',
    templateUrl: './pineapple.component.html',
    styleUrls: ['./pineapple.component.scss'],
    standalone: false
})
export class PineappleComponent implements OnInit {
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
      name: 'Kew Pineapple',
      description: 'Kew is a large, juicy pineapple known for its sweet, low-fiber flesh and mild aroma.it is choice for fresh eating, canning, and juice production.',
      image: 'assets/images/Prdpage/Pineapple/v1.avif' 
    },
    {
      name: 'Queen Pineapple',
      description: 'Queen pineapples are small to medium-sized, offering a very sweet, slightly tart taste with a crisp and fibrous texture.',
      image: 'assets/images/Prdpage/Pineapple/v2.webp' 
    },
    {
      name: 'Mauritius Pineapple',
      description: 'This variety is medium-sized with a deep orange-yellow skin and a rich aroma. Mauritius pineapples are very sweet and juicy with firm flesh.',
      image: 'assets/images/Prdpage/Pineapple/v3.jpg' 
    }
 
  ];

pineappleBenefitsLeft = [
  { icon: 'fa-solid fa-seedling', text: 'Rich in vitamin C and antioxidants' },
  { icon: 'fa-solid fa-gut', text: 'Supports digestion with natural bromelain enzyme' },
  { icon: 'fa-solid fa-bolt', text: 'Provides instant natural energy' },
  { icon: 'fa-solid fa-heart-pulse', text: 'Promotes heart health and better blood circulation' },
  { icon: 'fa-solid fa-face-smile-beam', text: 'Boosts immunity and improves overall wellbeing' },
];



pineappleBenefitsRight = [
  { icon: 'fa-solid fa-weight-scale', text: 'Aids weight management with low calories' },
  { icon: 'fa-solid fa-droplet', text: 'Promotes glowing skin and reduces inflammation' },
  { icon: 'fa-solid fa-shield-heart', text: 'Supports strong immune system and healing' },
  { icon: 'fa-solid fa-apple-whole', text: 'Strengthens bones with manganese and minerals' },
];


processingSteps = [
  {
    title: 'Harvesting & Sorting',
    icon: 'fa-solid fa-seedling',
    description: 'Pineapples are harvested at the mature-ripe stage based on size, aroma, and skin color. Fruits are sorted by crown size, weight, and external appearance.',
    note: 'Only uniform, damage-free pineapples are selected for export.'
  },
  {
    title: 'Washing & Cleaning',
    icon: 'fa-solid fa-fan',
    description: 'Fruits are washed thoroughly to remove field dirt, soil, and debris. Cleaning helps maintain hygiene and improves shelf appearance.',
    note: 'A gentle wash preserves skin quality and prevents microbial contamination.'
  },
  {
    title: 'Pre-Cooling & Storage',
    icon: 'fa-solid fa-temperature-low',
    description: 'Pineapples are pre-cooled to remove field heat and then stored in temperature-controlled areas to maintain sweetness and firmness.',
    note: 'Ideal storage conditions: 7–12°C with 85–90% relative humidity.'
  },
  {
    title: 'Grading & Packing',
    icon: 'fa-solid fa-box-open',
    description: 'Pineapples are graded by size, crown height, sweetness, and appearance. Packed in ventilated, cushioning cartons for safe domestic and export transit.',
    note: 'Standard export cartons: 10–12 kg with proper ventilation.'
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
    name: 'West Bengal Golden Pineapples',
    location: 'Siliguri, West Bengal',
    description:
      'Producers of the famous Kew & Queen pineapples — known for large size, high juice content, and excellent sweetness.',
    rating: 4.8,
    image: 'assets/images/Prdpage/Pineapple/wbpi.avif',
    tags: [
      { label: 'Verified', class: 'verified' },
      { label: 'Export Ready', class: 'export' }
    ]
  },
  {
    name: 'Assam Hills Pineapple Co.',
    location: 'Golaghat, Assam',
    description:
      'Sourced from Assam’s naturally grown hill pineapples — aromatic, low-acidity, and highly preferred for international markets.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Pineapple/aspi.jpg',
    tags: [
      { label: 'Organic', class: 'organic' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Kerala Tropic Pineapple Estates',
    location: 'Vazhakulam, Kerala',
    description:
      'Producers of India’s iconic Vazhakulam Pineapple — GI tagged, juicy, fiber-rich, and grown using natural cultivation methods.',
    rating: 4.9,
    image: 'assets/images/Prdpage/Pineapple/klpi.jpg',
    tags: [
      { label: 'Traceable', class: 'traceable' },
      { label: 'Verified', class: 'verified' }
    ]
  },
  {
    name: 'Karnataka Fresh Pine Co.',
    location: 'Udupi, Karnataka',
    description:
      'Producers of consistently sweet Queen pineapples — sorted, graded and packed for both Indian and export markets.',
    rating: 4.6,
    image: 'assets/images/Prdpage/Pineapple/ka.webp',
    tags: [
      { label: 'Export Ready', class: 'export' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Odisha Pineapple Growers',
    location: 'Mayurbhanj, Odisha',
    description:
      'Known for naturally ripened, fiber-rich pineapples grown in mineral-rich red soil — ideal for processing & fresh export.',
    rating: 4.5,
    image: 'assets/images/Prdpage/Pineapple/or.jpg',
    tags: [
      { label: 'Organic', class: 'organic' },
      { label: 'Verified', class: 'verified' }
    ]
  },
  {
    name: 'Meghalaya Highland Pineapples',
    location: 'Ri-Bhoi, Meghalaya',
    description:
      'Premium hill-grown pineapples — intensely aromatic, high in sweetness, and preferred by premium fresh fruit buyers.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Pineapple/mg.jpg',
    tags: [
      { label: 'Traceable', class: 'traceable' },
      { label: 'Organic', class: 'organic' }
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
