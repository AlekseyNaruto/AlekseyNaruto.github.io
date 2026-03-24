// Конфиг из секретного файла
const GITHUB_CONFIG = {
    owner: window.GITHUB_OWNER || 'ваш-username',  // Замените для теста
    repo: window.GITHUB_REPO || 'ваш-репозиторий',  // Замените для теста
    token: window.GITHUB_TOKEN || 'ghp_ваш_токен'   // Замените для теста
};

const githubAPI = {
    async getData() {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/data.json`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            return { data: this.getDefaultData(), sha: null };
        }
        
        const data = await response.json();
        const content = atob(data.content);
        
        return {
            data: JSON.parse(content),
            sha: data.sha
        };
    },
    
    async saveData(data, sha) {
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/data.json`;
        
        const body = {
            message: `Update - ${new Date().toISOString()}`,
            content: content,
            branch: 'main'
        };
        
        if (sha) body.sha = sha;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
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