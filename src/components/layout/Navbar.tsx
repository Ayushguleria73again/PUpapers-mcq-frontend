'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, ChevronDown, User as UserIcon, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import styles from './Navbar.module.css';

import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
  };

  // Hide navbar on login, signup, active quiz pages, and admin panel
  if (
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password' ||
    (pathname.startsWith('/mock-tests/') && pathname !== '/mock-tests') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const exploreLinks = [
    { name: 'Mock Tests', path: '/mock-tests' },
    { name: 'Previous Papers', path: '/previous-papers' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav className={`${styles.navbar} glass`}>
        <div className={`${styles.navContainer} container`}>
          <Link href="/" className={styles.logo}>
            <GraduationCap size={28} className={styles.logoIcon} />
            <p>pu<span>papers</span>.com</p>
          </Link>

          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  href={link.path} 
                  className={`${styles.navLink} ${pathname === link.path ? styles.activeNavLink : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            
            {/* Admin Panel Link removed from main nav, now resides in User Dropdown */}
            
            {/* Dropdown for Explore */}
            <li className={styles.dropdown}>
                <div className={styles.dropdownTrigger}>
                    Explore <ChevronDown size={16} />
                </div>
                <div className={styles.dropdownContent}>
                    {exploreLinks.map((link) => (
                        <Link 
                            key={link.path} 
                            href={link.path}
                            className={styles.dropdownItem}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </li>
          </ul>

          <div className={styles.navActions}>
            {user ? (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownTrigger}>
                    <div className={styles.userAvatar}>
                        {user.profileImage ? (
                            <NextImage 
                                src={user.profileImage} 
                                alt="Profile" 
                                width={32}
                                height={32}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                            />
                        ) : (
                            user.fullName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <span className={styles.userName}>{user.fullName.split(' ')[0]}</span>
                    <ChevronDown size={14} color="#64748b" />
                </div>
                
                <div className={styles.userDropdownContent}>
                    <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserName}>{user.fullName}</div>
                        <div className={styles.dropdownUserEmail}>{user.email}</div>
                    </div>
                    
                    <Link href="/profile" className={styles.dropdownItem}>
                        <UserIcon size={16} /> Profile
                    </Link>
                    <Link href="/dashboard" className={styles.dropdownItem}>
                        <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link href="/admin" className={styles.dropdownItem}>
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    
                    <div className={styles.dropdownDivider} />
                    
                    <button onClick={handleLogout} className={styles.dropdownItem} style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary">
                Get Started
              </Link>
            )}
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.mobileMenuContent}>
              <ul className={styles.mobileNavLinks}>
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={link.path} 
                      className={`${styles.mobileNavLink} ${pathname === link.path ? styles.activeMobileNavLink : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
                
                {/* Admin Panel Link - Mobile */}
                {user && user.role === 'admin' && (
                  <motion.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link 
                      href="/admin" 
                      className={`${styles.mobileNavLink} ${pathname.startsWith('/admin') ? styles.activeMobileNavLink : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: '#ef4444' }} 
                    >
                      <Shield size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} /> Admin Panel
                    </Link>
                  </motion.li>
                )}

                <div style={{ padding: '0.5rem 0', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Explore</div>
                {exploreLinks.map((link, index) => (
                    <motion.li
                        key={link.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + 3) * 0.1 }}
                    >
                        <Link 
                            href={link.path}
                            className={`${styles.mobileNavLink} ${pathname === link.path ? styles.activeMobileNavLink : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    </motion.li>
                ))}
              </ul>

              <div className={styles.mobileMenuActions}>
                {user ? (
                  <>
                    <p className={styles.mobileUserName}>Hi, {user.fullName}!</p>
                    <button onClick={handleLogout} className="btn-primary" style={{ width: '100%' }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
