const comments = {
    // Открыть модальное окно
    openModal: function(linkId) {
        app.currentLinkId = linkId;
        const linksData = JSON.parse(localStorage.getItem('links'));
        const link = linksData.find(l => l.id === linkId);
        
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
    
    // Создание элемента комментария
    createCommentElement: function(comment, linkId) {
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
    
    // Добавить комментарий
    addComment: function() {
        const commentText = document.getElementById('newComment').value.trim();
        
        if (!commentText) {
            alert('Напишите комментарий');
            return;
        }
        
        const linksData = JSON.parse(localStorage.getItem('links'));
        const linkIndex = linksData.findIndex(l => l.id === app.currentLinkId);
        
        if (!linksData[linkIndex].comments) {
            linksData[linkIndex].comments = [];
        }
        
        linksData[linkIndex].comments.push({
            author: app.currentUser,
            text: this.escapeHtml(commentText),
            date: new Date().toISOString()
        });
        
        localStorage.setItem('links', JSON.stringify(linksData));
        this.openModal(app.currentLinkId);
        app.updateStats();
    },
    
    // Удалить комментарий
    deleteComment: function(linkId, commentDate) {
        if (!confirm('Удалить этот комментарий?')) return;
        
        const linksData = JSON.parse(localStorage.getItem('links'));
        const linkIndex = linksData.findIndex(l => l.id === linkId);
        const comment = linksData[linkIndex].comments.find(c => c.date === commentDate);
        
        // Проверка прав
        if (comment.author !== app.currentUser && !app.isModerator()) {
            alert('Вы можете удалять только свои комментарии');
            return;
        }
        
        linksData[linkIndex].comments = linksData[linkIndex].comments.filter(c => c.date !== commentDate);
        localStorage.setItem('links', JSON.stringify(linksData));
        this.openModal(linkId);
        app.updateStats();
    },
    
    // Закрыть модальное окно
    closeModal: function() {
        document.getElementById('commentsModal').style.display = 'none';
        app.currentLinkId = null;
    },
    
    // Защита от XSS
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};