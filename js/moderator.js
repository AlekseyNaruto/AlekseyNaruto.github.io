// Дополнительные функции модератора
const moderator = {
    // Получить все ссылки для модерации
    getAllLinks: function() {
        return JSON.parse(localStorage.getItem('links'));
    },
    
    // Получить всех пользователей
    getAllUsers: function() {
        return JSON.parse(localStorage.getItem('users'));
    },
    
    // Блокировка пользователя (только для демонстрации)
    blockUser: function(username) {
        if (!app.isModerator()) {
            alert('Доступ только для модераторов');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        if (users[username] && username !== 'AlekseyNaruto') {
            // Здесь можно реализовать блокировку
            alert(`Пользователь ${username} заблокирован`);
        }
    },
    
    // Очистка всех ссылок пользователя
    clearUserLinks: function(username) {
        if (!app.isModerator()) {
            alert('Доступ только для модераторов');
            return;
        }
        
        if (confirm(`Удалить все ссылки пользователя ${username}?`)) {
            let links = JSON.parse(localStorage.getItem('links'));
            links = links.filter(link => link.author !== username);
            localStorage.setItem('links', JSON.stringify(links));
            links.loadLinks();
            app.updateStats();
            alert('Ссылки удалены');
        }
    }
};

// Добавляем кнопку модерации в карточки (вызывается из links.js)
// Патчим функцию создания карточки для добавления кнопки модерации
const originalCreateLinkCard = links.createLinkCard;
links.createLinkCard = function(link) {
    const card = originalCreateLinkCard.call(this, link);
    
    // Если пользователь модератор, добавляем дополнительные кнопки
    if (app.isModerator() && link.author !== app.currentUser) {
        const actionsDiv = card.querySelector('.link-actions');
        const moderateBtn = document.createElement('button');
        moderateBtn.className = 'btn-moderate';
        moderateBtn.textContent = '👑 Модерация';
        moderateBtn.onclick = () => {
            if (confirm(`Модерация ссылки от ${link.author}\nЧто вы хотите сделать?`)) {
                this.deleteLink(link.id);
            }
        };
        actionsDiv.appendChild(moderateBtn);
    }
    
    return card;
};