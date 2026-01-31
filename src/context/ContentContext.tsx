'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Subject {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  streams?: string[];
}

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  description: string;
  subject: string;
  order: number;
}

type StreamType = 'medical' | 'non-medical' | null;

interface ContentContextType {
  subjects: Subject[];
  loadingSubjects: boolean;
  activeStream: StreamType;
  setActiveStream: (stream: StreamType) => void;
  getChapters: (subjectId: string) => Promise<Chapter[]>;
  streams: {
    medical: Subject[];
    non_medical: Subject[];
  };
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [activeStream, setActiveStream] = useState<StreamType>(null);
  const [chapterCache, setChapterCache] = useState<Record<string, Chapter[]>>({});

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/subjects`);
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  const getChapters = async (subjectId: string): Promise<Chapter[]> => {
    if (chapterCache[subjectId]) {
      return chapterCache[subjectId];
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/chapters?subjectId=${subjectId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setChapterCache(prev => ({ ...prev, [subjectId]: data }));
        return data;
      }
    } catch (err) {
      console.error(`Failed to fetch chapters for subject ${subjectId}`, err);
    }
    return [];
  };

  const streams = {
    medical: subjects.filter(s => s.streams?.includes('medical')),
    non_medical: subjects.filter(s => s.streams?.includes('non-medical'))
  };

  return (
    <ContentContext.Provider
      value={{
        subjects,
        loadingSubjects,
        activeStream,
        setActiveStream,
        getChapters,
        streams
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
