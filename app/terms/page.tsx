import Link from "next/link";

export const dynamic = "force-dynamic";

export default function TermsPage() {
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
          <p className="font-heading font-bold text-xl mb-3" style={{ color: "#0E9E92" }}>Terms of Service</p>
          <p className="text-xs font-body" style={{ color: "#9BA8A5" }}>
            Effective Date: July 2026 | Version: 1.0 (Interim — pending formal legal review)
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 font-body text-sm leading-relaxed" style={{ color: "#2D3B39" }}>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>1. Agreement to These Terms</h2>
            <p className="mb-3">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the RentalRep platform at rentalrep.co.za (the &ldquo;Platform&rdquo;), operated by RentalRep (Pty) Ltd (&ldquo;RentalRep&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>
            <p className="mb-3">
              By creating an account or using the Platform in any way, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
            </p>
            <p>
              These Terms are governed by the laws of the Republic of South Africa, including but not limited to the Electronic Communications and Transactions Act 25 of 2002 (&ldquo;ECTA&rdquo;), the Consumer Protection Act 68 of 2008 (&ldquo;CPA&rdquo;), and POPIA.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>2. Who May Use RentalRep</h2>
            <p className="mb-3">You may use the Platform if:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>You are 18 years of age or older</li>
              <li>You are a South African resident or operating in the South African rental market</li>
              <li>You are registering as a Tenant, Landlord, or Estate Agency</li>
              <li>You provide accurate and truthful information during registration</li>
            </ul>
            <p>
              By registering, you represent and warrant that all information you provide is accurate, complete, and your own. You may not impersonate another person or create an account on someone else&apos;s behalf without their explicit permission.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>3. Account Registration and Security</h2>
            <p className="mb-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at support@rentalrep.co.za if you suspect any unauthorised access to your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that we reasonably believe have been created with false information, are being used fraudulently, or are in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>4. The Review System</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.1 Verified Reviews Only</p>
            <p className="mb-4">
              All reviews on RentalRep must be tied to a verified lease agreement. You may only submit a review about a person or property with whom you have had a genuine, documented rental relationship. Reviews submitted without a valid lease agreement will be rejected.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.2 Simultaneous Reveal</p>
            <p className="mb-4">
              When both parties to a lease submit reviews, both reviews are held privately until the other party also submits their review, or until 90 days have passed, whichever comes first. After 90 days, a submitted review will be published regardless of whether the other party has responded.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.3 Review Window</p>
            <p className="mb-4">
              The review window opens 14 days before a lease end date and closes 90 days after the lease end date. Reviews submitted outside this window will not be accepted.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.4 Honest and Accurate Reviews</p>
            <p className="mb-2">You agree that all reviews you submit are honest, based on your genuine personal experience, and do not contain:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>False or misleading information</li>
              <li>Content that is defamatory, harassing, or abusive</li>
              <li>Hate speech or discriminatory content of any kind</li>
              <li>Private personal information about another person (e.g., ID numbers, banking details, medical information)</li>
              <li>Content that violates any applicable South African law</li>
            </ul>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.5 Anonymous Reviews</p>
            <p className="mb-4">
              You may choose to post a review anonymously. In this case, your name will not be displayed publicly, but your identity remains known to RentalRep for moderation and dispute purposes. Anonymous reviews are still subject to all content rules above.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>4.6 Review Removal</p>
            <p>
              RentalRep reserves the right to remove any review that violates these Terms, following investigation. If your review is removed, you will be notified by email with the reason.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>5. Prohibited Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>Submit false, fabricated, or misleading reviews or lease agreements</li>
              <li>Use the Platform to harass, intimidate, or threaten any other user</li>
              <li>Attempt to manipulate your own reputation score through fraudulent means</li>
              <li>Access or attempt to access another user&apos;s account or private data</li>
              <li>Scrape, copy, or reproduce Platform content for commercial purposes without written permission</li>
              <li>Use the Platform for any purpose that violates South African law</li>
              <li>Interfere with the technical operation of the Platform</li>
              <li>Use automated scripts or bots to interact with the Platform</li>
            </ul>
            <p>Violation of any of the above may result in immediate account suspension or termination, at our sole discretion.</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>6. Dispute Resolution</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.1 Disputing a Review</p>
            <p className="mb-4">
              If you believe a review about you is factually inaccurate or violates these Terms, you may submit a dispute through the Platform within 30 days of the review being published. You must provide evidence supporting your claim.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.2 Our Moderation Process</p>
            <p className="mb-4">
              We will review all disputes within 14 working days. We may request additional information from either party. Our decision is final but you may appeal once with new evidence. RentalRep&apos;s moderation team makes final decisions; we do not have a legal obligation to remove reviews that are unflattering but truthful.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>6.3 This Is Not a Court</p>
            <p>
              RentalRep is not a dispute resolution body under the Rental Housing Act or any other legislation. If you have a formal legal dispute with a tenant, landlord, or agency, you should contact the Rental Housing Tribunal or seek independent legal advice. RentalRep&apos;s dispute process covers Platform content only.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>7. Subscriptions and Payments</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.1 Free Tier</p>
            <p className="mb-4">
              A basic free account is available to all users with limited features as described on the Platform&apos;s pricing page.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.2 Paid Subscriptions</p>
            <p className="mb-4">
              Paid subscription plans (Tenant Pro, Landlord Pro, Agency plans) are billed monthly in advance. All prices are in South African Rand (ZAR) and include VAT where applicable.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.3 Payment Processing</p>
            <p className="mb-4">
              All payments are processed by PayFast. By subscribing, you authorise PayFast to charge your selected payment method on a recurring monthly basis until you cancel.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.4 Cancellation</p>
            <p className="mb-4">
              You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused portions of a billing period.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.5 Refund Policy</p>
            <p className="mb-4">
              Refunds are assessed on a case-by-case basis. If you believe you have been charged in error, contact us at billing@rentalrep.co.za within 7 days of the charge. We do not offer refunds for change-of-mind cancellations.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>7.6 Quality-Gated Features</p>
            <p>
              Certain premium features (including promotional listings) require a minimum reputation score of 7.5 out of 10. If your score falls below this threshold after subscribing, access to these features will be suspended until your score recovers. No refund is issued for suspension periods resulting from score changes.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>8. Intellectual Property</h2>
            <p className="mb-3">
              All content on the Platform, including the RentalRep name, logo, brand assets, software, and design, is the intellectual property of RentalRep (Pty) Ltd and is protected under South African and international intellectual property law.
            </p>
            <p className="mb-3">
              By submitting a review, you grant RentalRep a non-exclusive, royalty-free licence to display, store, and use your review content on the Platform. You retain ownership of the content you create.
            </p>
            <p>
              You may not copy, reproduce, distribute, or commercially exploit any Platform content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>9. Limitation of Liability</h2>
            <p className="mb-3">To the maximum extent permitted by South African law:</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li>RentalRep provides the Platform on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of any review or reputation score on the Platform</li>
              <li>We are not liable for any direct, indirect, incidental, or consequential loss arising from your use of the Platform, including loss arising from reliance on a reputation score in a tenancy decision</li>
              <li>Our total liability to you for any claim arising from your use of the Platform shall not exceed the amount you paid to us in subscription fees in the 3 months preceding the claim</li>
            </ul>
            <p>Nothing in these Terms limits liability for fraud, gross negligence, or any liability that cannot be excluded under the Consumer Protection Act.</p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>10. POPIA and Your Privacy</h2>
            <p>
              Your personal information is processed in accordance with our Privacy Policy, which is incorporated into these Terms by reference. By agreeing to these Terms, you also acknowledge and accept our Privacy Policy, available at rentalrep.co.za/privacy.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>11. Account Termination</h2>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>11.1 By You</p>
            <p className="mb-4">
              You may close your account at any time by contacting support@rentalrep.co.za. Upon closure, your public profile will be deactivated. Reviews you have submitted about others will remain on their profiles but will no longer display your name if you requested anonymity.
            </p>

            <p className="font-semibold mb-2" style={{ color: "#07312C" }}>11.2 By Us</p>
            <p>
              We may suspend or terminate your account immediately and without notice if you violate these Terms, engage in fraudulent activity, or if we are required to do so by law. We will notify you by email where possible.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email or in-app notification at least 14 days before they take effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated Terms. If you do not accept the updated Terms, you must stop using the Platform and may request account closure.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>13. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms or your use of the Platform that cannot be resolved informally will be subject to the jurisdiction of the South African courts.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-base mb-3" style={{ color: "#07312C" }}>14. Contact</h2>
            <p className="mb-1">Email: legal@rentalrep.co.za</p>
            <p className="mb-1">Support: support@rentalrep.co.za</p>
            <p className="mb-4">Platform: rentalrep.co.za</p>
            <p className="text-xs" style={{ color: "#9BA8A5" }}>
              This is an interim document pending formal legal review by a qualified South African attorney.
            </p>
          </section>

        </div>

        {/* Footer link */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "#E0EBEA" }}>
          <p className="text-sm font-body" style={{ color: "#5E7470" }}>
            Also see our{" "}
            <Link href="/privacy" style={{ color: "#0E9E92" }} className="font-semibold">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
