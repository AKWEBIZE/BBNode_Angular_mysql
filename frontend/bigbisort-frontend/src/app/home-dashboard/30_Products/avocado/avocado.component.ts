import { Component, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'app-avocado',
    templateUrl: './avocado.component.html',
    styleUrls: ['./avocado.component.scss'],
    standalone: false
})
export class AvocadoComponent implements OnInit {
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


avocadoVarieties = [
    {
      name: 'Hass Avocado',
      description: 'Hass avocados have a bumpy, dark green skin that turns purplish-black when ripe.',
      image: 'assets/images/Prdpage/Avo/hasavo.jpeg' 
    },
    {
      name: 'Fuerte Avocado',
      description: 'This pear-shaped variety has smooth, thin, green skin that remains green even when ripe.',
      image: 'assets/images/Prdpage/Avo/fuetre.webp'
    },
    {
      name: 'Pinkerton Avocado',
      description: 'pear shape and small seed. The skin is green and slightly pebbly, staying green when ripe.',
      image: 'assets/images/Prdpage/Avo/pink.avif'
    },
    {
      name: 'Ettinger Avocado',
      description: 'This is another green-skinned variety, often pear-shaped, with a smooth, glossy skin.',
      image: 'assets/images/Prdpage/Avo/ett.jpeg'
    },
    {
      name: 'Indigenous Avocado',
      description: 'In some parts of South India (like Kerala, Tamil Nadu, Karnataka, and Maharashtra), there are local, often unnamed, varieties that have adapted to the climate.',
      image: 'assets/images/Prdpage/Avo/indi.jpg'
    }
  ];

    avocadoBenefitsLeft = [
    { icon: 'fa-solid fa-heart-pulse', text: 'Supports heart health with healthy fats' },
    { icon: 'fa-solid fa-seedling', text: 'Loaded with vitamins E, K, C, and B6' },
    { icon: 'fa-solid fa-brain', text: 'Enhances brain function and focus' },
    { icon: 'fa-solid fa-bolt', text: 'Boosts energy and metabolism naturally' },
    { icon: 'fa-solid fa-eye', text: 'Improves eye health with lutein and zeaxanthin' },
  ];

  avocadoBenefitsRight = [
    { icon: 'fa-solid fa-weight-scale', text: 'Supports weight management' },
    { icon: 'fa-solid fa-gut', text: 'Aids digestion and gut health with natural fiber' },
    { icon: 'fa-solid fa-droplet', text: 'Promotes glowing skin and healthy hair' },
    { icon: 'fa-solid fa-shield-heart', text: 'Strengthens immunity and reduces inflammation' },
  ];

  processingSteps = [
  {
    title: 'Harvesting & Sorting',
    icon: 'fa-solid fa-seedling',
    description: 'Avocados are hand-picked carefully to avoid bruising. Fruits are sorted based on maturity and size.',
    note: 'Only mature, firm fruits are selected for export and local trade.'
  },
  {
    title: 'Cleaning & Pre-Cooling',
    icon: 'fa-solid fa-fan',
    description: 'Fruits are washed to remove field dirt and cooled to reduce internal heat before packaging.',
    note: 'Recommended pre-cooling temperature: 10–12°C.'
  },
  {
    title: 'Ripening & Storage',
    icon: 'fa-solid fa-temperature-low',
    description: 'Stored in temperature-controlled chambers to ripen uniformly or preserve firmness for shipping.',
    note: 'Optimum storage: 5–7°C, 85–90% RH.'
  },
  {
    title: 'Grading & Packing',
    icon: 'fa-solid fa-box-open',
    description: 'Avocados are graded based on weight, texture, and color; packed in ventilated cartons or crates for export.',
    note: 'Cartons of 4–10 kg are ideal for long-distance trade.'
  }
];

    features = [
      {
        icon: 'fa-solid fa-hand-holding-seedling',
        title: 'Sourced from Trusted Growers',
        description: 'Directly procured from farmers in Karnataka, Tamil Nadu, Kerala & Maharashtra — ensuring traceability and freshness.'
      },
      {
        icon: 'fa-solid fa-certificate',
        title: 'Export-Grade Quality & Certification',
        description: 'Graded for firmness, oil content, and ripeness. Meets APEDA & Global GAP export standards.'
      },
      {
        icon: 'fa-solid fa-seedling',
        title: 'Premium Varieties',
        description: 'Includes Hass, Fuerte, and Indian Green Avocados — handpicked, nutrient-rich, and naturally ripened.'
      },
      {
        icon: 'fa-solid fa-globe',
        title: 'Expanding Global Footprint',
        description: 'Supplying to UAE, Singapore, Japan & Europe with cold-chain enabled logistics and consistent quality.'
      }
    ];


sellers = [
  {
    name: 'Green Valley Farms',
    location: 'Coorg, Karnataka',
    description: 'Leading producer of Hass & Fuerte avocados — naturally ripened, cold-chain ready for export.',
    rating: 4.7,
    image: 'assets/images/Prdpage/Avo/selavo.png',
    tags: [
      { label: 'Verified', class: 'verified' },
      { label: 'Export Ready', class: 'export' }
    ]
  },
  {
    name: 'Nilgiri Harvest Co.',
    location: 'Nilgiris, Tamil Nadu',
    description: 'Premium Indian Green Avocados — sustainably grown, sorted, and packed for retail & B2B supply.',
    rating: 4.5,
    image: 'assets/images/Prdpage/Avo/nilavo.png',
    tags: [
      { label: 'Traceable', class: 'traceable' },
      { label: 'Certified', class: 'graded' }
    ]
  },
  {
    name: 'Wayanad Avocado Estates',
    location: 'Wayanad, Kerala',
    description: 'Organic avocado grower – specializing in tropical hybrids; APEDA registered exporter.',
    rating: 4.6,
    image: 'assets/images/Prdpage/Avo/wdavo.png',
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
