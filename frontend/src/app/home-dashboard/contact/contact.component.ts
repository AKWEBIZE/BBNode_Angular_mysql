import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';



// Define a type/interface for the contact cards
interface ContactChannel {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  buttonClass: string;
  /** Which login form this card sends the visitor to. */
  loginType: 'buyer' | 'seller';
  /** Where they land once signed in — the dashboard page that chats with the admin team. */
  messagesRoute: string;
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
export class ContactComponent implements OnInit {



contactChannels: ContactChannel[] = [
    {
      icon: 'inventory_2',
      title: 'Buyer Enquiry',
      description: 'Log in to your buyer account to message our team directly. Share your requirements, ask about pricing and availability, and keep every enquiry in one conversation you can come back to anytime.',
      buttonText: 'Send Enquiry',
      buttonClass: 'buyer',
      loginType: 'buyer',
      messagesRoute: '/buyer/messages'
    },
    {
      icon: 'public',
      title: 'Farmer Support',
      description: 'Log in to your seller account to message our team directly. Get help with your listings, discuss buyer enquiries, and keep every conversation with our team in one place you can come back to anytime.',
      buttonText: 'Contact Team',
      buttonClass: 'farmer',
      loginType: 'seller',
      messagesRoute: '/seller/messages'
    }
  ];
  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) { }

  /**
   * Channel cards don't open the enquiry modal — they take the visitor to the login for their
   * role and, once signed in, straight to the dashboard page where they message the admin team.
   * Already signed in as that role? Skip the login step.
   */
  goToChannel(channel: ContactChannel) {
    const expectedRole = channel.loginType === 'seller' ? 'SELLER' : 'BUYER';
    if (this.auth.getRole() === expectedRole) {
      this.router.navigateByUrl(channel.messagesRoute);
      return;
    }
    this.router.navigate(['/login'], {
      queryParams: { type: channel.loginType, returnUrl: channel.messagesRoute }
    });
  }

  // The hero buttons open the Send Enquiry modal (the channel cards go to login instead, see
  // goToChannel). The topic isn't shown in the modal, but is sent with the enquiry so the team
  // email says what the visitor clicked ("Regarding: Buyer Enquiry").
  enquiryOpen = false;
  selectedTopic = 'General Enquiry';

  openEnquiry(topic: string = 'General Enquiry') {
    this.selectedTopic = topic;
    this.enquiryOpen = true;
  }

  ngOnInit(): void {
    // Arriving from a product's "Enquire" button (?topic=...) — open the modal straight away.
    const topic = this.route.snapshot.queryParamMap.get('topic');
    if (topic) {
      this.openEnquiry(topic);
    }
  }






loggedInBuyerTags: { text: string, color: string }[] = [
  { text: "SECURE", color: "yellow" },
  { text: "INSTANT", color: "yellow" },
  { text: "PERSONALIZED", color: "yellow" }
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
