import { useRouter } from 'next/router';

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#0f4c81"/>
      <circle cx="20" cy="24" r="7" fill="white" opacity="0.95"/>
      <circle cx="13" cy="17" r="3.5" fill="white" opacity="0.95"/>
      <circle cx="20" cy="14" r="3.5" fill="white" opacity="0.95"/>
      <circle cx="27" cy="17" r="3.5" fill="white" opacity="0.95"/>
      <rect x="18.5" y="21" width="3" height="6" rx="1" fill="#0f4c81"/>
      <rect x="17" y="22.5" width="6" height="3" rx="1" fill="#0f4c81"/>
    </svg>
  );
}

export default function Terms() {
  const router = useRouter();
  const updated = "March 23, 2026";

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"'Instrument Sans','Helvetica Neue',sans-serif", color:"#111827" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box}`}</style>

      <nav style={{ borderBottom:"1px solid #f3f4f6", padding:"0 32px", height:"56px", display:"flex", alignItems:"center", gap:"10px" }}>
        <div onClick={() => router.push('/')} style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
          <Logo size={26} />
          <span style={{ fontSize:"16px", fontWeight:"700", color:"#111827" }}>VetMD</span>
        </div>
      </nav>

      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"60px 24px 80px" }}>
        <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"8px" }}>Last updated: {updated}</p>
        <h1 style={{ fontSize:"30px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", marginBottom:"8px" }}>Terms of Service</h1>
        <p style={{ fontSize:"15px", color:"#6b7280", marginBottom:"40px", lineHeight:1.7 }}>
          Please read these terms carefully before using VetMD. By accessing or using VetMD, you agree to be bound by these terms.
        </p>

        {[
          {
            title: "1. Who can use VetMD",
            body: `VetMD is designed for licensed veterinarians, veterinary students, veterinary nurses, and other trained veterinary professionals. By using VetMD you represent that you are a veterinary professional with the training to independently evaluate clinical information.

VetMD is not intended for use by members of the general public as a substitute for veterinary care.`
          },
          {
            title: "2. What VetMD is",
            body: `VetMD is an AI-assisted research tool that retrieves and synthesises peer-reviewed veterinary literature and clinical references. It is designed to support clinical decision-making — not to replace it.

VetMD is NOT:
• Veterinary medical advice
• A diagnostic tool
• A substitute for professional veterinary judgment
• A replacement for consulting primary sources

All outputs should be independently verified. Always apply your own professional judgment.`
          },
          {
            title: "3. No medical advice",
            body: `Nothing on VetMD constitutes veterinary medical advice, diagnosis, or treatment. The information provided is for research and reference purposes only.

VetMD and its operators are not liable for any clinical decisions made based on information provided by the platform. You use VetMD at your own professional discretion and risk.`
          },
          {
            title: "4. Accuracy of information",
            body: `VetMD uses AI to synthesise information from third-party sources including PubMed, Europe PMC, OpenAlex, and Semantic Scholar. While we strive for accuracy, AI systems can make errors, omit information, or produce outdated content.

We make no warranties, express or implied, about the accuracy, completeness, or timeliness of any information provided. Always verify critical clinical information against current primary sources and official guidelines.`
          },
          {
            title: "5. Your account",
            body: `You are responsible for maintaining the security of your account credentials. You must not share your account with others or use VetMD on behalf of someone else without authorisation.

We reserve the right to suspend or terminate accounts that violate these terms, are used fraudulently, or that we reasonably believe are being misused.`
          },
          {
            title: "6. Acceptable use",
            body: `You agree not to:

• Use VetMD to provide veterinary advice to members of the public as a substitute for professional consultation
• Attempt to circumvent usage limits or access controls
• Use VetMD for any unlawful purpose
• Attempt to reverse-engineer, scrape, or copy VetMD's systems or outputs at scale
• Submit content that is illegal, harmful, or violates third-party rights`
          },
          {
            title: "7. Subscription and billing",
            body: `Free tier: VetMD offers limited free access to all registered users.

Paid plans: Premium features require a paid subscription. Subscriptions are billed monthly or annually as selected at checkout. You may cancel at any time and will retain access until the end of your billing period.

Refunds: We offer a 7-day refund on annual subscriptions if you are not satisfied. Monthly subscriptions are non-refundable once the billing period has started.

We reserve the right to change pricing with 30 days notice to existing subscribers.`
          },
          {
            title: "8. Intellectual property",
            body: `VetMD and its underlying technology are owned by VetMD and its operators. The AI-generated responses are provided for your personal professional use and may not be reproduced, distributed, or published at scale without permission.

Third-party content retrieved from databases such as PubMed remains subject to the copyright of the original publishers.`
          },
          {
            title: "9. Limitation of liability",
            body: `To the maximum extent permitted by law, VetMD and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to clinical outcomes, lost profits, or data loss — arising from your use of the platform.

Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.`
          },
          {
            title: "10. Indemnification",
            body: `You agree to indemnify and hold harmless VetMD and its operators from any claims, damages, or expenses (including legal fees) arising from your use of the platform, violation of these terms, or infringement of any third-party rights.`
          },
          {
            title: "11. Changes to these terms",
            body: `We may update these terms from time to time. We will notify registered users of material changes by email at least 14 days before they take effect. Continued use after that date constitutes acceptance of the updated terms.`
          },
          {
            title: "12. Governing law",
            body: `These terms are governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Texas.`
          },
          {
            title: "13. Contact",
            body: `For questions about these terms, contact us at:\n\nsupport@vetmd.ai`
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom:"32px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#111827", marginBottom:"10px" }}>{section.title}</h2>
            <div style={{ fontSize:"14px", color:"#374151", lineHeight:1.8, whiteSpace:"pre-line" }}>{section.body}</div>
          </div>
        ))}
      </div>

      <footer style={{ borderTop:"1px solid #f3f4f6", padding:"20px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:"12px", color:"#9ca3af" }}>© 2026 VetMD</span>
        <div style={{ display:"flex", gap:"20px" }}>
          <span onClick={() => router.push('/privacy')} style={{ fontSize:"12px", color:"#9ca3af", cursor:"pointer" }}>Privacy Policy</span>
          <span onClick={() => router.push('/')} style={{ fontSize:"12px", color:"#9ca3af", cursor:"pointer" }}>Home</span>
        </div>
      </footer>
    </div>
  );
}
