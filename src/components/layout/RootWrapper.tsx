'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppIntro from "@/components/layout/AppIntro";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(false);
  const pathname = usePathname();

  // Hide Navbar/Footer on specific routes
  // e.g. /previous-papers/:id (but not /previous-papers list)
  const isPaperView = pathname?.startsWith('/previous-papers/') && pathname.split('/').length > 2;

  useEffect(() => {
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    if (!hasShownIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem('hasShownIntro', 'true');
    setShowIntro(false);
  };

  return (
    <AuthProvider>
      <ContentProvider>
        {showIntro && <AppIntro onFinish={handleIntroFinish} />}
        {!isPaperView && <Navbar />}
        <main style={{ minHeight: '80vh' }}>
            {children}
        </main>
        {!isPaperView && <Footer />}
      </ContentProvider>
    </AuthProvider>
  );
}
