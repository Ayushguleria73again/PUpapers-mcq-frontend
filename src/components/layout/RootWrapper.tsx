'use client';

import React, { useState, useEffect } from 'react';
import AppIntro from "@/components/layout/AppIntro";
import { AuthProvider } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";

export default function RootWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(false);

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
        {children}
      </ContentProvider>
    </AuthProvider>
  );
}
