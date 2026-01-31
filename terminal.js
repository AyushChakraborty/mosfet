const terminal = document.querySelector(".terminal-window");
const minimiseBtn = document.querySelector(".minimise");
const cmd = document.querySelector("#cmd-input");
const termOutput = document.querySelector("#terminal-output");
const container = document.querySelector(".terminal-window"); 
let val = "";


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
        res.textContent = "[cmds coming soon]";
        res.classList.add('terminal-text');
        res.style.marginTop = "5px"; 
        return res;
    }
}
