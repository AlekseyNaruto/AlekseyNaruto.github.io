// Глобальное хранилище данных
const app = {
    currentUser: null,
    currentLinkId: null,
    currentFilter: 'all',
    moderatorName: 'AlekseyNaruto', // Имя модератора
    
    // Инициализация базы данных
    initDB: function() {
        if (!localStorage.getItem('users')) {
            const users = {
                'AlekseyNaruto': {
                    password: btoa('moderator123'),
                    role: 'moderator',
                    registeredAt: new Date().toISOString()
                }
            };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        if (!localStorage.getItem('links')) {
            const demoLinks = [
                {
                    id: '1',
                    title: 'GitHub',
                    description: 'Платформа для хостинга IT-проектов и совместной разработки',
                    url: 'https://github.com',
                    category: 'разработка',
                    author: 'AlekseyNaruto',
                    createdAt: new Date().toISOString(),
                    comments: []
                },
                {
                    id: '2',
                    title: 'MDN Web Docs',
                    description: 'Документация по веб-технологиям от Mozilla',
                    url: 'https://developer.mozilla.org',
                    category: 'учеба',
                    author: 'AlekseyNaruto',
                    createdAt: new Date().toISOString(),
                    comments: []
                }
            ];
            localStorage.setItem('links', JSON.stringify(demoLinks));
        }
    },
    
    // Получение текущего пользователя
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    // Проверка на модератора
    isModerator: function() {
        if (!this.currentUser) return false;
        const users = JSON.parse(localStorage.getItem('users'));
        return users[this.currentUser]?.role === 'moderator';
    },
    
    // Обновление статистики
    updateStats: function() {
        const links = JSON.parse(localStorage.getItem('links'));
        const users = JSON.parse(localStorage.getItem('users'));
        
        let totalComments = 0;
        links.forEach(link => {
            totalComments += link.comments?.length || 0;
        });
        
        document.getElementById('totalLinks').textContent = links.length;
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('totalUsers').textContent = Object.keys(users).length;
    },
    
    // Инициализация
    init: function() {
        this.initDB();
        auth.checkAuth();
    }
};