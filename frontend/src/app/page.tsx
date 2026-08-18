"use client";

import React, { useState, useEffect } from "react";
import { Award, Mail, Lock, Smartphone, User, RefreshCw, Eye, EyeOff } from "lucide-react";
// Firebase is loaded dynamically in handleFirebaseGoogleLogin to avoid IndexedDB errors on page load

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | "otp">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [websiteName, setWebsiteName] = useState("EduPremium");

  useEffect(() => {
    fetch("http://localhost:4000/exams/settings/website-name")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.value) setWebsiteName(data.value);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Check if user is already logged in, redirect based on role
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "ADMIN" || parsedUser.role === "SUPERADMIN") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      let endpoint = "http://localhost:4000/auth/login";
      let payload: any = {};

      if (authMode === "login") {
        endpoint = "http://localhost:4000/auth/login";
        payload = { emailOrPhone: email || phone, password };
      } else if (authMode === "register") {
        endpoint = "http://localhost:4000/auth/register";
        payload = { name, email, phone, password, referralCode };
      } else if (authMode === "otp") {
        if (!otpSent) {
          endpoint = "http://localhost:4000/auth/otp/request";
          payload = { phone };
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to request OTP");
          setOtpSent(true);
          setLoading(false);
          alert(`[DEVELOPER OTP SIMULATION]\nUse code: ${data.debugCode}`);
          return;
        } else {
          endpoint = "http://localhost:4000/auth/otp/verify";
          payload = { phone, code: otpCode };
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "ADMIN" || data.user.role === "SUPERADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = () => {
    setName("Alex");
    setEmail("alex@examprep.com");
    setPhone("9988776655");
    setPassword("alex123");
    setAuthMode("login");
    
    // Trigger login
    setLoading(true);
    fetch("http://localhost:4000/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "alex@examprep.com", name: "Alex" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "/dashboard";
        }
      })
      .catch((err) => {
        setErrorMessage("Google auth simulation failed.");
        setLoading(false);
      });
  };

  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock-api-key";
      
      let idToken = "";
      let firebasePhotoURL = "";
      if (isFirebaseConfigured) {
        try {
          const { auth, googleProvider, signInWithPopup } = await import("@/lib/firebase");
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          idToken = await user.getIdToken(true);
          firebasePhotoURL = user.photoURL || "";
        } catch (authErr: any) {
          console.warn("Real Firebase sign-in failed, checking for local fallback. Error:", authErr);
          const confirmFallback = window.confirm(
            `Firebase Sign-In failed: ${authErr.message || "Popup blocked or browser storage shield active"}.\n\nWould you like to log in using a local mock student account instead?`
          );
          if (confirmFallback) {
            const mockPayload = {
              iss: "https://securetoken.google.com/mock-project-id",
              aud: "mock-project-id",
              email: "student@examprep.com",
              name: "Local Tester"
            };
            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const payload = btoa(JSON.stringify(mockPayload));
            idToken = `${header}.${payload}.signature`;
          } else {
            throw authErr;
          }
        }
      } else {
        alert("Notice: Firebase is not configured yet. Simulating login using a mock local student account...");
        const mockPayload = {
          iss: "https://securetoken.google.com/mock-project-id",
          aud: "mock-project-id",
          email: "student@examprep.com",
          name: "Local Tester"
        };
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify(mockPayload));
        idToken = `${header}.${payload}.signature`;
      }
      
      if (!idToken) {
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:4000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken })
      });
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const userWithPhoto = { ...data.user, photoURL: firebasePhotoURL || data.user.photoURL || "" };
        localStorage.setItem("user", JSON.stringify(userWithPhoto));
        if (data.user.role === "ADMIN" || data.user.role === "SUPERADMIN") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      setErrorMessage(err.message || "Google authentication failed.");
      setLoading(false);
    }
  };

  const handleAdminMockLogin = () => {
    setName("Admin");
    setEmail("admin@examprep.com");
    setPhone("9999999999");
    setPassword("admin123");
    setAuthMode("login");
    
    setLoading(true);
    fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: "admin@examprep.com", password: "admin123" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "/admin/dashboard";
        } else {
          throw new Error("Admin login failed");
        }
      })
      .catch((err) => {
        setErrorMessage("Admin login bypass failed.");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Column: Solid Blue Hero */}
      <div className="w-full md:w-1/2 bg-blue-600 dark:bg-blue-700 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-2 rounded-xl">
            <Award className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">{websiteName}</span>
        </div>

        {/* Quote */}
        <div className="my-16 md:my-0 space-y-6 max-w-lg z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight font-sans">
            "The beautiful thing about learning is that no one can take it away from you."
          </h1>
          <p className="text-sm md:text-base text-blue-200 font-semibold">— B.B. King</p>

          {/* Stats card at bottom */}
          <div className="p-6 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-between gap-6">
            <div>
              <p className="text-2xl font-black text-white">1.2M+</p>
              <p className="text-xs text-blue-200 font-medium">STUDENTS</p>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div>
              <p className="text-2xl font-black text-white">4.9/5</p>
              <p className="text-xs text-blue-200 font-medium">GLOBAL RATING</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-xs text-blue-200 z-10">
          © 2024 {websiteName} Academy. All rights reserved.
        </p>

        {/* Backdrop blob lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* Right Column: Clean Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-500 font-medium">
              Elevate your potential with {websiteName} today.
            </p>
          </div>

          {/* Social login */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={handleFirebaseGoogleLogin}
              disabled={loading}
              className="flex-grow py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.14-3.14C17.43 1.68 14.9 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.03 7.14 8.78 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.15-1.98 3.74-4.89 3.74-8.56z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.1 14.7c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.5 7.3C.55 9.22 0 11.35 0 13.6s.55 4.38 1.5 6.3l3.6-2.9-1-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.68-2.85c-1.12.75-2.56 1.2-4.28 1.2-3.22 0-5.97-2.1-6.95-5.26l-3.6 2.8C3.4 20.35 7.35 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 tracking-wider">OR USE EMAIL</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {authMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                required={authMode !== "otp"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            {authMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  placeholder="8888888888"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            )}

            {authMode !== "otp" && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => alert("Please contact support to reset password.")}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            )}

            {authMode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Referral Code (Optional)</label>
                <input
                  type="text"
                  placeholder="WELCOME30"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            )}

            {authMode === "otp" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  placeholder="8888888888"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            )}

            {authMode === "otp" && otpSent && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Verification OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6 digit code"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none text-center font-bold tracking-widest"
                />
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                ⚠️ {errorMessage}
              </p>
            )}

            {/* Remember me check */}
            {authMode === "login" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : authMode === "login" ? "Log In" : authMode === "otp" && !otpSent ? "Request OTP" : "Submit"}
            </button>
          </form>

          {/* Alternate links */}
          <div className="text-center space-y-3">
            <div className="text-xs text-slate-500 font-semibold">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => { setAuthMode("register"); setErrorMessage(""); }} className="text-blue-600 font-bold hover:underline">
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setAuthMode("login"); setErrorMessage(""); }} className="text-blue-600 font-bold hover:underline">
                    Log In
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => {
                setAuthMode(authMode === "otp" ? "login" : "otp");
                setOtpSent(false);
                setErrorMessage("");
              }}
              className="text-xs text-slate-500 hover:text-slate-700 font-bold hover:underline block mx-auto"
            >
              {authMode === "otp" ? "Bypass OTP: Go to Email Log In" : "Try Simulated Phone OTP Bypass Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
