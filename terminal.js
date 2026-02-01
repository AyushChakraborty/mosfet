const terminal = document.querySelector(".terminal-window");
const minimiseBtn = document.querySelector(".minimise");
const cmd = document.querySelector("#cmd-input");
const termOutput = document.querySelector("#terminal-output");
const container = document.querySelector(".terminal-window"); 
let val = "";
let currentAudio = new Audio();
const island = document.getElementById('dynamic-island');
const trackNameDisplay = document.getElementById('track-name');
const albumArt = document.getElementById('album-art');
const trackTitle = document.getElementById('track-title');
const artistName = document.getElementById('artist-name');


const songDatabase = {
    "track1.mp3": {
        title: "Tokyo Reggie",
        artist: "Masayoshi Takanaka",
        art: "music/art/track1.jpeg" 
    },
    "track2.mp3": {
        title: "It Ain't Over 'Til It's Over",
        artist: "Lenny Kravitz",
        art: "music/art/track2.jpeg"
    }
};

function openTerminal() {
    if (terminal.classList.contains('minimised')) {
        terminal.classList.remove('minimised');
        setTimeout(() => cmd.focus(), 50); 
    }
}

minimiseBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    terminal.classList.add('minimised');
    cmd.blur(); 
});

terminal.addEventListener('click', () => {
    if (terminal.classList.contains('minimised')) {
        openTerminal();
    } 
    //if it's already open, clicking the background focuses the input
    else {
        //check if user is highlighting text first, don't steal focus if selecting
        if (window.getSelection().toString() === '') {
            cmd.focus();
        }
    }
});

cmd.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        val = cmd.value.trim();

        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');

        const cmdLine = document.createElement('div');
        cmdLine.classList.add('cmd-line'); 

        const promptSpan = document.createElement('span');
        promptSpan.textContent = 'visitor@集中:~$ ';
        promptSpan.classList.add('prompt'); 

        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = val;
        cmdSpan.classList.add('terminal-text');

        cmdLine.appendChild(promptSpan);
        cmdLine.appendChild(cmdSpan);

        logEntry.appendChild(cmdLine);
        const result = handleCmd(val);
        
        if (result) {
             logEntry.appendChild(result);
        }

        termOutput.appendChild(logEntry);

        cmd.value = '';
        container.scrollTop = container.scrollHeight;
    }
})

function handleCmd(cmd) {
    if (cmd === "help") {
        const res = document.createElement('div'); 
        res.innerHTML = "Available commands:<br>- aplay [filename]: Play music<br>- stop: Stop music";
        res.classList.add('terminal-text');
        res.style.marginTop = "5px"; 
        return res;
    }

    const args = cmd.split(' ');

    if (args[0] == "aplay") {
        const songFile = args[1];

        if (!songFile) {
            return createErrorMsg("Usage: aplay <filename>");
        }

        if (!songDatabase[songFile]) {
            return createErrorMsg(`Error: Track '${songFile}' not found in library.`);
        }

        playMusic(songFile);

        const res = document.createElement('div');
        res.textContent = `Playing ${songFile}...`;
        res.classList.add('terminal-text');
        res.style.marginTop = "5px";
        return res;
    }

    else if (cmd === "stop") {
        stopMusic();
        const res = document.createElement('div');
        res.textContent = "Music stopped";
        res.classList.add('terminal-text');
        res.style.marginTop = "5px";
        return res;
    }
}

function playMusic(filename) {
    currentAudio.pause();

    currentAudio.src = `music/${filename}`;

    currentAudio.play().then(() => {
        island.classList.remove("island-hidden");
        island.classList.add("island-active");

        const data = songDatabase[filename];

        if (data) {
            trackTitle.textContent = data.title;
            artistName.textContent = data.artist;
            albumArt.src = data.art;
            albumArt.style.display = "block"; // Show image
        } 
    }).catch(error => {
        console.error("Audio error:", error);
        const err = createErrorMsg(`Error: Could not load audio file for '${filename}'.`);
        
        termOutput.appendChild(err);
        container.scrollTop = container.scrollHeight;
        stopMusic();
    });

    currentAudio.onended = () => {
        stopMusic();
    };
}

function stopMusic() {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    
    // Shrink the island back
    island.classList.remove('island-active');
    island.classList.add('island-hidden');
}

function createErrorMsg(text) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.color = "#ff5555"; 
    div.style.fontFamily = "monospace";
    div.style.marginTop = "5px";
    return div;
}
