const terminal = document.querySelector(".terminal-window");
const minimiseBtn = document.querySelector(".minimise");
const cmd = document.querySelector("#cmd-input");
const termOutput = document.querySelector("#terminal-output");
const container = document.querySelector(".terminal-window"); 


function openTerminal() {
    if (terminal.classList.contains('minimised')) {
        terminal.classList.remove('minimised');
        setTimeout(() => cmd.focus(), 50); 
    }
}

minimiseBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!terminal.classList.contains('minimised')) {
        terminal.classList.add('minimised');
        cmd.blur(); 
    } else {
        openTerminal();
    }
});

cmd.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        const val = cmd.value.trim();

        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');

        const promptSpan = document.createElement('span');
        promptSpan.textContent = 'visitor@集中:~$ ';
        promptSpan.classList.add('prompt'); 

        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = val;
        cmdSpan.classList.add('terminal-text');

        logEntry.appendChild(promptSpan);
        logEntry.appendChild(cmdSpan);

        termOutput.appendChild(logEntry);

        cmd.value = '';
        container.scrollTop = container.scrollHeight;
    }
})
