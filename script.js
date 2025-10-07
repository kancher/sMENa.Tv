// Анимация частиц
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Случайные параметры
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Счетчик до запуска 4 ноября 2025 года
function updateCountdown() {
    const targetDate = new Date('2025-11-04').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        document.querySelector('.countdown-title-soft').innerHTML = 
            'Мы переродились! 🎉<br><small>Добро пожаловать в новую эру</small>';
        document.querySelector('.countdown-crystals').style.display = 'none';
        document.querySelector('.status-pulse .pulse-text').textContent = 'Платформа активна';
        document.querySelector('.pulse-dot').style.background = '#4cd964';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Анимация появления элементов
function animateOnScroll() {
    const elements = document.querySelectorAll('.crystal-card, .feature-card, .social-drop');
    
    elements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Создаем частицы
    createParticles();
    
    // Плавное появление контента
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(30px)';
    container.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
    
    // Инициализация анимаций
    const elements = document.querySelectorAll('.crystal-card, .feature-card, .social-drop');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Запускаем счетчик
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Анимация при скролле
    window.addEventListener('scroll', animateOnScroll);
    setTimeout(animateOnScroll, 1000);
    
    console.log('✨ sMeNa.Tv - магия началась!');
});

// Дополнительные интерактивные эффекты
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.crystal-card, .feature-card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardX = cardRect.left + cardRect.width / 2;
        const cardY = cardRect.top + cardRect.height / 2;
        
        const angleX = (mouseY - cardY / window.innerHeight) * 10;
        const angleY = (mouseX - cardX / window.innerWidth) * -10;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
});
