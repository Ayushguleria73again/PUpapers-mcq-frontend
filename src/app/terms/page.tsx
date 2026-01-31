import React from 'react';
import Navbar from '@/components/layout/Navbar';

const TermsPage = () => {
    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ padding: '8rem 1rem 4rem', maxWidth: '800px', flex: 1 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Terms of Service</h1>
                
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: '#444' }}>
                        Please read these terms carefully before using PU Papers. By accessing or using our platform, you agree to be bound by these terms. If you don&apos;t agree to any part of these terms, you shouldn&apos;t use our services.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        By accessing this website, you accept these terms and conditions in full. Do not continue to use pupapers.com if you do not accept all of the terms and conditions stated on this page.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. Use License</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        Permission is granted to temporarily download one copy of the materials (information or software) on pupapers.com for personal, non-commercial transitory viewing only.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Disclaimer</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        The materials on pupapers.com are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Limitations</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        In no event shall pupapers.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
