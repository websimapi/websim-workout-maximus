const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioCache = {};

async function loadSound(url) {
    if (audioCache[url]) {
        return audioCache[url];
    }

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioCache[url] = audioBuffer;
        return audioBuffer;
    } catch (error) {
        console.error(`Error loading sound: ${url}`, error);
    }
}

export async function playSound(url) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const soundBuffer = await loadSound(url);
    if (soundBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = soundBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
}

// Preload sounds
loadSound('punch.mp3');
loadSound('victory.mp3');

