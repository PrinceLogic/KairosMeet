import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './auth.css';
import { AuthContext } from '../../contexts/AuthContext';

export default function Authentication() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { handleLogin, handleRegister } = useContext(AuthContext);
    const router = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await handleLogin({ username, password });
                router('/');
            } else {
                await handleRegister({ name, username, password });
                setIsLogin(true);
                setPassword('');
                setError('Registration successful. Please sign in.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Ambient Background */}
            <div className="auth-bg-blob blob-1"></div>
            <div className="auth-bg-blob blob-2"></div>
            <div className="auth-bg-blob blob-3"></div>

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="auth-header">
                    <h1 className="auth-title">Welcome to KairosMeet</h1>
                    <p className="auth-subtitle">
                        {isLogin ? 'Sign in to your account to continue' : 'Create an account to get started'}
                    </p>
                </div>

                <div className="auth-toggle">
                    <button
                        className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`auth-message`}
                            style={{
                                color: error.includes('successful') ? '#4caf50' : '#f44336',
                                marginBottom: '1rem',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                padding: '0.5rem',
                                backgroundColor: error.includes('successful') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                borderRadius: '0.375rem'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="name-input"
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div className="input-group">
                                    <User className="input-icon" />
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="Full Name"
                                        required={!isLogin}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group">
                        <User className="input-icon" />
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" />
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {isLogin && (
                        <a href="#" className="forgot-password">Forgot password?</a>
                    )}

                    <motion.button
                        className="auth-submit"
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!loading && <ArrowRight size={18} />}
                    </motion.button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <div className="social-auth">
                    <button className="social-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className="social-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                            <path d="M16.671 15.542l.532-3.469h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V5.006s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.633H7.078v3.469h3.047v8.385a12.09 12.09 0 003.875 0v-8.385h2.671z" fill="#ffffff" />
                        </svg>
                        Facebook
                    </button>
                </div>
            </motion.div>
        </div>
    );
}