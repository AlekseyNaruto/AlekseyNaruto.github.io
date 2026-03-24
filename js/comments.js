const comments = {
    async openModal(linkId) {
        app.currentLinkId = linkId;
        const data = await app.loadData();
        const link = data.links.find(l => l.id === linkId);
        
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        
        if (link.comments && link.comments.length > 0) {
            link.comments.forEach(comment => {
                const commentDiv = this.createCommentElement(comment, linkId);
                commentsList.appendChild(commentDiv);
            });
        } else {
            commentsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">💬 Нет комментариев. Будьте первым!</div>';
        }
        
        document.getElementById('commentsModal').style.display = 'flex';
        document.getElementById('newComment').value = '';
    },
    
    createCommentElement(comment, linkId) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        const canDelete = (comment.author === app.currentUser || app.isModerator());
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">👤 ${this.escapeHtml(comment.author)}</span>
                <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
            </div>
            <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            ${canDelete ? `<button class="delete-comment-btn" onclick="comments.deleteComment('${linkId}', '${comment.date}')">🗑️</button>` : ''}
        `;
        
        return commentDiv;
    },
    
    async addComment() {
        const commentText = document.getElementById('newComment').value.trim();
        
        if (!commentText) {
            alert('Напишите комментарий');
            return;
        }
        
        const data = await app.loadData();
        const linkIndex = data.links.findIndex(l => l.id === app.currentLinkId);
        
        if (!data.links[linkIndex].comments) {
            data.links[linkIndex].comments = [];
        }
        
        data.links[linkIndex].comments.push({
            author: app.currentUser,
            text: this.escapeHtml(commentText),
            date: new Date().toISOString()
        });
        
        const success = await app.saveData(data);
        
        if (success) {
            await this.openModal(app.currentLinkId);
            app.updateStats(data);
        } else {
            alert('Ошибка добавления комментария');
        }
    },
    
    async deleteComment(linkId, commentDate) {
        if (!confirm('Удалить этот комментарий?')) return;
        
        const data = await app.loadData();
        const linkIndex = data.links.findIndex(l => l.id === linkId);
        const comment = data.links[linkIndex].comments.find(c => c.date === commentDate);
        
        if (comment.author !== app.currentUser && !app.isModerator()) {
            alert('Вы можете удалять только свои комментарии');
            return;
        }
        
        data.links[linkIndex].comments = data.links[linkIndex].comments.filter(c => c.date !== commentDate);
        const success = await app.saveData(data);
        
        if (success) {
            await this.openModal(linkId);
            app.updateStats(data);
        } else {
            alert('Ошибка удаления комментария');
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