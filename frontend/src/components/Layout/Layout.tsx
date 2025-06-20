import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Login from '../Login/Login';
import GuestConversion from '../GuestConversion/GuestConversion';
import UserProfile from '../UserProfile/UserProfile';
import JobStatusDisplay from '../JobStatus/JobStatusDisplay';
import { JobResponseDTO } from '../../types';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  user: { userId: string; email?: string; displayName: string; isGuest?: boolean } | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  tokenBalance: number;
  showAuth: boolean;
  showProfile: boolean;
  showJobStatus: boolean;
  currentJob: JobResponseDTO | null;
  onLogout: () => void;
  onTokenBalanceChange: (newBalance: number) => void;
  onShowGuestConversion: () => void;
  onShowProfile: () => void;
  onToggleAuth: () => void;
  onToggleProfile: () => void;
  onCloseJobStatus: () => void;
  onLoginSuccess: (type?: 'login' | 'guest') => void;
  onGuestConversionSuccess: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  isLoggedIn,
  isGuest,
  tokenBalance,
  showAuth,
  showProfile,
  showJobStatus,
  currentJob,
  onLogout,
  onTokenBalanceChange,
  onShowGuestConversion,
  onShowProfile,
  onToggleAuth,
  onToggleProfile,
  onCloseJobStatus,
  onLoginSuccess,
  onGuestConversionSuccess
}) => {
  return (
    <div className="app">
      <Navbar 
        user={isLoggedIn ? user : null}
        onLogout={onLogout}
        isGuest={isGuest && isLoggedIn}
        tokenBalance={tokenBalance}
        onTokenBalanceChange={onTokenBalanceChange}
        onShowGuestConversion={onShowGuestConversion}
        onShowProfile={onShowProfile}
        showProfile={isLoggedIn}
      />
      
      <main className="app-main">
        {children}
      </main>
      
      <Footer />
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div 
            className="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onToggleAuth();
              }
            }}
          >
            <motion.div
              className="auth-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onToggleAuth} className="close-button">×</button>
              {isGuest && user ? (
                <GuestConversion 
                  userId={user.userId}
                  onConversionSuccess={onGuestConversionSuccess}
                  onCancel={onToggleAuth}
                />
              ) : (
                <Login onLoginSuccess={onLoginSuccess} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && isLoggedIn && (
          <motion.div 
            className="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onToggleProfile();
              }
            }}
          >
            <motion.div
              className="auth-modal-content profile-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onToggleProfile} className="close-button">×</button>
              <UserProfile 
                user={user}
                tokenBalance={tokenBalance}
                onTokenBalanceChange={onTokenBalanceChange}
                onClose={onToggleProfile}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Status Modal */}
      <AnimatePresence>
        {showJobStatus && currentJob && (
          <motion.div 
            className="job-status-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onCloseJobStatus();
              }
            }}
          >
            <motion.div 
              className="job-status-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={onCloseJobStatus} className="close-button">×</button>
              <JobStatusDisplay 
                initialJob={currentJob}
                onTokenBalanceChange={onTokenBalanceChange}
                onShowGuestConversion={onShowGuestConversion}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;