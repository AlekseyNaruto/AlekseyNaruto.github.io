const moderator = {
    async getAllLinks() {
        const data = await app.loadData();
        return data.links;
    },
    
    async getAllUsers() {
        const data = await app.loadData();
        return data.users;
    },
    
    async clearUserLinks(username) {
        if (!app.isModerator()) {
            alert('Доступ только для модераторов');
            return;
        }
        
        if (confirm(`Удалить все ссылки пользователя ${username}?`)) {
            const data = await app.loadData();
            data.links = data.links.filter(link => link.author !== username);
            const success = await app.saveData(data);
            
            if (success) {
                await links.loadLinks();
                app.updateStats(data);
                alert('Ссылки удалены');
            }
        }
    }
};