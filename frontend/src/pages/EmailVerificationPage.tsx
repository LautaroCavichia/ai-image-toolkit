import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/authService';
import AnimatedGradientMesh from '../components/AnimatedGradientMesh';
import logo from '../assets/logo.png';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
  if (!token || hasVerified) return;

  setHasVerified(true); 

  handleVerification();
}, [token]);

  const handleVerification = async () => {
    if (!token) return;
    
    try {
      setStatus('verifying');
      const response = await verifyEmail(token);
      
      if (response.success) {
        setStatus('success');
        setMessage(response.message);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      if (error.message.includes('expired')) {
        setStatus('expired');
      } else {
        setStatus('error');
      }
      setMessage(error.message || 'Email verification failed');
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    if (!email) return;
    
    setLoading(true);
    try {
      await resendVerificationEmail(email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="animate-spin text-blue-500" size={48} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={48} />;
      case 'error':
      case 'expired':
        return <XCircle className="text-red-500" size={48} />;
      default:
        return <Mail className="text-gray-500" size={48} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'expired':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      case 'expired':
        return 'Verification Link Expired';
      default:
        return 'Email Verification';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <AnimatedGradientMesh variant="background-removal" intensity="subtle" />
      
      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200/50">
            
            {/* Logo */}
            <div className="text-center mb-8">
              <img 
                src={logo} 
                alt="Pixel Perfect AI" 
                className="w-16 h-16 mx-auto mb-6 drop-shadow-2xl"
              />
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border-2 mb-8 text-center ${getStatusColor()}`}>
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                {getStatusTitle()}
              </h2>
              
              <p className="text-slate-700 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {status === 'success' && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue to Login
                </button>
              )}

              {(status === 'error' || status === 'expired') && (
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Resend Verification Email
                      </>
                    )}
                  </div>
                </button>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/80 hover:bg-white text-slate-700 py-3 px-6 rounded-2xl font-medium transition-all duration-200 hover:shadow-lg border border-slate-200/50"
              >
                Back to Login
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50 text-center">
              <p className="text-slate-600 text-sm">
                <Mail className="inline w-4 h-4 mr-1" />
                Verification links expire after 24 hours for security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;