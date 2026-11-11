/* =================================================================
 * PLAYLIST CONFIGURATION
 * ================================================================= */
const PLAYLIST = [
    {
        title: "Losing Focus",
        artist: "Autumn Contagious",
        album: "A Portrait for the Ransom",
        cover: "https://i.scdn.co/image/ab67616d0000b2739c12ad26c4548db67a0bf9d5",
        src: "https://file.garden/ZlwiKgzAvyz0wLRz/songs/Autumn%20Contagious%20-%20Losing%20Focus.mp3",
        isVideo: false,
        requesterName: "lou",
        requesterHandle: "HerWordsKill",
        requesterUrl: "https://github.com/HerWordsKill"
    },
    {
        title: "Winston (1984)",
        artist: "Bita and the Botflies",
        album: "Winston (1984)",
        cover: "https://images.genius.com/599f805a321737d8c2dac8e92cee0c8c.300x300x1.jpg",
        src: "https://file.garden/ZlwiKgzAvyz0wLRz/songs/Bita%20and%20the%20Botflies%20-%20Winston%20(1984)%20Official%20Lyric%20Video%20-%20Bita%20and%20the%20Botflies.mp3",
        isVideo: false,
        requesterName: "serph",
        requesterHandle: "shinminase",
        requesterUrl: "https://github.com/shinminase"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let isMuted = false;
let isDragging = false; // Prevents timeupdate from fighting mouse scrubbing

/* DOM Element References */
const mediaPlayer = document.getElementById('media-player');
const mainArtOverlay = document.getElementById('main-art-overlay');
const mainDisplayCover = document.getElementById('main-display-cover');
const mainDisplayTitle = document.getElementById('main-display-title');
const mainDisplayArtist = document.getElementById('main-display-artist');

const rightThumbArt = document.getElementById('right-thumb-art');
const rightAlbumName = document.getElementById('right-album-name');
const rightRequester = document.getElementById('right-requester');
const playlistItemsContainer = document.getElementById('playlist-items-list');

const headerTrackTitle = document.getElementById('header-track-title');
const statusBarLabel = document.getElementById('status-bar-label');
const barAlbumLabel = document.getElementById('bar-album-label');
const timeMarker = document.getElementById('time-marker');

const playIcon = document.getElementById('play-icon');
const viewportPlayIcon = document.getElementById('viewport-play-icon');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume-bar');

/* Helper Function to Format Seconds into MM:SS */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

window.onload = function() {
    renderPlaylist();
    loadTrack(0);

    // Volume Bar Listener
    volumeBar.addEventListener('input', (e) => {
        mediaPlayer.volume = parseFloat(e.target.value);
    });

    // Seek Bar Scrubbing Listeners (Fixes snapping back bug)
    seekBar.addEventListener('mousedown', () => { isDragging = true; });
    seekBar.addEventListener('touchstart', () => { isDragging = true; });

    seekBar.addEventListener('input', (e) => {
        if (mediaPlayer.duration) {
            const previewTime = (e.target.value / 100) * mediaPlayer.duration;
            if (timeMarker) {
                timeMarker.textContent = formatTime(previewTime);
            }
        }
    });

    seekBar.addEventListener('mouseup', (e) => {
        isDragging = false;
        if (mediaPlayer.duration) {
            mediaPlayer.currentTime = (e.target.value / 100) * mediaPlayer.duration;
        }
    });
    seekBar.addEventListener('touchend', (e) => {
        isDragging = false;
        if (mediaPlayer.duration) {
            mediaPlayer.currentTime = (e.target.value / 100) * mediaPlayer.duration;
        }
    });

    // Time update listener (Only updates if user is not currently dragging)
    mediaPlayer.addEventListener('timeupdate', () => {
        if (mediaPlayer.duration && !isDragging) {
            seekBar.value = (mediaPlayer.currentTime / mediaPlayer.duration) * 100;
            if (timeMarker) {
                timeMarker.textContent = formatTime(mediaPlayer.currentTime);
            }
        }
    });

    // Automatically capture duration once media metadata loads
    mediaPlayer.addEventListener('loadedmetadata', () => {
        if (mediaPlayer.duration) {
            PLAYLIST[currentTrackIndex].duration = formatTime(mediaPlayer.duration);
            renderPlaylist();
        }
    });

    // Auto next track when ended
    mediaPlayer.addEventListener('ended', playNextTrack);
};

/* Render Playlist Queue List in Right Panel Bottom */
function renderPlaylist() {
    playlistItemsContainer.innerHTML = '';

    PLAYLIST.forEach((track, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `wmp-playlist-item ${idx === currentTrackIndex ? 'active' : ''}`;
        itemDiv.onclick = () => selectTrack(idx);

        itemDiv.innerHTML = `
            <span class="truncate pr-1">"${track.title}"</span>
            <span class="font-mono text-[10px] shrink-0">${track.duration || "--:--"}</span>
        `;
        playlistItemsContainer.appendChild(itemDiv);
    });
}

/* Load Track & Update Main Screen + Right Panel Metadata */
function loadTrack(index) {
    currentTrackIndex = index;
    const track = PLAYLIST[index];

    mediaPlayer.src = track.src;

    // Update Main Center Display Art
    mainDisplayCover.src = track.cover;
    mainDisplayTitle.textContent = track.title;
    mainDisplayArtist.textContent = track.artist;

    // Hide art overlay if it's explicitly set as a video file
    if (track.isVideo) {
        mainArtOverlay.classList.add('hidden');
    } else {
        mainArtOverlay.classList.remove('hidden');
    }

    // Update Right Panel Metadata & Requester (Name plain text, Handle/URL clickable link)
    rightThumbArt.src = track.cover;
    rightAlbumName.textContent = track.album;

    if (rightRequester) {
        if (track.requesterName) {
            rightRequester.classList.remove('hidden');
            let requesterHtml = `added by: ${track.requesterName}`;
            
            if (track.requesterHandle) {
                if (track.requesterUrl) {
                    requesterHtml += ` | <a href="${track.requesterUrl}" target="_blank" class="text-blue-200 hover:underline">${track.requesterHandle}</a>`;
                } else {
                    requesterHtml += ` | ${track.requesterHandle}`;
                }
            }
            rightRequester.innerHTML = requesterHtml;
        } else {
            rightRequester.classList.add('hidden');
            rightRequester.innerHTML = '';
        }
    }

    headerTrackTitle.textContent = track.title;
    statusBarLabel.textContent = `${track.title} : ${track.artist}`;
    
    if (barAlbumLabel) {
        barAlbumLabel.textContent = `Album: ${track.album}`;
    }
    if (timeMarker) {
        timeMarker.textContent = track.duration || "00:00";
    }

    mediaPlayer.load();
    seekBar.value = 0;
    renderPlaylist();
}

function togglePlayPause() {
    if (isPlaying) {
        mediaPlayer.pause();
        isPlaying = false;
        playIcon.className = 'fa-solid fa-play ml-0.5';
        viewportPlayIcon.className = 'fa-solid fa-play';
        statusBarLabel.textContent = 'Paused';
    } else {
        mediaPlayer.play().then(() => {
            isPlaying = true;
            playIcon.className = 'fa-solid fa-pause';
            viewportPlayIcon.className = 'fa-solid fa-pause';
            const track = PLAYLIST[currentTrackIndex];
            statusBarLabel.textContent = `${track.title} : ${track.artist}`;
        }).catch(err => console.log('Playback error:', err));
    }
}

function stopMedia() {
    mediaPlayer.pause();
    mediaPlayer.currentTime = 0;
    isPlaying = false;
    playIcon.className = 'fa-solid fa-play ml-0.5';
    viewportPlayIcon.className = 'fa-solid fa-play';
    seekBar.value = 0;
    if (timeMarker) timeMarker.textContent = "00:00";
    statusBarLabel.textContent = 'Stopped';
}

function playNextTrack() {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    selectTrack(nextIdx);
}

function playPrevTrack() {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    selectTrack(prevIdx);
}

function selectTrack(idx) {
    stopMedia();
    loadTrack(idx);
    togglePlayPause();
}

function toggleMute() {
    isMuted = !isMuted;
    mediaPlayer.muted = isMuted;
    document.getElementById('mute-icon').className = isMuted 
        ? 'fa-solid fa-volume-xmark text-[9px] text-red-600' 
        : 'fa-solid fa-volume-high text-[9px]';
}
