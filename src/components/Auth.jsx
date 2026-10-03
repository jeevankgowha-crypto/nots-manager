import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { signInWithGoogle as signInWithFirebaseGoogle, isFirebaseConfigured } from '../firebase';
import { Lock, Mail, Key, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    
    // Check Firebase configuration first
    if (isFirebaseConfigured()) {
      setLoading(true);
      try {
        const user = await signInWithFirebaseGoogle();
        if (user && onLoginSuccess) {
          onLoginSuccess(user);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Firebase Google authentication failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback to Supabase Google Auth
    if (!isSupabaseConfigured) {
      setErrorMessage('Authentication credentials missing! Please configure Firebase or Supabase keys in your .env file.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initialize Google Auth. Ensure Google Provider is enabled in your backend dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data?.user && !data?.session) {
          setSuccessMessage('Registration successful! Please check your email inbox to confirm your account.');
        } else {
          setSuccessMessage('Account created and logged in successfully!');
          if (onLoginSuccess) onLoginSuccess();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        
        {/* Header Icon */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-light)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          {isSignUp ? <UserPlus size={28} /> : <Lock size={28} />}
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          {isSignUp ? 'Create Supabase Account' : 'Admin Portal Login'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {isSignUp 
            ? 'Sign up to create an account backed by Supabase.'
            : 'Sign in to access admin tools & study notes.'
          }
        </p>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1rem 0 1.25rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 0.75rem' }}>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} style={{ shrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-emerald)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1.25rem', justifyContent: 'center' }}
            disabled={loading}
          >
            {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            <span>{loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}</span>
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem', justifyContent: 'center' }}
          >
            <span>{isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onLoginSuccess) {
                onLoginSuccess({ email: 'admin@example.com' });
              }
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--accent-primary)',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            ⚡ Quick Demo Admin Access (Skip Supabase Setup)
          </button>
        </div>

      </div>
    </div>
  );
}
