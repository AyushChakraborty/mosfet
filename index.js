const heroImage = document.querySelector('.hero-image img')

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY
    const offset = scrollY * 0.5
    heroImage.style.transform = `translateY(${offset}px)`
})

window.addEventListener('load', () => {
    const audio = new Audio('waves.mp3')
    audio.loop = true 
    audio.volume = 0.4
    audio.play().catch(err => console.log("autoplay failed"))
})
