import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pepper',
    templateUrl: './pepper.component.html',
    styleUrls: ['./pepper.component.scss'],
    standalone: false
})
export class PepperComponent implements OnInit {
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


PepperVarieties = [
    {
      name: 'Black Pepper',
      description: 'It produced by drying nearly ripe green berries. The drying process causes them to shrivel and turn black, resulting in a pungent, spicy, and aromatic spice widely.',
      image: 'assets/images/Prdpage/Pepper/bp.jpg' 
    },
    {
      name: 'White Pepper',
      description: 'White pepper is made from fully ripe berries. This process yields a lighter-colored, inner seed with a milder, less complex flavor and a slightly earthy note.',
      image: 'assets/images/Prdpage/Pepper/wp.jpg' 
    }
   
 
  ];

pepperBenefitsLeft = [
  { icon: 'fa-solid fa-pepper-hot', text: 'Boosts metabolism and supports natural weight loss' },
  { icon: 'fa-solid fa-shield-halved', text: 'Rich in antioxidants that strengthen immunity' },
  { icon: 'fa-solid fa-spoon', text: 'Improves digestion by stimulating digestive enzymes' },
  { icon: 'fa-solid fa-heart-pulse', text: 'Promotes heart health by reducing bad cholesterol' },
  { icon: 'fa-solid fa-face-smile-beam', text: 'Enhances skin health with anti-inflammatory properties' },
];


 
pepperBenefitsRight = [
  { icon: 'fa-solid fa-fire-flame-simple', text: 'Helps relieve cold and cough with natural warmth' },
  { icon: 'fa-solid fa-brain', text: 'Supports brain function and improves cognitive health' },
  { icon: 'fa-solid fa-bacteria', text: 'Contains antibacterial properties that help fight infections' },
  { icon: 'fa-solid fa-seedling', text: 'Provides essential minerals like calcium, potassium, and iron' },
];



processingSteps = [
  {
    title: 'Harvesting & Collection',
    icon: 'fa-solid fa-seedling',
    description: 'Fully matured pepper spikes are harvested manually when the berries turn from green to slightly yellowish. Spikes are collected and separated from the vines.',
    note: 'Only mature, healthy, and uniform pepper berries are selected for processing.'
  },
  {
    title: 'Cleaning & Sorting',
    icon: 'fa-solid fa-filter',
    description: 'Pepper berries are cleaned to remove dust, stems, immature berries, and foreign particles. High-quality produce is separated using manual or machine sorting.',
    note: 'Proper cleaning ensures purity and enhances flavor quality.'
  },
  {
    title: 'Drying / Fermentation',
    icon: 'fa-solid fa-temperature-low',
    description: 'For black pepper, berries are sun-dried until they turn dark and wrinkled. For white pepper, berries are soaked (fermented) for several days before removing the outer skin, then dried.',
    note: 'Moisture levels must be reduced to 10–12% to maintain shelf life.'
  },
  {
    title: 'Grading & Packing',
    icon: 'fa-solid fa-box-open',
    description: 'Dried pepper is graded based on size, density, color, and pungency. Pepper is then packed in jute bags, vacuum pouches, or food-grade containers for domestic and export markets.',
    note: 'Higher grades include bold, clean, high-density pepper suitable for export.'
  }
];




features = [
  {
    icon: 'fa-solid fa-hand-holding-seedling',
    title: 'Sourced from Premium Pepper-Growing Regions',
    description:
      'Handpicked from trusted farms across Kerala, Karnataka, Tamil Nadu & Sri Lanka — ensuring authentic, high-quality black & white pepper.'
  },
  {
    icon: 'fa-solid fa-certificate',
    title: 'Export-Grade Quality & Certification',
    description:
      'Pepper is graded for size, density, essential oil content, and pungency. Fully compliant with FSSAI, ISO, APEDA & Global GAP quality standards.'
  },
  {
    icon: 'fa-solid fa-pepper-hot',
    title: 'Top Pepper Varieties',
    description:
      'Includes Malabar Garbled, Tellicherry Garbled (TGSEB), Black Pepper ASTA Grade, and Premium White Pepper — known for rich aroma & strong flavor.'
  },
  {
    icon: 'fa-solid fa-globe',
    title: 'Global Export Excellence',
    description:
      'Supplying premium pepper to Middle East, Europe, USA & Asian markets with strong processing, cleaning, grading, and packaging capabilities.'
  }
];




sellers = [
  {
    name: 'Kerala Malabar Pepper Farmers',
    location: 'Idukki, Kerala',
    description:
      'Producers of world-famous Malabar and Tellicherry pepper — known for high piperine content, bold berries, and rich aroma. Sourced from traditional spice-growing estates.',
    rating: 4.9,
    image: 'assets/images/Prdpage/Pepper/kls.jpg',
    tags: [
      { label: 'Verified', class: 'verified' },
      { label: 'High Density', class: 'traceable' }
    ]
  },
  {
    name: 'Karnataka Black Pepper Estates',
    location: 'Coorg, Karnataka',
    description:
      'Specialized in producing bold, handpicked black pepper with superior oil content — highly preferred for premium export markets.',
    rating: 4.8,
    image: 'assets/images/Prdpage/Pepper/kas.jpg',
    tags: [
      { label: 'Export Ready', class: 'export' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Tamil Nadu White Pepper Processors',
    location: 'Pollachi, Tamil Nadu',
    description:
      'Experts in producing clean white pepper through controlled soaking, skin-removal, and sun-drying processes — ensuring uniform color and aroma.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Pepper/tap.jpg',
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
