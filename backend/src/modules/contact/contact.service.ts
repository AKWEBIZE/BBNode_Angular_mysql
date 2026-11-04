import type { Contact } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sendMail } from '../../integrations/mail';
import { renderEnquiryMail, renderEnquirySummary } from './contact.template';
import type { ContactRequest, EnquiryRequest } from './contact.schema';

const NOTIFICATION_SUBJECT = 'Enquiry Confirmation:';
const ADMIN_NAME = 'Bigbisort';

/** Java: ContactAssembler.buildModel */
export interface ContactResponse {
  contactId: string;
  name: string | null;
  email: string | null;
  message: string | null;
  phoneNumber: string | null;
  city: string | null;
}

function toContactResponse(entity: Contact): ContactResponse {
  return {
    contactId: entity.id,
    name: entity.name,
    email: entity.email,
    message: entity.message,
    phoneNumber: entity.phoneNumber,
    city: entity.city,
  };
}

/**
 * Java: ContactServiceImpl.addContactInfo.
 *
 * The Java version sent the mail first and saved afterwards, swallowing any
 * mail error. Saving happens first here, so a submission is never lost to an
 * SMTP failure; the mail is still best-effort.
 */
export async function addContactInfo(req: ContactRequest): Promise<ContactResponse> {
  const contact = await prisma.contact.create({
    data: {
      name: req.name,
      email: req.email,
      city: req.city ?? '',
      phoneNumber: req.phoneNumber ?? null,
      message: req.message,
    },
  });

  void sendMail({
    to: req.email,
    subject: NOTIFICATION_SUBJECT,
    html: renderEnquiryMail({
      currentUser: req.email,
      message: req.message,
      currentAdmin: ADMIN_NAME,
      logoUrl: env.MAIL_LOGO_URL,
    }),
  });

  return toContactResponse(contact);
}

/**
 * POST /api/enquiry — called by the Angular enquiry dialog. No Java equivalent.
 *
 * Stores the enquiry on the same CONTACT table, acknowledges to the visitor,
 * and sends the team a summary when MAIL_ENQUIRY_RECIPIENT is set.
 */
export async function submitEnquiry(req: EnquiryRequest): Promise<{ message: string }> {
  // message is VARCHAR(250); comments keeps the full text.
  const summary = (req.comments ?? req.topic ?? '').slice(0, 250);

  await prisma.contact.create({
    data: {
      name: req.name,
      email: req.email,
      city: req.district ?? req.state ?? '',
      phoneNumber: req.contactNumber ?? null,
      message: summary,
      topic: req.topic ?? null,
      loginType: req.loginType,
      state: req.state ?? null,
      district: req.district ?? null,
      companyName: req.companyName ?? null,
      country: req.country ?? null,
      comments: req.comments ?? null,
    },
  });

  void sendMail({
    to: req.email,
    subject: NOTIFICATION_SUBJECT,
    html: renderEnquiryMail({
      currentUser: req.name,
      message: 'Thank you for your enquiry. Our team will get back to you shortly.',
      currentAdmin: ADMIN_NAME,
      logoUrl: env.MAIL_LOGO_URL,
    }),
  });

  if (env.MAIL_ENQUIRY_RECIPIENT) {
    void sendMail({
      to: env.MAIL_ENQUIRY_RECIPIENT,
      subject: `New enquiry from ${req.name}`,
      html: renderEnquirySummary([
        ['Regarding', req.topic],
        ['Name', req.name],
        ['Email', req.email],
        ['I am a', req.loginType],
        ['Contact number', req.contactNumber],
        ['State', req.state],
        ['District', req.district],
        ['Company', req.companyName],
        ['Country', req.country],
        ['Comments', req.comments],
      ]),
    });
  }

  return { message: 'Enquiry submitted successfully' };
}

export interface LoginTypeOption {
  value: string;
  label: string;
}

/**
 * GET /api/enquiry/login-types. The Java backend exposed the same idea at
 * /common/sign-sign-types, but as a map rather than the list the dialog wants.
 */
export function getLoginTypes(): LoginTypeOption[] {
  return [
    { value: 'SELLER', label: 'Seller' },
    { value: 'BUYER', label: 'Buyer' },
  ];
}
