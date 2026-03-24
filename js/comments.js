const comments = {
    async openModal(linkId) {
        app.currentLinkId = linkId;
        const data = await app.loadData();
        const link = data.links.find(l => l.id === linkId);
        
        const container = document.getElementById('commentsList');
        container.innerHTML = '';
        
        if (link.comments?.length > 0) {
            link.comments.forEach(comment => {
                container.appendChild(this.createComment(comment, linkId));
            });
        } else {
            container.innerHTML = '<div class="empty-state">💬 Нет комментариев</div>';
        }
        
        document.getElementById('commentsModal').style.display = 'flex';
        document.getElementById('newComment').value = '';
    },
    
    createComment(comment, linkId) {
        const div = document.createElement('div');
        div.className = 'comment-item';
        
        const canDelete = (comment.author === app.currentUser || app.isModerator());
        
        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">👤 ${this.escapeHtml(comment.author)}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
            </div>
            <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            ${canDelete ? `<button class="delete-comment" onclick="comments.deleteComment('${linkId}', '${comment.date}')">🗑️</button>` : ''}
        `;
        
        return div;
    },
    
    async addComment() {
        const text = document.getElementById('newComment').value.trim();
        
        if (!text) {
            alert('Напишите комментарий');
            return;
        }
        
        const data = await app.loadData();
        const link = data.links.find(l => l.id === app.currentLinkId);
        
        link.comments.push({
            author: app.currentUser,
            text: this.escapeHtml(text),
            date: new Date().toISOString()
        });
        
        const success = await app.saveData(data);
        
        if (success) {
            await this.openModal(app.currentLinkId);
            app.updateStats(data);
        }
    },
    
    async deleteComment(linkId, commentDate) {
        if (!confirm('Удалить комментарий?')) return;
        
        const data = await app.loadData();
        const link = data.links.find(l => l.id === linkId);
        const comment = link.comments.find(c => c.date === commentDate);
        
        if (comment.author !== app.currentUser && !app.isModerator()) {
            alert('Удалять можно только свои комментарии');
            return;
        }
        
        link.comments = link.comments.filter(c => c.date !== commentDate);
        const success = await app.saveData(data);
        
        if (success) {
            await this.openModal(linkId);
            app.updateStats(data);
        }
    },
    
    closeModal() {
        document.getElementById('commentsModal').style.display = 'none';
        app.currentLinkId = null;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};