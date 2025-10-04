// Счетчик до запуска 4 ноября 2025 года
function updateCountdown() {
    const targetDate = new Date('2025-11-04').getTime(); // 4 ноября 2025
    const now = new Date().getTime();
    const difference = targetDate - now;

    // Если время уже наступило
    if (difference < 0) {
        document.querySelector('.countdown-title').textContent = 'Мы запустились! 🎉';
        document.querySelector('.countdown-timer').style.display = 'none';
        return;
    }

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
}

// Плавное появление страницы
document.addEventListener('DOMContentLoaded', function() {
    // Анимация появления
    document.querySelector('.container').style.opacity = '0';
    document.querySelector('.container').style.transition = 'opacity 1s ease';
    
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
    }, 100);

    // Запускаем счетчик сразу и каждую секунду
    updateCountdown();
    setInterval(updateCountdown, 1000);
});

// Дополнительная проверка при загрузке
window.addEventListener('load', function() {
    console.log('Счетчик запущен! Дата цели: 4 ноября 2025 года');
});
