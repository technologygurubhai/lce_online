let player;
let progressBar;
let progressInterval;
let isSeeking = false; // Flag to track if user is currently seeking
let isPlaying = false; // Flag to track play/pause state
let playbackSpeed = 1.0; // Initial playback speed

function onYouTubeIframeAPIReady() {
    // Empty function; we load the player when needed
}

function loadVideo() {
    const url = document.getElementById('video-url').value;
    const videoId = extractVideoId(url);
    
    if (videoId) {
        if (player) {
            player.destroy(); // Destroy existing player if any
        }

        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'controls': 0, // Hide default controls
                'disablekb': 1 // Disable keyboard controls
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });

        // Set the thumbnail
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        document.getElementById('thumbnail').src = thumbnailUrl;

        // Clear input field
        document.getElementById('video-url').value = '';
    } else {
        alert('Invalid YouTube URL or Video ID');
    }
}

function onPlayerReady(event) {
    document.getElementById('play-pause').addEventListener('click', () => {
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        isPlaying = !isPlaying;
    });

    document.getElementById('speed-up').addEventListener('click', () => {
        changePlaybackSpeed(playbackSpeed + 0.25);
    });

    document.getElementById('speed-down').addEventListener('click', () => {
        changePlaybackSpeed(playbackSpeed - 0.25);
    });

    progressBar = document.getElementById('progress-bar');

    // Initialize progress bar click listener
    progressBar.addEventListener('click', seekVideo);
    progressBar.addEventListener('mousedown', () => {
        isSeeking = true;
    });
    progressBar.addEventListener('mouseup', () => {
        if (isSeeking) {
            isSeeking = false;
            seekVideo(); // Ensure seek when releasing mouse after dragging
        }
    });

    // Display initial duration
    updateDurationDisplay();
    updateSpeedDisplay();
}

function onPlayerStateChange(event) {
    const playPauseButton = document.getElementById('play-pause').firstElementChild;
    if (event.data == YT.PlayerState.PLAYING) {
        playPauseButton.classList.remove('fa-play');
        playPauseButton.classList.add('fa-pause');
        isPlaying = true;
        clearInterval(progressInterval); // Clear any existing interval
        progressInterval = setInterval(updateProgressBar, 1000);
    } else {
        playPauseButton.classList.remove('fa-pause');
        playPauseButton.classList.add('fa-play');
        isPlaying = false;
        clearInterval(progressInterval); // Clear interval when video is paused or stopped
    }
}

function updateProgressBar() {
    if (!isSeeking && player && player.getPlayerState() == YT.PlayerState.PLAYING) {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Update duration display
        updateDurationDisplay();
    }
}

function updateDurationDisplay() {
    const duration = player.getDuration();
    const currentTime = player.getCurrentTime();

    // Calculate remaining duration
    const remainingTime = duration - currentTime;

    // Format duration in minutes and seconds
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Update UI elements
    document.getElementById('current-time').innerText = formatTime(currentTime);
    document.getElementById('remaining-time').innerText = `-${formatTime(remainingTime)}`;
}

function changePlaybackSpeed(speed) {
    if (player && speed >= 0.25 && speed <= 2.0) {
        player.setPlaybackRate(speed);
        playbackSpeed = speed;
        updateSpeedDisplay();
    }
}

function updateSpeedDisplay() {
    document.getElementById('speed-value').innerText = `${playbackSpeed}x`;
}

function seekVideo(event) {
    if (player && player.getPlayerState() != YT.PlayerState.ENDED) {
        const progressBarWidth = progressBar.clientWidth;
        const clickX = event.offsetX;
        const duration = player.getDuration();
        const seekTime = (clickX / progressBarWidth) * duration;
        player.seekTo(seekTime);
    }
}

function extractVideoId(url) {
    // Extract video ID from various YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Event listener for the Load Video button
document.getElementById('load-video').addEventListener('click', loadVideo);
