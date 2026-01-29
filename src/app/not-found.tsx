import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '1rem' }}>
      <div style={{ textAlign: 'center', background: 'white', padding: '4rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
        
        <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(255, 107, 0, 0.1)', marginBottom: '2rem' }}>
            <AlertTriangle size={64} color="#FF6B00" />
        </div>

        <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem', color: '#1a1a1a' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#444' }}>Page Not Found</h2>
        
        <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Oops! The page you are looking for might have been removed or temporarily unavailable.
        </p>
        
        <Link href="/" className="btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
