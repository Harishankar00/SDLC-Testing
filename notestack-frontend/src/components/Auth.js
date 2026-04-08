import React, { useState } from "react";
import { signUp, confirmSignUp, signIn } from "../api/auth";
import "./Auth.css";

function Auth({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setMessage(""); setError(""); };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await signUp(email, password, name);
      setMessage("Sign up successful! Check your email for the verification code.");
      setTab("verify");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      setMessage("Email verified! You can now sign in.");
      setTab("login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await signIn(email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-logo">N</div>
        <h1 className="auth-title">NoteStack</h1>
        <p className="auth-subtitle">Student Notes & File Sharing Platform</p>

        <div className="auth-tabs">
          <button className={tab === "login" ? "active" : ""} onClick={() => { setTab("login"); clearMessages(); }}>Sign In</button>
          <button className={tab === "signup" ? "active" : ""} onClick={() => { setTab("signup"); clearMessages(); }}>Sign Up</button>
          <button className={tab === "verify" ? "active" : ""} onClick={() => { setTab("verify"); clearMessages(); }}>Verify</button>
        </div>

        {message && <div className="auth-message success">{message}</div>}
        {error && <div className="auth-message error">{error}</div>}

        {tab === "login" && (
          <form onSubmit={handleSignIn} key="login">
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
          </form>
        )}

        {tab === "signup" && (
          <form onSubmit={handleSignUp} key="signup">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Min 8 chars, upper, lower, number, symbol" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
          </form>
        )}

        {tab === "verify" && (
          <form onSubmit={handleVerify} key="verify">
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Verification Code</label>
              <input type="text" placeholder="Enter 6-digit code from email" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify Email"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;
