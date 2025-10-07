// Счетчик до запуска 4 ноября 2025 года
function updateCountdown() {
    const targetDate = new Date('2025-11-04').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
        document.querySelector('.status-text').textContent = 'ЗАПУЩЕНО';
        document.querySelector('.status-dot').style.background = '#30d158';
        document.querySelector('.status-dot').style.animation = 'none';
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

// Эффект частиц при движении курсора - ТОЛЬКО на десктопе
function createParticles(e) {
    if (window.innerWidth <= 768) return; // Не на мобильных
    
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Случайное направление
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    document.body.appendChild(particle);
    
    // Удаляем частицу после анимации
    setTimeout(() => {
        particle.remove();
    }, 1500);
}

// Простые взаимодействия для всех устройств
function setupInteractions() {
    // Анимация при тапе/клике на счетчик
    document.querySelectorAll('.time-unit').forEach(unit => {
        unit.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Анимация заголовка при клике
    document.querySelector('.macos-title').addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
    
    // Лёгкая анимация логотипа при тапе
    document.querySelector('.logo-glass').addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Запускаем счетчик
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Настраиваем взаимодействия
    setupInteractions();
    
    // Эффект частиц только на десктопе
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            // Создаем частицы с вероятностью 15%
            if (Math.random() < 0.15) {
                createParticles(e);
            }
        });
    }
    
    console.log('🎯 Adaptive Minimalist Theme loaded');
    console.log('Device type:', window.innerWidth > 768 ? 'Desktop' : 'Mobile');
});

// Плавный скролл и запрет выделения
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});
