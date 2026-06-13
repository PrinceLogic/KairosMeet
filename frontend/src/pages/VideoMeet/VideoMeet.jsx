import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Badge from '@mui/material/Badge';
import styles from "./videoComponent.module.css";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const routeTo = useNavigate();
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

    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);
    let [askMessages, setAskMessages] = useState();
    let [askForUserName, setAskForUserName] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);


    const getPermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
            else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getPermission();
    }, [])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track = track.stop());

        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id == socketIdRef.current) continue;
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }


    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(() => { })
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { }
        }
    }






    let sendMessage = () => {
        if (message.trim().length > 0) {
            socketRef.current.emit("chat-messages", message, username);
            setMessage("");
        }
    };

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        setNewMessages((prev) => prev + 1);
    };
    let getMessagesFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId != socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type == "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                            }).catch((e) => console.log(e))
                        }).catch((e) => console.log(e))
                    }
                }).catch((e) => console.log(e))
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
            }
        }

    }

    let connectToSocket = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on("signal", getMessagesFromServer);
        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId == socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId == socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            }
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream != undefined && window.localStream != null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }

                })
                if (id == socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 == socketIdRef.current) continue;
                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e));
                        })
                    }
                }
            })
        });
    }


    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
    }

    let connect = () => {
        setAskForUserName(false);
        getMedia();
        connectToSocket();
    }

    let handleVideo = () => {
        setVideo(!video);
        let videoTrack = window.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !video;
        }
    }

    let handleAudio = () => {
        setAudio(!audio);
        let audioTrack = window.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audio;
        }
    }

    let handleScreen = async () => {
        let restoreCamera = async () => {
            setScreen(false);
            try {
                let cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                let cameraTrack = cameraStream.getVideoTracks()[0];

                window.localStream.getVideoTracks().forEach(track => {
                    window.localStream.removeTrack(track);
                    track.stop();
                });
                window.localStream.addTrack(cameraTrack);
                localVideoRef.current.srcObject = window.localStream;

                for (let id in connections) {
                    let videoSender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(cameraTrack);
                    }
                }

                if (!video) {
                    cameraTrack.enabled = false;
                }
            } catch (e) {
                console.log("Failed to restore camera", e);
            }
        };

        if (!screen) {
            try {
                let screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                let screenTrack = screenStream.getVideoTracks()[0];

                window.localStream.getVideoTracks().forEach(track => {
                    window.localStream.removeTrack(track);
                    track.stop();
                });
                window.localStream.addTrack(screenTrack);

                localVideoRef.current.srcObject = window.localStream;

                for (let id in connections) {
                    let videoSender = connections[id].getSenders().find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                }

                screenTrack.onended = restoreCamera;
                setScreen(true);
            } catch (e) {
                console.log("Error sharing screen", e);
            }
        } else {
            restoreCamera();
        }
    }

    let handleEndCall = () => {
        try {
            let tracks = window.localStream.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { }
        routeTo("/");
    }

    return (
        <div>
            {askForUserName == true ?
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" color="primary" onClick={connect}>Connect</Button>

                    <div>
                        <video ref={localVideoRef} autoPlay muted className={`${styles.videoElement} ${styles.localVideo}`}></video>
                    </div>
                </div> :
                <div className={styles.meetContainer}>
                    <div className={styles.mainContainer}>
                        <div className={styles.videoGrid}>
                            <div className={styles.videoContainer}>
                                <video ref={ref => {
                                    localVideoRef.current = ref;
                                    if (ref && window.localStream) {
                                        ref.srcObject = window.localStream;
                                    }
                                }} autoPlay muted className={`${styles.videoElement} ${!screen ? styles.localVideo : ''}`}></video>
                            </div>

                            {videos.map((video) => (
                                <div key={video.socketId} className={styles.videoContainer}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        className={styles.videoElement}
                                    >
                                    </video>
                                </div>
                            ))}
                        </div>

                        {showModal && (
                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    Chat
                                    <IconButton onClick={() => setModal(false)} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </div>
                                <div className={styles.chatWindow}>
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`${styles.chatMessage} ${msg.sender === username ? styles.messageRight : styles.messageLeft}`}>
                                            <div className={styles.chatMessageSender}>{msg.sender}</div>
                                            <div>{msg.data}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.chatInputContainer}>
                                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." size="small" fullWidth onKeyDown={(e) => { if(e.key === 'Enter') sendMessage() }} />
                                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.controlBar}>
                        <IconButton className={`${styles.controlButton} ${!video ? styles.dangerButton : ''}`} onClick={handleVideo}>
                            {(video ? <VideocamIcon /> : <VideocamOffIcon />)}
                        </IconButton>
                        <IconButton className={`${styles.controlButton} ${!audio ? styles.dangerButton : ''}`} onClick={handleAudio}>
                            {(audio ? <MicIcon /> : <MicOffIcon />)}
                        </IconButton>
                        <IconButton onClick={() => { setModal(!showModal); setNewMessages(0); }} className={styles.controlButton}>
                            <Badge badgeContent={newMessages} color="error">
                                <ChatIcon />
                            </Badge>
                        </IconButton>
                        <IconButton className={`${styles.controlButton} ${screen ? styles.dangerButton : ''}`} onClick={handleScreen}>
                            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                        </IconButton>
                        <IconButton className={`${styles.controlButton} ${styles.dangerButton}`} onClick={handleEndCall}>
                            <CallEndIcon />
                        </IconButton>
                    </div>
                </div>
            }
        </div>
    )
}
