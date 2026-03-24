const links = {
    // Добавление ссылки
    addLink: function() {
        const title = document.getElementById('linkTitle').value.trim();
        const description = document.getElementById('linkDescription').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const category = document.getElementById('linkCategory').value.trim() || 'без категории';
        
        if (!title || !url) {
            alert('Название и URL обязательны');
            return;
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('URL должен начинаться с http:// или https://');
            return;
        }
        
        const linksData = JSON.parse(localStorage.getItem('links'));
        const newLink = {
            id: Date.now().toString(),
            title: this.escapeHtml(title),
            description: this.escapeHtml(description),
            url: url,
            category: this.escapeHtml(category),
            author: app.currentUser,
            createdAt: new Date().toISOString(),
            comments: []
        };
        
        linksData.push(newLink);
        localStorage.setItem('links', JSON.stringify(linksData));
        
        // Очистка формы
        document.getElementById('linkTitle').value = '';
        document.getElementById('linkDescription').value = '';
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkCategory').value = '';
        
        this.loadLinks();
        this.loadCategories();
        app.updateStats();
        alert('Ссылка добавлена!');
    },
    
    // Удаление ссылки
    deleteLink: function(linkId) {
        const linksData = JSON.parse(localStorage.getItem('links'));
        const link = linksData.find(l => l.id === linkId);
        
        // Проверка прав: автор или модератор
        if (link.author !== app.currentUser && !app.isModerator()) {
            alert('Вы можете удалять только свои ссылки');
            return;
        }
        
        if (confirm('Удалить эту ссылку?')) {
            const updatedLinks = linksData.filter(l => l.id !== linkId);
            localStorage.setItem('links', JSON.stringify(updatedLinks));
            this.loadLinks();
            this.loadCategories();
            app.updateStats();
            alert('Ссылка удалена');
        }
    },
    
    // Загрузка ссылок
    loadLinks: function(filterCategory = app.currentFilter) {
        const linksData = JSON.parse(localStorage.getItem('links'));
        let filteredLinks = linksData;
        
        if (filterCategory !== 'all') {
            filteredLinks = linksData.filter(l => l.category === filterCategory);
        }
        
        const linksGrid = document.getElementById('linksGrid');
        linksGrid.innerHTML = '';
        
        if (filteredLinks.length === 0) {
            linksGrid.innerHTML = '<div style="text-align: center; padding: 50px; background: white; border-radius: 15px;">📭 Нет ссылок в этой категории</div>';
            return;
        }
        
        filteredLinks.reverse().forEach(link => {
            const card = this.createLinkCard(link);
            linksGrid.appendChild(card);
        });
    },
    
    // Создание карточки ссылки
    createLinkCard: function(link) {
        const card = document.createElement('div');
        card.className = 'link-card';
        
        const isModerator = app.isModerator();
        const canDelete = (link.author === app.currentUser || isModerator);
        
        card.innerHTML = `
            <div class="link-preview">
                <iframe src="${link.url}" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" loading="lazy"></iframe>
            </div>
            <div class="link-content">
                <div class="link-title">${link.title}</div>
                <div class="link-description">${link.description || '📝 Нет описания'}</div>
                <div class="link-url">🔗 ${this.shortenUrl(link.url)}</div>
                <div class="link-meta">
                    <span class="link-author">
                        👤 <span class="author-badge">${link.author}</span>
                        ${link.author === 'AlekseyNaruto' ? '<span class="moderator-badge">⭐ Модератор</span>' : ''}
                    </span>
                    <span>📅 ${new Date(link.createdAt).toLocaleDateString()}</span>
                    <span>🏷️ ${link.category}</span>
                </div>
                <div class="link-actions">
                    <button class="btn-view" onclick="links.openLink('${link.url}')">🔗 Открыть</button>
                    <button class="btn-comment" onclick="comments.openModal('${link.id}')">💬 ${link.comments?.length || 0}</button>
                    ${canDelete ? `<button class="btn-delete" onclick="links.deleteLink('${link.id}')">🗑️ Удалить</button>` : ''}
                </div>
            </div>
        `;
        
        return card;
    },
    
    // Загрузка категорий
    loadCategories: function() {
        const linksData = JSON.parse(localStorage.getItem('links'));
        const categories = ['all', ...new Set(linksData.map(l => l.category))];
        
        const categoriesDiv = document.getElementById('categoriesList');
        categoriesDiv.innerHTML = '';
        
        categories.forEach(cat => {
            const chip = document.createElement('div');
            chip.className = 'category-chip';
            if (cat === 'all') chip.textContent = 'Все';
            else chip.textContent = cat;
            
            if (app.currentFilter === cat) {
                chip.classList.add('active');
            }
            
            chip.onclick = () => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                app.currentFilter = cat;
                this.loadLinks(cat);
            };
            
            categoriesDiv.appendChild(chip);
        });
    },
    
    // Сброс фильтра
    showAllCategories: function() {
        app.currentFilter = 'all';
        this.loadLinks('all');
        this.loadCategories();
    },
    
    // Открыть ссылку
    openLink: function(url) {
        window.open(url, '_blank');
    },
    
    // Сокращение URL для отображения
    shortenUrl: function(url) {
        if (url.length > 50) {
            return url.substring(0, 47) + '...';
        }
        return url;
    },
    
    // Защита от XSS
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};