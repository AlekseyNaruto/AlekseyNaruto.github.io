const app = {
    currentUser: null,
    currentLinkId: null,
    currentFilter: 'all',
    moderatorName: 'AlekseyNaruto',
    dataSHA: null,  // Храним SHA файла для обновления
    
    // Загрузка данных из GitHub
    async loadData() {
        try {
            const { data, sha } = await githubAPI.getData();
            this.dataSHA = sha;
            return data;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return null;
        }
    },
    
    // Сохранение данных в GitHub
    async saveData(data) {
        try {
            const newSha = await githubAPI.saveData(data, this.dataSHA);
            this.dataSHA = newSha;
            return true;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            return false;
        }
    },
    
    // Получить всех пользователей
    async getUsers() {
        const data = await this.loadData();
        return data ? data.users : {};
    },
    
    // Получить все ссылки
    async getLinks() {
        const data = await this.loadData();
        return data ? data.links : [];
    },
    
    // Обновление статистики
    updateStats(data) {
        if (!data) return;
        
        const totalLinks = data.links?.length || 0;
        let totalComments = 0;
        data.links?.forEach(link => {
            totalComments += link.comments?.length || 0;
        });
        const totalUsers = Object.keys(data.users || {}).length;
        
        document.getElementById('totalLinks').textContent = totalLinks;
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('totalUsers').textContent = totalUsers;
    },
    
    // Проверка на модератора
    isModerator() {
        if (!this.currentUser) return false;
        // Синхронная проверка, данные уже загружены
        return this.currentUser === this.moderatorName;
    },
    
    // Инициализация
    async init() {
        await auth.checkAuth();
    }
};