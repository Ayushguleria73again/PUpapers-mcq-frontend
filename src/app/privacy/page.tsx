import React from 'react';
import Navbar from '@/components/layout/Navbar';

const PrivacyPage = () => {
    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ padding: '8rem 1rem 4rem', maxWidth: '800px', flex: 1 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Privacy Policy</h1>
                
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', color: '#444' }}>
                        At pupapers.com, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        We collect information you provide directly to us when you create an account, take a test, or contact us. This may include your name, email address, and academic details.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        <li>To provide and improve our services.</li>
                        <li>To track your progress and generate performance analytics.</li>
                        <li>To send you updates and educational content.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Data Security</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Contact Us</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#444' }}>
                        If you have any questions about this Privacy Policy, please contact us at support@pupapers.com.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
