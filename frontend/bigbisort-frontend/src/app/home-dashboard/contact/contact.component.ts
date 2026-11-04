import { Component, OnInit } from '@angular/core';



// Define a type/interface for the contact cards
interface ContactChannel {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonClass: string;
  route: string;
}

interface RegionalContact {
  region: string;
  location: string; // Used for map pointers (e.g., coordinates or unique ID)
  focus: string;
  email: string;
}

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    standalone: false
})
export class ContactComponent {
 


contactChannels: ContactChannel[] = [
    {
      icon: 'inventory_2',
      title: 'Buyer Enquiry',
      description: 'Get quotations, check availability, and logistics details.',
      buttonText: 'Send Enquiry',
      buttonClass: 'buyer',
      route: '/contact/buyer'
    },
    {
      icon: 'public',
      title: 'Farmer Support',
      description: 'Get listed, update your product data, or ask for help.',
      buttonText: 'Contact Team',
      buttonClass: 'farmer',
      route: '/contact/farmer'
    }
  ];
  constructor() { }


  contactData = {
    name: '',
    email: '',
    message: ''
  };

  onSubmit() {
    console.log('Contact Form Submitted:', this.contactData);

    // ✅ Later, you can send this to your backend:
    // this.http.post('http://localhost:8081/bigbisort-imp-exp/contact', this.contactData).subscribe(...);

    alert('Thank you for contacting us, ' + this.contactData.name + '!');
    this.contactData = { name: '', email: '', message: '' }; // reset form
  }




loggedInBuyerTags: { text: string }[] = [
  { text: "SECURE" },
  { text: "INSTANT" },
  { text: "PERSONALIZED" }
];



regionalTeams: RegionalContact[] = [
  {
    region: 'Shimla, HP',
    location: 'shimla', // Used for map pin placement
    focus: 'Apple Exports',
    email: 'hp@bigbisort.com'
  },
  {
    region: 'Srinagar, J&K',
    location: 'srinagar',
    focus: 'Premium Fruits',
    email: 'jk@bigbisort.com'
  },
  {
    region: 'Coimbatore, TN',
    location: 'coimbatore',
    focus: 'Logistics & South Ops',
    email: 'south@bigbisort.com'
  },
  {
    region: 'Chennai (HQ)',
    location: 'chennai',
    focus: 'Corporate & Investor Desk',
    email: 'contact@bigbisort.com'
  }
];


}
