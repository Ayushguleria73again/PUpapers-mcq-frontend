'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import styles from './AppIntro.module.css';

interface AppIntroProps {
    onFinish: () => void;
}

const AppIntro: React.FC<AppIntroProps> = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for exit animation to finish before calling onFinish
            setTimeout(onFinish, 1000);
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    className={styles.overlay}
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
                    }}
                >
                    <div className={styles.logoContainer}>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ 
                                duration: 1, 
                                ease: "easeOut",
                                type: "spring",
                                stiffness: 100
                            }}
                        >
                            <NextImage 
                                src="/icon-512x512.png" 
                                alt="PuCET Logo" 
                                width={180} 
                                height={180} 
                                className={styles.logo}
                                priority
                            />
                        </motion.div>
                        
                        {/* Glow Effect */}
                        <motion.div 
                            className={styles.glow}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle, rgba(255,107,0,0.2) 0%, rgba(255,107,0,0) 70%)',
                                zIndex: -1
                            }}
                        />
                    </div>

                    <div className={styles.textContainer}>
                        <motion.h1 
                            className={styles.title}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            PuCET Papers
                        </motion.h1>
                        <motion.p 
                            className={styles.subtitle}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            Elevating Your Preparation
                        </motion.p>
                    </div>

                    <div className={styles.loader}>
                        <motion.div 
                            className={styles.progress}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.2, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppIntro;
