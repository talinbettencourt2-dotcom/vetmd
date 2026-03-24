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

export default function Privacy() {
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
        <h1 style={{ fontSize:"30px", fontWeight:"700", color:"#111827", letterSpacing:"-0.02em", marginBottom:"8px" }}>Privacy Policy</h1>
        <p style={{ fontSize:"15px", color:"#6b7280", marginBottom:"40px", lineHeight:1.7 }}>
          VetMD is built for veterinary professionals. We take privacy seriously and are committed to being transparent about what we collect and why.
        </p>

        {[
          {
            title: "1. Who we are",
            body: `VetMD ("we", "us", "our") operates the VetMD platform at vetmd.vercel.app — an AI-assisted veterinary research tool for licensed veterinarians and veterinary professionals.`
          },
          {
            title: "2. What data we collect",
            body: `When you create an account: your name and email address.

When you use the platform: the queries you submit, the responses generated, and usage metadata (timestamps, query counts).

Automatically: standard server logs including IP address, browser type, and device information.

We do not collect any patient data, personal health information, or payment card details (payments are handled by Stripe, a PCI-compliant third party).`
          },
          {
            title: "3. Why we collect it",
            body: `Account management: to verify your identity, manage your subscription, and save your chat history.

Product improvement: we review anonymised query patterns to identify where answers can be improved, what topics to prioritise, and how to make the tool more useful for veterinary professionals.

Usage limits: to enforce free tier limits and manage subscription access.

Security: to detect and prevent abuse.`
          },
          {
            title: "4. What we do NOT do",
            body: `We do not sell your data to any third party — ever.

We do not use your queries to train AI models. Your clinical questions remain yours.

We do not share your individual queries or chat history with any third party without your explicit consent, except as required by law.

We do not use your data for advertising purposes.`
          },
          {
            title: "5. How long we keep your data",
            body: `Account data is retained for as long as your account is active. Chat history is retained to provide you with access to past conversations.

If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.

You may request deletion of your data at any time by emailing us.`
          },
          {
            title: "6. Third-party services",
            body: `We use the following third-party services to operate VetMD:

• Anthropic — AI model provider (queries are processed by Anthropic's API per their privacy policy)
• Supabase — database hosting for account and chat data
• Vercel — web hosting and serverless functions
• Stripe — payment processing (we never see your full card details)

Each of these providers operates under their own privacy policies and security standards.`
          },
          {
            title: "7. Your rights",
            body: `You have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data
• Export your chat history
• Withdraw consent at any time

To exercise any of these rights, email us. We will respond within 30 days.`
          },
          {
            title: "8. GDPR (EU users)",
            body: `If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local supervisory authority.

Our lawful basis for processing your data is: contractual necessity (to provide the service), legitimate interests (product improvement), and consent (where applicable).`
          },
          {
            title: "9. Security",
            body: `We implement industry-standard security measures including encrypted data transmission (HTTPS), access controls, and regular security reviews. However, no system is completely secure and we cannot guarantee absolute security.

In the event of a data breach that affects your personal data, we will notify you as required by applicable law.`
          },
          {
            title: "10. Children",
            body: `VetMD is intended for licensed veterinary professionals and is not directed at anyone under 18 years of age. We do not knowingly collect data from minors.`
          },
          {
            title: "11. Changes to this policy",
            body: `We may update this policy from time to time. We will notify registered users of material changes by email. Continued use of VetMD after changes constitutes acceptance of the updated policy.`
          },
          {
            title: "12. Contact",
            body: `For any privacy-related questions or requests, contact us at:\n\nsupport@vetmd.ai`
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
          <span onClick={() => router.push('/terms')} style={{ fontSize:"12px", color:"#9ca3af", cursor:"pointer" }}>Terms of Service</span>
          <span onClick={() => router.push('/')} style={{ fontSize:"12px", color:"#9ca3af", cursor:"pointer" }}>Home</span>
        </div>
      </footer>
    </div>
  );
}
