import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Instrument Sans', sans-serif",
      padding: '20px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap');`}</style>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <svg width="44" height="44" viewBox="0 0 40 40" fill="none" style={{ marginBottom: '10px' }}>
          <rect width="40" height="40" rx="10" fill="#0f4c81"/>
          <circle cx="20" cy="24" r="7" fill="white" opacity="0.95"/>
          <circle cx="13" cy="17" r="3.5" fill="white" opacity="0.95"/>
          <circle cx="20" cy="14" r="3.5" fill="white" opacity="0.95"/>
          <circle cx="27" cy="17" r="3.5" fill="white" opacity="0.95"/>
          <rect x="18.5" y="21" width="3" height="6" rx="1" fill="#0f4c81"/>
          <rect x="17" y="22.5" width="6" height="3" rx="1" fill="#0f4c81"/>
        </svg>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>VetMD</div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>For licensed veterinary professionals</div>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: '420px' },
            card: { borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
            headerTitle: { fontSize: '18px', fontWeight: '700' },
            formButtonPrimary: { background: '#0f4c81', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
            footerActionLink: { color: '#0f4c81' },
          }
        }}
        redirectUrl="/app"
      />
      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '20px', textAlign: 'center', maxWidth: '360px', lineHeight: 1.6 }}>
        VetMD is a research tool designed for licensed veterinarians and veterinary professionals. Not medical advice.
      </p>
    </div>
  )
}
