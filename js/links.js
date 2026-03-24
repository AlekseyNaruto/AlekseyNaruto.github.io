const links = {
    async addLink() {
        const title = document.getElementById('linkTitle').value.trim();
        const desc = document.getElementById('linkDescription').value.trim();
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
        
        const data = await app.loadData();
        
        data.links.push({
            id: Date.now().toString(),
            title: this.escapeHtml(title),
            description: this.escapeHtml(desc),
            url: url,
            category: this.escapeHtml(category),
            author: app.currentUser,
            createdAt: new Date().toISOString(),
            comments: []
        });
        
        const success = await app.saveData(data);
        
        if (success) {
            document.getElementById('linkTitle').value = '';
            document.getElementById('linkDescription').value = '';
            document.getElementById('linkUrl').value = '';
            document.getElementById('linkCategory').value = '';
            
            await this.loadLinks();
            await this.loadCategories();
            app.updateStats(data);
            alert('✅ Ссылка добавлена!');
        } else {
            alert('❌ Ошибка добавления');
        }
    },
    
    async deleteLink(linkId) {
        const data = await app.loadData();
        const link = data.links.find(l => l.id === linkId);
        
        if (!link) return;
        
        if (link.author !== app.currentUser && !app.isModerator()) {
            alert('Удалять можно только свои ссылки');
            return;
        }
        
        if (confirm('Удалить ссылку?')) {
            data.links = data.links.filter(l => l.id !== linkId);
            const success = await app.saveData(data);
            
            if (success) {
                await this.loadLinks();
                await this.loadCategories();
                app.updateStats(data);
                alert('✅ Ссылка удалена');
            }
        }
    },
    
    async loadLinks(filterCategory = app.currentFilter) {
        const data = await app.loadData();
        if (!data) return;
        
        let filtered = data.links || [];
        
        if (filterCategory !== 'all') {
            filtered = filtered.filter(l => l.category === filterCategory);
        }
        
        const grid = document.getElementById('linksGrid');
        grid.innerHTML = '';
        
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state">📭 Нет ссылок</div>';
            return;
        }
        
        filtered.reverse().forEach(link => {
            grid.appendChild(this.createCard(link));
        });
    },
    
    createCard(link) {
        const card = document.createElement('div');
        card.className = 'link-card';
        
        const isModerator = app.isModerator();
        const canDelete = (link.author === app.currentUser || isModerator);
        
        card.innerHTML = `
            <div class="link-preview">
                <iframe src="${link.url}" sandbox="allow-same-origin allow-scripts" loading="lazy"></iframe>
            </div>
            <div class="link-content">
                <div class="link-title">${link.title}</div>
                <div class="link-description">${link.description || '📝 Нет описания'}</div>
                <div class="link-url">🔗 ${this.shortenUrl(link.url)}</div>
                <div class="link-meta">
                    <span>👤 ${link.author} ${link.author === 'AlekseyNaruto' ? '⭐' : ''}</span>
                    <span>📅 ${new Date(link.createdAt).toLocaleDateString()}</span>
                    <span>🏷️ ${link.category}</span>
                </div>
                <div class="link-actions">
                    <button onclick="links.openLink('${link.url}')">🔗 Открыть</button>
                    <button onclick="comments.openModal('${link.id}')">💬 ${link.comments?.length || 0}</button>
                    ${canDelete ? `<button class="delete" onclick="links.deleteLink('${link.id}')">🗑️</button>` : ''}
                </div>
            </div>
        `;
        
        return card;
    },
    
    async loadCategories() {
        const data = await app.loadData();
        if (!data) return;
        
        const categories = ['all', ...new Set(data.links.map(l => l.category))];
        
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';
        
        categories.forEach(cat => {
            const chip = document.createElement('div');
            chip.className = 'category-chip';
            chip.textContent = cat === 'all' ? 'Все' : cat;
            if (app.currentFilter === cat) chip.classList.add('active');
            
            chip.onclick = () => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                app.currentFilter = cat;
                this.loadLinks(cat);
            };
            
            container.appendChild(chip);
        });
    },
    
    showAllCategories() {
        app.currentFilter = 'all';
        this.loadLinks('all');
        this.loadCategories();
    },
    
    openLink(url) {
        window.open(url, '_blank');
    },
    
    shortenUrl(url) {
        return url.length > 50 ? url.substring(0, 47) + '...' : url;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};