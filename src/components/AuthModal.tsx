import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  recordUserLogin, 
  db 
} from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Clock, 
  Database, 
  LogOut, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Key,
  ExternalLink
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [dbUserData, setDbUserData] = useState<any>(null);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Fetch the stored user document from Firestore when logged in
  useEffect(() => {
    if (!currentUser) {
      setDbUserData(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoadingDb(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          setDbUserData(snap.data());
        } else {
          // If first time, record now
          await recordUserLogin(currentUser);
          const freshSnap = await getDoc(userDocRef);
          if (freshSnap.exists()) {
            setDbUserData(freshSnap.data());
          }
        }
      } catch (err: any) {
        console.error('Error reading Firestore user profile:', err);
      } finally {
        setIsLoadingDb(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-In failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      onClose();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#0B132B] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37]">
                Firebase Authentication & Firestore
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              {currentUser ? 'User Profile & Database Record' : 'Sign In to Your Account'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Login information is securely stored in your Firestore database.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {currentUser ? (
          <div className="space-y-5">
            {/* User Badge */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1C2541]/80 border border-white/10">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-14 h-14 rounded-full border-2 border-[#D4AF37] object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                  <User className="w-7 h-7" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-base text-white">
                    {currentUser.displayName || 'Holiday Traveler'}
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{currentUser.email}</span>
                </p>
              </div>
            </div>

            {/* Firestore Stored Login Information Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Stored in Firestore Database</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Path: /users/{currentUser.uid}
                </span>
              </div>

              {isLoadingDb ? (
                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-center text-xs text-slate-400">
                  Loading Firestore record...
                </div>
              ) : dbUserData ? (
                <div className="p-4 rounded-xl bg-[#050814] border border-[#D4AF37]/30 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-1.5">
                    <span>uid:</span>
                    <span className="text-slate-200 truncate max-w-[240px]">{dbUserData.uid}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-1.5">
                    <span>email:</span>
                    <span className="text-emerald-300">{dbUserData.email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-1.5">
                    <span>displayName:</span>
                    <span className="text-white">{dbUserData.displayName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-white/5 pb-1.5">
                    <span>lastLoginAt:</span>
                    <span className="text-[#F3E5AB]">{new Date(dbUserData.lastLoginAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>createdAt:</span>
                    <span className="text-slate-300">{new Date(dbUserData.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-400">
                  Profile synchronization active.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected by Firestore Security Rules</span>
              </span>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form */
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#1C2541] border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Sign in with your Google account to store your reservations, save preferences across devices, and sync your holiday passes to Firestore.
              </p>
            </div>

            {authError && (
              <p className="text-xs text-red-400 p-2.5 rounded-lg bg-red-950/40 border border-red-500/40">
                {authError}
              </p>
            )}

            <div className="pt-2">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#E5C158] hover:shadow-lg transition-all active:scale-95 shadow-md"
              >
                {/* Google G SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Only Google Sign-In is configured for maximum security. Your login record will be stored in Firestore database.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
