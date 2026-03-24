// Модераторские функции
const moderator = {
    // Проверка прав модератора
    isModerator() {
        return app.isModerator();
    },
    
    // Получить все ссылки для модерации
    async getAllLinks() {
        const data = await app.loadData();
        return data.links;
    },
    
    // Получить всех пользователей
    async getAllUsers() {
        const data = await app.loadData();
        return data.users;
    },
    
    // Удалить все ссылки пользователя
    async clearUserLinks(username) {
        if (!app.isModerator()) {
            alert('Доступ только для модератора');
            return;
        }
        
        if (!confirm(`Удалить все ссылки пользователя ${username}?`)) return;
        
        const data = await app.loadData();
        data.links = data.links.filter(link => link.author !== username);
        
        const success = await app.saveData(data);
        
        if (success) {
            await links.loadLinks();
            await links.loadCategories();
            app.updateStats(data);
            alert(`✅ Все ссылки пользователя ${username} удалены`);
        }
    },
    
    // Заблокировать пользователя (удалить аккаунт)
    async blockUser(username) {
        if (!app.isModerator()) {
            alert('Доступ только для модератора');
            return;
        }
        
        if (username === app.moderatorName) {
            alert('Нельзя заблокировать главного модератора');
            return;
        }
        
        if (!confirm(`Заблокировать пользователя ${username}? Все его данные будут удалены.`)) return;
        
        const data = await app.loadData();
        
        // Удаляем все ссылки пользователя
        data.links = data.links.filter(link => link.author !== username);
        
        // Удаляем пользователя
        delete data.users[username];
        
        const success = await app.saveData(data);
        
        if (success) {
            await links.loadLinks();
            await links.loadCategories();
            app.updateStats(data);
            alert(`✅ Пользователь ${username} заблокирован`);
        }
    },
    
    // Статистика по пользователю
    async getUserStats(username) {
        const data = await app.loadData();
        const userLinks = data.links.filter(link => link.author === username);
        let userComments = 0;
        userLinks.forEach(link => {
            userComments += link.comments?.filter(c => c.author === username).length || 0;
        });
        
        return {
            username: username,
            linksCount: userLinks.length,
            commentsCount: userComments,
            registeredAt: data.users[username]?.registeredAt
        };
    }
};

// Добавляем кнопки модерации в карточки ссылок (расширяем links.createCard)
const originalCreateCard = links.createCard;
links.createCard = function(link) {
    const card = originalCreateCard.call(this, link);
    
    if (app.isModerator() && link.author !== app.currentUser) {
        const actionsDiv = card.querySelector('.link-actions');
        const moderateBtn = document.createElement('button');
        moderateBtn.className = 'moderate';
        moderateBtn.textContent = '👑 Модерация';
        moderateBtn.onclick = async () => {
            if (confirm(`Модерация ссылки от ${link.author}\nУдалить эту ссылку?`)) {
                await this.deleteLink(link.id);
            }
        };
        actionsDiv.appendChild(moderateBtn);
    }
    
    return card;
};