// Счетчик до запуска (1 февраля 2025)
function updateCountdown() {
    const targetDate = new Date('2025-02-01').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    // Расчет времени
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Обновление DOM
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

    // Если время вышло
    if (difference < 0) {
        document.querySelector('.countdown-title').textContent = 'Мы запустились!';
        document.querySelector('.countdown-timer').style.display = 'none';
    }
}

// Запускаем сразу и каждую секунду
updateCountdown();
setInterval(updateCountdown, 1000);

// Добавляем анимацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.container').style.opacity = '0';
    document.querySelector('.container').style.transition = 'opacity 1s ease';
    
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
    }, 100);
});
