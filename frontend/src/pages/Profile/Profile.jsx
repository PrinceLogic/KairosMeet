import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './profile.css';

export default function Profile() {
    const { userData, isAuthenticated, authLoading, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/auth');
        }
    }, [authLoading, isAuthenticated, navigate]);

    if (authLoading || !userData) {
        return (
            <div className="profile-container">
                <div className="profile-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ color: '#888', fontSize: '1rem' }}>Loading...</div>
                </div>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="profile-container">
            {/* Background blobs */}
            <div className="profile-blob profile-blob-1"></div>
            <div className="profile-blob profile-blob-2"></div>
            <div className="profile-blob profile-blob-3"></div>

            <Link to="/" className="profile-back-link">
                <ArrowLeft size={18} />
                Back to Home
            </Link>

            <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="profile-header">
                    <motion.div
                        className="profile-avatar"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {getInitials(userData.name)}
                    </motion.div>
                    <h1 className="profile-name">{userData.name}</h1>
                    <span className="profile-username">@{userData.username}</span>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-info">
                    <div className="profile-info-title">Account Details</div>

                    <motion.div
                        className="profile-info-row"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <div className="profile-info-icon">
                            <User size={20} />
                        </div>
                        <div className="profile-info-content">
                            <span className="profile-info-label">Full Name</span>
                            <span className="profile-info-value">{userData.name}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="profile-info-row"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <div className="profile-info-icon">
                            <AtSign size={20} />
                        </div>
                        <div className="profile-info-content">
                            <span className="profile-info-label">Username</span>
                            <span className="profile-info-value">@{userData.username}</span>
                        </div>
                    </motion.div>
                </div>

                <motion.button
                    className="profile-logout-btn"
                    onClick={handleLogout}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <LogOut size={18} />
                    Sign Out
                </motion.button>
            </motion.div>
        </div>
    );
}
