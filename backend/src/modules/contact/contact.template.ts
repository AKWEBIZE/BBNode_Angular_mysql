/**
 * Java: resources/email/templates/EnquiryReplayMail.html, rendered by Thymeleaf.
 *
 * The original used th:utext for the message, which injected the submitted text
 * into the email as raw HTML — a visitor could put markup or a link in the
 * contact form and it would render in the admin's mail client. Everything
 * interpolated here is escaped.
 *
 * The logo was inlined as a base64 data URI read from updated_logo.png. Many
 * mail clients block those, so MAIL_LOGO_URL points at a hosted image instead;
 * with no URL set, the header renders without one.
 */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

/** Preserves the line breaks a visitor typed, without allowing other markup. */
function escapeWithBreaks(value: string | null | undefined): string {
  return escapeHtml(value).split('\n').join('<br>');
}

export interface EnquiryMailVars {
  currentUser: string;
  message: string;
  currentAdmin: string;
  logoUrl?: string | null;
  bcc?: boolean;
}

export function renderEnquiryMail(vars: EnquiryMailVars): string {
  const logo = vars.logoUrl
    ? `<img style="max-height: 50px; object-fit: cover" src="${escapeHtml(vars.logoUrl)}" alt="Bigbisort">`
    : '';

  const bccNote = vars.bcc
    ? '<div style="margin-top: 20px;"><h5>This email was BCC to all admins (who opted for email alert)</h5></div>'
    : '';

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body>
<div style="background-color: #0f84f8; height:50px">${logo}</div>
<div style="margin-top: 20px;">
  <h4>
    Hello <b>${escapeHtml(vars.currentUser)}</b>,<br>
    <br>
  </h4>
  <p>${escapeWithBreaks(vars.message)}</p>
</div>
${bccNote}
<div style="margin-top: 20px;">
  <h4>Regards,</h4>
  <h4>${escapeHtml(vars.currentAdmin)}</h4>
</div>
<div class="footer">
  <p align="center">&copy; 2025 &nbsp;Bigbisort Export and Import</p>
</div>
</body>
</html>`;
}

/** Summary sent to the team when an enquiry comes in through the dialog. */
export function renderEnquirySummary(fields: Array<[string, string | null | undefined]>): string {
  const rows = fields
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;"><b>${escapeHtml(label)}</b></td><td style="padding:4px 0;">${escapeWithBreaks(value)}</td></tr>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body>
<h3>New enquiry</h3>
<table cellpadding="0" cellspacing="0">
${rows}
</table>
</body>
</html>`;
}
