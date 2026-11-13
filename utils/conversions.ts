/**
 * GA4 conversion events.
 *
 * Sends named events to the gtag.js that _document.tsx already loads, so they
 * land in the same GA4 property as the page views. Nothing personal is sent:
 * no email, name, message text or user id, only the event name and a coarse
 * label (account type, form name). Safe to call anywhere: it does nothing on
 * the server, when gtag has not loaded (ad blockers, consent, local dev), or
 * if gtag throws, so it can never break a signup.
 *
 * Events (mark these as key events in GA4: Admin > Events):
 *   sign_up        an account was created. account_type: teacher | parent | student | organizer
 *   generate_lead  the contact form was sent. form_name: contact
 */

type Params = Record<string, string | number | boolean>;

function send(name: string, params: Params) {
   try {
      if (typeof window === "undefined") return;
      const gtag = (window as any).gtag;
      if (typeof gtag !== "function") return;
      gtag("event", name, params);
   } catch {
      // Analytics must never get in the way of a signup.
   }
}

export type SignupAccountType = "teacher" | "parent" | "student" | "organizer";

/** Call once, after the account was created successfully. */
export function trackSignUp(accountType: SignupAccountType, method: "email" | "google" = "email") {
   send("sign_up", { method, account_type: accountType });
}

/** Call once, after the contact message was accepted by the API. */
export function trackLead(formName: string) {
   send("generate_lead", { form_name: formName });
}
