'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PreviousPapersPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="text-orange-500" size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Previous Papers</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We are digitizing and uploading 10 years of previous year question papers. Stay tuned!
          </p>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center gap-4 text-left mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Coming Very Soon</h3>
                <p className="text-xs text-slate-500">Estimated: 2-3 Days</p>
              </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%] rounded-full" />
            </div>
          </div>

          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 font-semibold hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
