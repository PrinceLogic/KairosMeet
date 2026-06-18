import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import httpStatus from 'http-status';
import { AuthContext } from './AuthContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const client = axios.create({
    baseURL: `${backendUrl}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const router = useNavigate();

    // On mount, check localStorage for an existing token and fetch user info
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            client.get("/get-user-info", {
                headers: { Authorization: token }
            })
                .then((res) => {
                    setUserData(res.data);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    // Token is invalid or expired — clear it
                    localStorage.removeItem("token");
                    setUserData(null);
                    setIsAuthenticated(false);
                })
                .finally(() => {
                    setAuthLoading(false);
                });
        } else {
            setAuthLoading(false);
        }
    }, []);

    const handleRegister = async ({ name, username, password }) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });
            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async ({ username, password }) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });
            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                setUserData({
                    name: request.data.name,
                    username: request.data.username
                });
                setIsAuthenticated(true);
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUserData(null);
        setIsAuthenticated(false);
        router("/");
    };

    const data = {
        userData,
        setUserData,
        isAuthenticated,
        authLoading,
        handleRegister,
        handleLogin,
        handleLogout
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
