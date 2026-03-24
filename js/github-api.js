// ⚠️ НАСТРОЙТЕ ЭТИ ПАРАМЕТРЫ ⚠️
const GITHUB_CONFIG = {
    owner: 'AlekseyNaruto',        // Ваш username на GitHub
    repo: 'AlekseyNaruto.github.io',      // Название репозитория
    path: 'data.json',             // Путь к файлу с данными
    token: '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'      // Personal Access Token
};

// Инструкция по получению токена:
// 1. Зайдите на GitHub → Settings → Developer settings → Personal access tokens
// 2. Создайте новый токен с правами repo
// 3. Скопируйте токен и вставьте выше

const githubAPI = {
    // Получение данных из файла
    async getData() {
        try {
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных');
            }
            
            const data = await response.json();
            const content = atob(data.content);
            return {
                data: JSON.parse(content),
                sha: data.sha
            };
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            // Возвращаем данные по умолчанию
            return {
                data: {
                    users: {
                        'AlekseyNaruto': {
                            password: btoa('moderator123'),
                            role: 'moderator',
                            registeredAt: new Date().toISOString()
                        }
                    },
                    links: []
                },
                sha: null
            };
        }
    },
    
    // Сохранение данных в файл
    async saveData(data, sha) {
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
            const body = {
                message: `Update data - ${new Date().toISOString()}`,
                content: content,
                sha: sha
            };
            
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
                throw new Error('Ошибка сохранения данных');
            }
            
            const result = await response.json();
            return result.content.sha;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения данных. Проверьте настройки GitHub API');
            throw error;
        }
    },
    
    // Обновление данных (универсальная функция)
    async updateData(updateFunction) {
        try {
            const { data, sha } = await this.getData();
            const updatedData = await updateFunction(data);
            const newSha = await this.saveData(updatedData, sha);
            return { data: updatedData, sha: newSha };
        } catch (error) {
            console.error('Ошибка обновления:', error);
            throw error;
        }
    }
};