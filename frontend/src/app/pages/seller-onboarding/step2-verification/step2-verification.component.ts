import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from 'src/app/services/onboarding.service';

interface UploadedDoc {
  id?: string;
  fileName: string;
  preview?: string;
  type: string;
  side?: string;
}

@Component({
  selector: 'app-step2-verification',
  templateUrl: './step2-verification.component.html',
  styleUrls: ['./step2-verification.component.scss'],
  standalone: false
})
export class Step2VerificationComponent implements OnInit {
  sellerId = '';

  // Document uploads
  aadhaarFront: UploadedDoc | null = null;
  aadhaarBack: UploadedDoc | null = null;
  panCard: UploadedDoc | null = null;
  bankProof: UploadedDoc | null = null;
  otherDocs: UploadedDoc[] = [];
  otherDocLabel = '';

  errors: any = {};
  uploading = false;

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sellerId = sessionStorage.getItem('sellerId') || '';
  }

  onFileSelected(event: Event, docType: string, side?: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.errors[docType] = 'Unsupported file format. Please upload JPG, PNG, or PDF.';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      this.errors[docType] = 'File size exceeds 15 MB. Please upload a smaller file.';
      return;
    }

    this.errors[docType] = '';
    this.uploading = true;

    this.onboardingService.uploadDocument(this.sellerId, docType, file, side).subscribe({
      next: (res) => {
        const doc: UploadedDoc = {
          id: res.documentId,
          fileName: file.name,
          type: docType,
          side: side
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => doc.preview = e.target?.result as string;
          reader.readAsDataURL(file);
        }

        if (docType === 'AADHAAR' && side === 'FRONT') this.aadhaarFront = doc;
        else if (docType === 'AADHAAR' && side === 'BACK') this.aadhaarBack = doc;
        else if (docType === 'PAN_CARD') this.panCard = doc;
        else if (docType === 'BANK_PROOF') this.bankProof = doc;
        else if (docType === 'OTHER') this.otherDocs.push(doc);

        this.uploading = false;
      },
      error: () => {
        this.errors[docType] = 'Upload failed. Please try again.';
        this.uploading = false;
      }
    });
  }

  removeDoc(docType: string, side?: string) {
    let docId: string | undefined;
    if (docType === 'AADHAAR' && side === 'FRONT' && this.aadhaarFront) {
      docId = this.aadhaarFront.id;
      this.aadhaarFront = null;
    } else if (docType === 'AADHAAR' && side === 'BACK' && this.aadhaarBack) {
      docId = this.aadhaarBack.id;
      this.aadhaarBack = null;
    } else if (docType === 'PAN_CARD' && this.panCard) {
      docId = this.panCard.id;
      this.panCard = null;
    } else if (docType === 'BANK_PROOF' && this.bankProof) {
      docId = this.bankProof.id;
      this.bankProof = null;
    }

    if (docId) {
      this.onboardingService.deleteDocument(docId).subscribe();
    }
  }

  get hasAadhaar(): boolean {
    return !!(this.aadhaarFront && this.aadhaarBack);
  }

  get canContinue(): boolean {
    return !!this.aadhaarFront || !!this.aadhaarBack || !!this.panCard || !!this.bankProof;
  }

  saveAndContinue() {
    this.errors = {};
    if (!this.canContinue) {
      this.errors.general = 'Please upload at least one document (Aadhaar, PAN, or Bank Proof) to continue.';
      return;
    }

    if (!this.canContinue) return;

    const data = {
      aadhaarFrontDocId: this.aadhaarFront?.id,
      aadhaarBackDocId: this.aadhaarBack?.id,
      panCardDocId: this.panCard?.id,
      bankProofDocId: this.bankProof?.id
    };

    this.onboardingService.saveIdentityInfo(this.sellerId, data).subscribe({
      next: () => {
        this.onboardingService.completeStep2(this.sellerId).subscribe({
          next: () => this.router.navigate(['/onboarding/farm']),
          error: () => alert('Failed to complete step 2. Please try again.')
        });
      },
      error: () => alert('Failed to save identity info. Please try again.')
    });
  }
}
