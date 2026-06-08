import { useScroll } from 'framer-motion';
import React, { useRef } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const server_url = "http://localhost:8000";

var connection = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();

    let socketIdRef = useRef();
    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState();
    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState();
    let [message, setMessage] = useState();

    let [newMessages, setNewMessages] = useState();
    let [askMessages, setAskMessages] = useState();
    let [username, setUsername] = useState(true);

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    return (
        <div>
            VideoMeetComponent

        </div>

    )
}
