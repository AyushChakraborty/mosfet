const shipImage = document.querySelector('#ship');

let move = false;

let shipX = 0;
let shipY = 0;

let targetX = 0;
let targetY = 0;

let initialLeft = 0;
let initialTop = 0;
let initialized = false; // To ensure we only capture home once

let currentAngle = 0;
let time = 0; 

// Mouse tracking
window.addEventListener('mousemove', (e) => {
    if (move) {
        targetX = e.clientX;
        targetY = e.clientY;
    }
});

document.getElementById('continue-btn').addEventListener('click', function() {
    const overlay = document.getElementById('mobile-warning');
    
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);
});

// Click to toggle movement
shipImage.addEventListener('click', () => {
    if (!move) {
        const rect = shipImage.getBoundingClientRect();

        if (!initialized) {
            initialLeft = rect.left;
            initialTop = rect.top;
            
            shipX = initialLeft;
            shipY = initialTop;
            
            targetX = shipX;
            targetY = shipY;
            
            initialized = true;
        }
    }
    move = !move;
});

function animateShip() {
    if (move) {
        shipX += (targetX - shipX) * 0.008;
        shipY += (targetY - shipY) * 0.008;

        time += 0.05;

        // Wobbly Sine Wave
        let waveX = 5 * Math.sin(time);
        let waveY = 7 * Math.sin(time * 1.5);

        // Rotation Math
        let targetAngle = Math.atan2(targetY - shipY, targetX - shipX) * (180 / Math.PI);
        
        // Angle normalization
        if (targetAngle > 90) targetAngle = targetAngle - 180;
        if (targetAngle < -90) targetAngle = targetAngle + 180;
        
        // Smooth rotation easing
        currentAngle += (targetAngle - currentAngle) * 0.1;

        const translateX = shipX - initialLeft + waveX;
        const translateY = shipY - initialTop + waveY;

        shipImage.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${currentAngle}deg)`;
    }
    requestAnimationFrame(animateShip);
}

animateShip();

console.log("Welcome to the console. If you're looking for bugs, you'll find them here.");
