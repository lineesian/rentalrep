import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-6 py-12" style={{ maxWidth: 680 }}>

        {/* Back link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-sm font-body font-semibold mb-8"
          style={{ color: "#0E9E92" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="#0E9E92" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="font-heading font-bold text-3xl mb-1" style={{ color: "#07312C" }}>RentalRep</p>
          <p className="font-heading font-bold text-xl mb-3" style={{ color: "#0E9E92" }}>Privacy Policy</p>
          <p className="text-xs font-body" style={{ color: "#9BA8A5" }}>
            Effective Date: July 2026 | Version: 1.0 (Interim — pending formal legal review)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 font-body text-sm leading-relaxed" style={{ color: "#2D3B39" }}>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>1. Introduction</h2>
            <p className="mb-3">
              RentalRep (Pty) Ltd (&ldquo;RentalRep&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the RentalRep platform at rentalrep.co.za (the &ldquo;Platform&rdquo;). We provide a verified rental reputation service for tenants, landlords, and estate agencies in South Africa.
            </p>
            <p className="mb-3">
              This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;) and other applicable South African privacy legislation.
            </p>
            <p>
              By registering on or using the Platform, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with any part of this policy, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>2. Who We Are</h2>
            <p className="mb-3">
              RentalRep is the Responsible Party for the personal information processed through the Platform, as defined under POPIA.
            </p>
            <p className="mb-1">Information Officer: Linee Sian Havinga</p>
            <p className="mb-1">Contact: privacy@rentalrep.co.za</p>
            <p>Platform: rentalrep.co.za</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>3. What Personal Information We Collect</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>3.1 Account Registration Data</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>South African ID number (for identity verification)</li>
              <li>Role on the Platform (Tenant, Landlord, or Estate Agency)</li>
              <li>Suburb / location</li>
              <li>Profile photograph (optional)</li>
            </ul>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>3.2 Lease Agreement Data</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Property address</li>
              <li>Lease start and end dates</li>
              <li>Uploaded lease agreement documents (PDF)</li>
              <li>Names of other parties to the lease</li>
            </ul>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>3.3 Review and Rating Data</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Written reviews submitted by or about you</li>
              <li>Star ratings across category scores</li>
              <li>Overall reputation score (calculated by the Platform)</li>
              <li>Whether a review was submitted anonymously</li>
            </ul>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>3.4 Payment Data</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Subscription plan selected</li>
              <li>Payment transactions processed via PayFast</li>
            </ul>
            <p className="mb-4">
              Note: We do not store your full credit card or banking details. All payment processing is handled by PayFast, a PCI-DSS compliant payment processor.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>3.5 Technical and Usage Data</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address</li>
              <li>Browser type and device information</li>
              <li>Pages visited and features used on the Platform</li>
              <li>Login timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>4. Why We Collect Your Information (Lawful Basis)</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.1 Consent</p>
            <p className="mb-4">
              By creating an account and submitting reviews, you consent to our collection and use of your personal information for the purposes described in this policy. You may withdraw consent at any time by requesting account deletion (see Section 8).
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.2 Contract Performance</p>
            <p className="mb-4">
              Processing is necessary to provide the services you have requested — including verifying lease agreements, enabling review submissions, and displaying reputation scores.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.3 Legitimate Interest</p>
            <p>
              We process certain data to protect the integrity of the Platform, prevent fraudulent reviews, and improve our services. We have assessed that this interest does not override your rights and freedoms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>5. How We Use Your Information</h2>
            <p className="mb-3">We use your personal information for the following purposes only:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>To create and manage your account</li>
              <li>To verify lease agreements and prevent fraudulent reviews</li>
              <li>To calculate and display your reputation score</li>
              <li>To enable tenants, landlords, and agencies to review each other</li>
              <li>To send you notifications about your account, new reviews, and score changes</li>
              <li>To process subscription payments via PayFast</li>
              <li>To respond to your support queries or complaints</li>
              <li>To detect and prevent abuse, fraud, or violations of our Terms of Service</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>We will not use your personal information for any purpose not listed above without first obtaining your explicit consent.</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>6. Who We Share Your Information With</h2>
            <p className="mb-4">We do not sell your personal information. We share it only in the following limited circumstances:</p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.1 Other Platform Users</p>
            <p className="mb-4">
              Your public profile (name, suburb, role, reputation score, and non-anonymous reviews) is visible to other registered users of the Platform. If you submit a review anonymously, your name will not be displayed, but the review content will be visible.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.2 Estate Agency Subscribers</p>
            <p className="mb-4">
              Agencies with a paid subscription may access your public reputation score and verified review history as part of their tenant screening or landlord verification service. They cannot access your SA ID number, contact details, or any data that is not on your public profile.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.3 Service Providers</p>
            <p className="mb-2">We use third-party service providers to operate the Platform:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Supabase (database and authentication) — data hosted in EU West region</li>
              <li>Vercel (platform hosting) — hosted in the United States</li>
              <li>PayFast (payment processing) — South Africa</li>
            </ul>
            <p className="mb-4">All service providers are bound by data processing agreements and are prohibited from using your data for their own purposes.</p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.4 Legal Requirements</p>
            <p>
              We may disclose your personal information if required to do so by law, court order, or to protect the rights and safety of RentalRep, our users, or the public.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>7. Cross-Border Data Transfers</h2>
            <p>
              Some of the third-party services we use (including Supabase and Vercel) store data outside South Africa. By using the Platform, you consent to this transfer. We take reasonable steps to ensure that any third party receiving your data provides an adequate level of protection consistent with POPIA.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>8. Your Rights Under POPIA</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>8.1 Right to Access</p>
            <p className="mb-4">
              You may request a copy of all personal information we hold about you. We will respond within 30 days of receiving a valid request.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>8.2 Right to Correction</p>
            <p className="mb-4">
              If any of your personal information is inaccurate or incomplete, you may request that we correct it.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>8.3 Right to Deletion</p>
            <p className="mb-4">
              You may request that we delete your account and associated personal information. We will action this within 30 days, subject to any legal obligations that require us to retain certain records.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>8.4 Right to Object</p>
            <p className="mb-4">
              You may object to the processing of your personal information where we rely on legitimate interest as our lawful basis.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>8.5 Right to Withdraw Consent</p>
            <p className="mb-4">
              Where processing is based on your consent, you may withdraw that consent at any time. This will not affect the lawfulness of processing prior to withdrawal.
            </p>

            <p className="mb-1">To exercise any of these rights, please contact us at: privacy@rentalrep.co.za</p>
            <p>We may require you to verify your identity before actioning any request.</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>9. Review Retention Policy</h2>
            <p className="mb-3">
              Reviews are retained on your public profile for a period of seven (7) years from the date of publication, after which they will be archived and removed from public view. You will be notified by email prior to archival.
            </p>
            <p>
              Lease agreement documents uploaded to the Platform are retained for the duration of your account and deleted within 90 days of account closure, unless retention is required for an ongoing dispute.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>10. Data Security</h2>
            <p className="mb-3">
              We take reasonable technical and organisational measures to protect your personal information against unauthorised access, loss, destruction, or alteration. These measures include:
            </p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Row-level security (RLS) on our database, ensuring users can only access their own data</li>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Authentication via Supabase Auth with email verification</li>
              <li>Regular access reviews for any staff or contractors with database access</li>
            </ul>
            <p>
              Despite these measures, no system is completely secure. If you believe your account has been compromised, please contact us immediately at privacy@rentalrep.co.za.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>11. Data Breach Notification</h2>
            <p className="mb-3">In the event of a data breach that is likely to result in harm to you, we will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Notify the Information Regulator as soon as reasonably possible</li>
              <li>Notify affected users within 72 hours of becoming aware of the breach</li>
              <li>Provide details of the nature of the breach, the information affected, and the steps we are taking</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>12. Cookies and Tracking</h2>
            <p>
              The Platform uses essential session cookies required for authentication and to keep you logged in. We do not currently use advertising cookies or third-party tracking cookies. If this changes, we will update this policy and notify you.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>13. Children</h2>
            <p>
              The Platform is not intended for use by persons under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us at privacy@rentalrep.co.za and we will delete the account promptly.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>14. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or an in-app notification at least 14 days before the changes take effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>15. Contact Us</h2>
            <p className="mb-3">For any privacy-related questions, requests, or complaints, please contact our Information Officer:</p>
            <p className="mb-1">Email: privacy@rentalrep.co.za</p>
            <p className="mb-4">Platform: rentalrep.co.za</p>
            <p className="mb-3">
              If you are not satisfied with our response, you have the right to lodge a complaint with the Information Regulator of South Africa:
            </p>
            <p className="mb-1">
              Website:{" "}
              <a href="https://www.justice.gov.za/inforeg" target="_blank" rel="noopener noreferrer" style={{ color: "#0E9E92" }}>
                www.justice.gov.za/inforeg
              </a>
            </p>
            <p className="mb-4">Email: inforeg@justice.gov.za</p>
            <p className="text-xs" style={{ color: "#9BA8A5" }}>
              This is an interim document pending formal legal review by a qualified South African attorney.
            </p>
          </section>

        </div>

        {/* Footer link */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "#E0EBEA" }}>
          <p className="text-sm font-body" style={{ color: "#5E7470" }}>
            Also see our{" "}
            <Link href="/terms" style={{ color: "#0E9E92" }} className="font-semibold">
              Terms of Service
            </Link>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
