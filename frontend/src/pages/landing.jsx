import React, { useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import "../App.css";

const CanvasBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', resize);
        resize();
        // 3D point generation
        const points = [];
        const numPoints = 250;
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: (Math.random() - 0.5) * 1000,
                y: (Math.random() - 0.5) * 1000,
                z: (Math.random() - 0.5) * 1000,
            });
        }
        let angle = 0;
        const render = () => {
            ctx.clearRect(0, 0, width, height);
            angle += 0.0015;
            const focalLength = 400;
            const centerX = width / 2;
            const centerY = height / 2;
            const projected = points.map(p => {
                // Rotate around Y and X axis for a floating 3D effect
                const cosY = Math.cos(angle);
                const sinY = Math.sin(angle);
                const cosX = Math.cos(angle * 0.7);
                const sinX = Math.sin(angle * 0.7);
                // Y rotation
                let x = p.x * cosY - p.z * sinY;
                let z = p.z * cosY + p.x * sinY;

                // X rotation
                let y = p.y * cosX - z * sinX;
                z = z * cosX + p.y * sinX;
                // Move forward so points are visible
                z += 500;
                const scale = focalLength / (focalLength + z);
                return {
                    x: centerX + x * scale,
                    y: centerY + y * scale,
                    scale: scale,
                    z: z
                };
            });
            // Draw lines between nearby points to create a network/mesh
            ctx.lineWidth = 0.6;
            for (let i = 0; i < projected.length; i++) {
                const p1 = projected[i];
                if (p1.z < -focalLength + 50) continue; // Avoid drawing elements behind camera
                for (let j = i + 1; j < projected.length; j++) {
                    const p2 = projected[j];
                    if (p2.z < -focalLength + 50) continue;
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        const opacity = 0.15 - (dist / 100) * 0.15;
                        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
                        ctx.stroke();
                    }
                }
                // Draw points
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, Math.max(0.5, p1.scale * 2.5), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.6, p1.scale * 0.6)})`;
                ctx.fill();
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return <canvas ref={canvasRef} className="canvas-container" />;
};

function LandingPage() {
    const { userData, isAuthenticated, authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (

        <div className="app-container">
            <CanvasBackground />

            <nav className="glass-nav">
                <div className="logo">KairosMeet</div>
                <div className="nav-actions">
                    {authLoading ? null : isAuthenticated ? (
                        <>

                            <Link to="/profile" className="nav-profile-link" title="My Profile">
                                <div className="nav-profile-avatar">
                                    {getInitials(userData?.name)}
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <a href="/auth"><button className="btn btn-ghost">Login</button></a>
                            <a href="/auth"><button className="btn btn-primary">Sign Up</button></a>
                        </>
                    )}
                </div>
            </nav>
            <main className="hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="hero-badge">Next-Gen Meetings</div>
                    <h1 className="hero-title">
                        Where Ideas <br /><span>Meet Reality</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience seamless, crystal-clear virtual meetings with KairosMeet. Elevate your team's collaboration with our cutting-edge platform.
                    </p>
                    <div className="hero-actions">
                        {!authLoading && isAuthenticated ? (
                            <>
                                <button
                                    id="hero-new-meeting-btn"
                                    className="btn btn-primary"
                                    onClick={() => navigate('/create')}
                                >
                                    New Meeting
                                </button>
                                <button
                                    id="hero-join-meeting-btn"
                                    className="btn btn-ghost"
                                    style={{ border: '1.5px solid #ccc' }}
                                    onClick={() => navigate('/join')}
                                >
                                    Join Meeting
                                </button>
                            </>
                        ) : (
                            <a href="/auth">
                                <button
                                    id="hero-start-free-btn"
                                    className="btn btn-primary"
                                    disabled={authLoading}
                                >
                                    Start for free
                                </button>
                            </a>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>

    );
}
export default LandingPage;
