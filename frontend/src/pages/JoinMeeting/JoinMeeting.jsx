import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkIcon from '@mui/icons-material/Link';
import styles from './JoinMeeting.module.css';

export default function JoinMeeting() {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const extractMeetingId = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // If it looks like a URL (contains '/'), extract the path segment
        try {
            // Handle full URL
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                const url = new URL(trimmed);
                const path = url.pathname.replace(/^\//, '');
                return path || null;
            }
            // Handle partial URL like "localhost:5173/abc-def-ghi"
            if (trimmed.includes('/')) {
                const parts = trimmed.split('/');
                const last = parts[parts.length - 1];
                return last || null;
            }
        } catch {
            // Not a valid URL, treat as meeting ID directly
        }
        // It's a plain meeting ID
        return trimmed;
    };

    const handleJoin = () => {
        const meetingId = extractMeetingId(inputValue);
        if (!meetingId) {
            setError('Please enter a valid meeting link or ID.');
            return;
        }
        setError('');
        navigate(`/${meetingId}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleJoin();
    };

    return (
        <div className={styles.page}>
            {/* Ambient blobs */}
            <div className={styles.blob1} />
            <div className={styles.blob2} />
            <div className={styles.blob3} />

            {/* Nav */}
            <nav className={styles.nav}>
                <Link to="/" className={styles.navBack}>
                    <ArrowBackIcon style={{ fontSize: 18 }} />
                    Back to Home
                </Link>
                <div className={styles.logo}>KairosMeet</div>
            </nav>

            <div className={styles.center}>
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {/* Icon */}
                    <div className={styles.iconWrap}>
                        <MeetingRoomIcon style={{ fontSize: 32, color: '#fff' }} />
                    </div>

                    <h1 className={styles.title}>Join a Meeting</h1>
                    <p className={styles.subtitle}>
                        Enter a meeting link or ID to join an existing meeting.
                    </p>

                    {/* Input */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="meeting-link-input" className={styles.inputLabel}>
                            <LinkIcon style={{ fontSize: 16 }} />
                            Meeting Link or ID
                        </label>
                        <input
                            id="meeting-link-input"
                            type="text"
                            className={`${styles.input} ${error ? styles.inputError : ''}`}
                            placeholder="e.g. https://kairosme.et/abc-1234 or abc-1234"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        {error && <span className={styles.errorMsg}>{error}</span>}
                    </div>

                    {/* Divider */}
                    <div className={styles.orRow}>
                        <div className={styles.orLine} />
                        <span className={styles.orText}>or paste any format</span>
                        <div className={styles.orLine} />
                    </div>

                    {/* Format hint */}
                    <div className={styles.hints}>
                        <div className={styles.hintItem}>
                            <span className={styles.hintDot} />
                            Full URL: <code>https://kairosm.et/abc-1234-xyz</code>
                        </div>
                        <div className={styles.hintItem}>
                            <span className={styles.hintDot} />
                            Meeting ID: <code>abc-1234-xyz</code>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            id="join-meeting-btn"
                            className={styles.joinBtn}
                            onClick={handleJoin}
                            disabled={!inputValue.trim()}
                        >
                            Join Meeting
                            <ArrowForwardIcon style={{ fontSize: 18 }} />
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
