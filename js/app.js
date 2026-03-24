const app = {
    currentUser: null,
    currentLinkId: null,
    currentFilter: 'all',
    moderatorName: 'AlekseyNaruto',
    dataSHA: null,
    
    async loadData() {
        try {
            const { data, sha } = await githubAPI.getData();
            this.dataSHA = sha;
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    },
    
    async saveData(data) {
        try {
            const newSha = await githubAPI.saveData(data, this.dataSHA);
            this.dataSHA = newSha;
            return true;
        } catch (error) {
            alert('Ошибка сохранения: ' + error.message);
            return false;
        }
    },
    
    isModerator() {
        return this.currentUser === this.moderatorName;
    },
    
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
    
    async init() {
        await auth.checkAuth();
    }
};