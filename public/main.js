// Global Variables
let localStream;
let peers = {};
let currentCall;

// Initialize PeerJS
const peer = new Peer({
    host: 'localhost',
    port: 3000,
    path: '/peerjs',
    secure: false // Change to true if using HTTPS
});

// Get User Media
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
}).catch(error => {
    console.error('Error accessing media devices.', error);
});

// Update Peer ID in the UI
peer.on('open', id => {
    document.getElementById('peer-id').value = id;
});

// Handle Incoming Calls
peer.on('call', call => {
    call.answer(localStream);
    handleIncomingCall(call);
});

// Connect to a Peer
document.getElementById('connect-button').addEventListener('click', () => {
    const peerId = document.getElementById('connect-id').value;
    if (peerId) {
        connectToPeer(peerId);
    } else {
        alert('Please enter a peer ID to connect.');
    }
});

// Disconnect from all peers
document.getElementById('disconnect-button').addEventListener('click', () => {
    for (let peerId in peers) {
        peers[peerId].close();
    }
    peers = {};
    document.getElementById('remote-video-container').innerHTML = '';
});

// Toggle Audio
let audioEnabled = true;
document.getElementById('mute-button').addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    localStream.getAudioTracks()[0].enabled = audioEnabled;
    document.getElementById('mute-button').textContent = audioEnabled ? 'Mute' : 'Unmute';
});

// Toggle Video
let videoEnabled = true;
document.getElementById('stop-video-button').addEventListener('click', () => {
    videoEnabled = !videoEnabled;
    localStream.getVideoTracks()[0].enabled = videoEnabled;
    document.getElementById('stop-video-button').textContent = videoEnabled ? 'Stop Video' : 'Start Video';
});

// Connect to a Peer
function connectToPeer(peerId) {
    const call = peer.call(peerId, localStream);
    peers[peerId] = call;
    handleIncomingCall(call);
}

// Handle Incoming Call
function handleIncomingCall(call) {
    call.on('stream', remoteStream => {
        addVideoStream(call.peer, remoteStream);
    });

    call.on('close', () => {
        document.getElementById(call.peer).remove();
        delete peers[call.peer];
    });

    call.on('error', err => {
        console.error('Call failed:', err);
        alert('Call failed.');
    });
}

// Add Video Stream to UI
function addVideoStream(peerId, stream) {
    if (document.getElementById(peerId)) {
        return;
    }

    const videoWrapper = document.createElement('div');
    videoWrapper.id = peerId;
    videoWrapper.className = 'video-wrapper';

    const video = document.createElement('video');
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `Peer: ${peerId}`;

    videoWrapper.append(video);
    videoWrapper.append(label);

    document.getElementById('remote-video-container').append(videoWrapper);
}
