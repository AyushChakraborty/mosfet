const heroImage = document.querySelector('.hero-image img')
const waveImage = document.querySelector('#wave-sound')
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
            // waveImage.classList.add('still')
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
            // waveImage.classList.remove('still')
            waveImage.style.opacity = 1    
        }, 300)

        isPlaying = false
    }
})

