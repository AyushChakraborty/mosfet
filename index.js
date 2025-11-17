const heroImage = document.querySelector('.hero-image img')
const waveImage = document.querySelector('#wave-sound')
const shipImage = document.querySelector('#ship')
let isPlaying = false
let audio = null

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY
    const offset = scrollY * 0.5
    heroImage.style.transform = `translateY(${offset}px)`
})

waveImage.addEventListener('click', () => {
    if (!isPlaying) {
        audio = new Audio('waves.mp3')
        audio.loop = true 
        audio.volume = 0.4
        audio.play().catch(err => console.log("playback failed"))

        waveImage.style.opacity = 0      //make the wave dissappear first
        setTimeout(() => {
            waveImage.src = "still_wave.png"
            waveImage.style.opacity = 1    //make it appear back after change
        }, 300)

        isPlaying = true

    }else {
        if (audio) {
            audio.pause()
            audio.currentTime = 0
            audio = null
        }
        waveImage.style.opacity = 0      
        setTimeout(() => {
            waveImage.src = "wave.png"
            waveImage.style.opacity = 1    
        }, 300)

        isPlaying = false
    }
})


//now the functionality where the ship moves with a slight jitter 

let move = false
let shipX = 0
let shipY = 0
let targetX = 0
let targetY = 0
let currentAngle = 0
let time = 0      //used for the wobbly sin motion

shipImage.addEventListener('click', () => {
    if (!move) {
        const rect = shipImage.getBoundingClientRect()
        shipX = rect.left
        shipY = rect.top
    }
    move = !move
})

window.addEventListener('mousemove', (e) => {
    if (move) {
        targetX = e.clientX
        targetY = e.clientY
    }
})

function animateShip() {
    if (move) {
        shipX += (targetX - shipX) * 0.008     //move the ship marginally towards the 
        //new target
        shipY += (targetY - shipY) * 0.008

        time += 0.05

        //math time!!: y = Asin(wx) where A is the amplitude and w is the angular freq
        let waveX = 5 * Math.sin(time)
        let waveY = 7 * Math.sin(time * 1.5)

        let targetAngle = Math.atan2(targetY - shipY, targetX - shipX) * (180/Math.PI)
        if (targetAngle > 90) targetAngle = targetAngle - 180
        if (targetAngle < -90) targetAngle = targetAngle + 180
        currentAngle += (targetAngle - currentAngle) * 0.1    //change the angle gradually

        shipImage.style.transform = `translate(${shipX + waveX}px, ${shipY + waveY}px) rotate(${currentAngle}deg)`
    }
    requestAnimationFrame(animateShip)    //for the loop to keep going
}

animateShip()
