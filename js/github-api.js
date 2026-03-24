const githubAPI = {
    async getData() {
        try {
            const url = `https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/data.json`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${window.GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.status === 404) {
                return { data: this.getDefaultData(), sha: null };
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const content = atob(data.content);
            
            return {
                data: JSON.parse(content),
                sha: data.sha
            };
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return { data: this.getDefaultData(), sha: null };
        }
    },
    
    async saveData(data, sha) {
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            
            const url = `https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/data.json`;
            
            const body = {
                message: `Update - ${new Date().toLocaleString()}`,
                content: content,
                branch: 'main'
            };
            
            if (sha) body.sha = sha;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${window.GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            const result = await response.json();
            return result.content.sha;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            throw error;
        }
    },
    
    getDefaultData() {
        return {
            users: {
                'AlekseyNaruto': {
                    password: btoa('moderator123'),
                    role: 'moderator',
                    registeredAt: new Date().toISOString()
                }
            },
            links: []
        };
    }
};