import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './CreateMeeting.module.css';

function generateMeetingId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const seg = (len) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${seg(4)}-${seg(4)}-${seg(4)}`;
}

export default function CreateMeeting() {
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);
    const [meetingId] = useState(() => generateMeetingId());
    const [copied, setCopied] = useState(false);

    const meetingUrl = `${window.location.origin}/${meetingId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(meetingUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = meetingUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleStartMeeting = () => {
        navigate(`/${meetingId}`);
    };

    return (
        <div className={styles.page}>
            {/* Animated ambient blobs */}
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
                    {/* Icon header */}
                    <div className={styles.iconWrap}>
                        <VideoCallIcon style={{ fontSize: 32, color: '#fff' }} />
                    </div>

                    <h1 className={styles.title}>Your Meeting is Ready</h1>
                    <p className={styles.subtitle}>
                        Share the link below with participants, then start your meeting.
                    </p>

                    {/* Meeting link display */}
                    <div className={styles.linkBox}>
                        <div className={styles.linkLabel}>Meeting Link</div>
                        <div className={styles.linkRow}>
                            <span className={styles.linkText}>{meetingUrl}</span>
                            <button
                                id="copy-meeting-link-btn"
                                className={`${styles.copyBtn} ${copied ? styles.copySuccess : ''}`}
                                onClick={handleCopy}
                            >
                                {copied
                                    ? <><CheckIcon style={{ fontSize: 15 }} /> Copied!</>
                                    : <><ContentCopyIcon style={{ fontSize: 15 }} /> Copy</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Meeting ID display */}
                    <div className={styles.idDisplay}>
                        <span className={styles.idLabel}>Meeting ID</span>
                        <span className={styles.idValue}>{meetingId}</span>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider} />

                    {/* Info tip */}
                    <div className={styles.infoTip}>
                        <span className={styles.infoIcon}>ℹ</span>
                        Anyone with the link can join. You can also share the Meeting ID.
                    </div>

                    {/* Action buttons */}
                    <div className={styles.actions}>
                        <button
                            id="start-meeting-btn"
                            className={styles.startBtn}
                            onClick={handleStartMeeting}
                        >
                            <OpenInNewIcon style={{ fontSize: 18 }} />
                            Start Meeting
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
