// ==================== //
// Глобальные переменные //
// ==================== //

let myMap;              // Объект карты
let myPlacemark;        // Объект метки
let mapInitialized = false;  // Флаг инициализации карты

// DOM элементы
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const coordinatesDiv = document.getElementById('coordinates');
const locateBtn = document.getElementById('locateBtn');

// ==================== //
// Функции обновления UI //
// ==================== //

/**
 * Обновление статуса на странице
 */
function updateStatus(status, type = 'info') {
    let icon = '';
    let text = '';
    
    switch(type) {
        case 'loading':
            icon = '🔄';
            text = status;
            statusIcon.classList.add('loading');
            break;
        case 'success':
            icon = '✅';
            text = status;
            statusIcon.classList.remove('loading');
            break;
        case 'error':
            icon = '❌';
            text = status;
            statusIcon.classList.remove('loading');
            break;
        default:
            icon = '📍';
            text = status;
            statusIcon.classList.remove('loading');
    }
    
    statusIcon.textContent = icon;
    statusText.textContent = text;
}

/**
 * Обновление координат на странице
 */
function updateCoordinates(lat, lng) {
    if (lat && lng) {
        coordinatesDiv.textContent = `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`;
        coordinatesDiv.style.opacity = '1';
    } else {
        coordinatesDiv.textContent = '—';
        coordinatesDiv.style.opacity = '0.5';
    }
}

// ==================== //
// Функции работы с картой //
// ==================== //

/**
 * Инициализация карты
 */
function initMap(coords) {
    if (mapInitialized && myMap) {
        // Если карта уже существует, просто перемещаемся
        myMap.setCenter(coords, 17);
        if (myPlacemark) {
            myPlacemark.geometry.setCoordinates(coords);
        } else {
            myPlacemark = createPlacemark(coords);
            myMap.geoObjects.add(myPlacemark);
        }
        return;
    }
    
    // Создаём новую карту
    myMap = new ymaps.Map("map", {
        center: coords,
        zoom: 17,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
    });
    
    // Создаём и добавляем метку
    myPlacemark = createPlacemark(coords);
    myMap.geoObjects.add(myPlacemark);
    
    mapInitialized = true;
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        if (myMap) myMap.container.fitToViewport();
    });
}

/**
 * Создание метки на карте
 */
function createPlacemark(coords) {
    return new ymaps.Placemark(coords, {
        balloonContent: `
            <div style="padding: 10px;">
                <strong>📍 Вы здесь!</strong><br>
                Широта: ${coords[0].toFixed(6)}°<br>
                Долгота: ${coords[1].toFixed(6)}°
            </div>
        `,
        hintContent: 'Ваше местоположение'
    }, {
        preset: 'islands#redCircleIcon',
        iconColor: '#ff4d4d',
        balloonShadow: true,
        openBalloonOnClick: true
    });
}

/**
 * Сброс вида карты (на центр с меткой)
 */
function resetView() {
    if (myMap && myPlacemark) {
        const coords = myPlacemark.geometry.getCoordinates();
        myMap.setCenter(coords, 17);
        updateStatus('Вид сброшен', 'success');
        setTimeout(() => {
            updateStatus('Карта готова к работе', 'success');
        }, 2000);
    } else {
        updateStatus('Сначала определите местоположение', 'error');
    }
}

// ==================== //
// Геолокация           //
// ==================== //

/**
 * Основная функция определения местоположения
 */
function locateMe() {
    // Проверяем поддержку геолокации
    if (!navigator.geolocation) {
        updateStatus('Ваш браузер не поддерживает геолокацию', 'error');
        alert('❌ Ваш браузер не поддерживает геолокацию.\nПопробуйте использовать Chrome, Safari или Firefox.');
        return;
    }
    
    // Обновляем статус
    updateStatus('Запрос разрешения на доступ к геолокации...', 'loading');
    
    // Запрашиваем геолокацию
    navigator.geolocation.getCurrentPosition(
        // Успешное определение
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            const coords = [lat, lng];
            
            // Обновляем координаты на странице
            updateCoordinates(lat, lng);
            
            // Обновляем статус
            updateStatus(`Местоположение определено! Точность: ${Math.round(accuracy)} м`, 'success');
            
            // Инициализируем или обновляем карту
            if (typeof ymaps !== 'undefined' && ymaps.Map) {
                // Если API карт загружен
                if (!mapInitialized) {
                    ymaps.ready(() => {
                        initMap(coords);
                    });
                } else {
                    initMap(coords);
                }
            } else {
                // Ждём загрузки API
                updateStatus('Загрузка карты...', 'loading');
                ymaps.ready(() => {
                    initMap(coords);
                });
            }
        },
        // Обработка ошибок
        function(error) {
            let errorMessage = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Не удалось определить местоположение. Проверьте GPS или Wi-Fi.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Время ожидания истекло. Попробуйте ещё раз.';
                    break;
                default:
                    errorMessage = 'Произошла неизвестная ошибка.';
            }
            
            updateStatus(errorMessage, 'error');
            coordinatesDiv.textContent = '❌ Ошибка';
            
            // Показываем всплывающее сообщение
            alert(`❌ ${errorMessage}\n\nДля работы геолокации:\n• Разрешите доступ к местоположению\n• Включите GPS или Wi-Fi\n• Попробуйте перезагрузить страницу`);
        },
        // Настройки геолокации
        {
            enableHighAccuracy: true,  // Высокая точность
            timeout: 15000,            // Таймаут 15 секунд
            maximumAge: 0              // Не использовать кэшированные данные
        }
    );
}

// ==================== //
// Инициализация при загрузке //
// ==================== //

/**
 * Инициализация страницы
 */
function initializePage() {
    updateStatus('Карта загружается...', 'loading');
    
    // Ждём готовности API Яндекс.Карт
    ymaps.ready(() => {
        updateStatus('Карта готова! Нажмите кнопку для определения местоположения', 'success');
        
        // Инициализируем карту с центром по умолчанию (Москва)
        const defaultCoords = [55.751574, 37.573856];
        myMap = new ymaps.Map("map", {
            center: defaultCoords,
            zoom: 10,
            controls: ['zoomControl', 'fullscreenControl']
        });
        mapInitialized = true;
        
        // Добавляем небольшую задержку для красивого появления
        setTimeout(() => {
            updateStatus('Готов к работе!', 'success');
        }, 500);
    });
}

// Запускаем инициализацию при загрузке страницы
window.addEventListener('load', initializePage);

// Добавляем обработчик для кнопки сброса (на случай, если она есть)
window.resetView = resetView;
window.locateMe = locateMe;