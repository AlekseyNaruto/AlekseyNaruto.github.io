const auth = {
    // Вход
    async login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        const data = await app.loadData();
        const user = data.users[username];
        
        if (user && atob(user.password) === password) {
            app.currentUser = username;
            sessionStorage.setItem('currentUser', username);
            
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('currentUserName').textContent = username;
            
            if (username === app.moderatorName) {
                document.getElementById('moderatorBadge').style.display = 'inline-block';
            }
            
            await links.loadLinks();
            await links.loadCategories();
            app.updateStats(data);
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    },
    
    // Регистрация
    async register() {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        const data = await app.loadData();
        
        if (data.users[username]) {
            alert('Пользователь уже существует');
            return;
        }
        
        data.users[username] = {
            password: btoa(password),
            role: username === app.moderatorName ? 'moderator' : 'user',
            registeredAt: new Date().toISOString()
        };
        
        const success = await app.saveData(data);
        
        if (success) {
            alert('Регистрация успешна! Теперь войдите');
            this.showLogin();
        } else {
            alert('Ошибка регистрации');
        }
    },
    
    // Смена пароля
    async changePassword() {
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            alert('Заполните все поля');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('Новый пароль и подтверждение не совпадают');
            return;
        }
        
        if (newPassword.length < 4) {
            alert('Новый пароль должен содержать минимум 4 символа');
            return;
        }
        
        const data = await app.loadData();
        const user = data.users[app.currentUser];
        
        if (atob(user.password) !== oldPassword) {
            alert('Неверный старый пароль');
            return;
        }
        
        user.password = btoa(newPassword);
        const success = await app.saveData(data);
        
        if (success) {
            alert('Пароль успешно изменён!');
            this.closePasswordModal();
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            alert('Ошибка смены пароля');
        }
    },
    
    openPasswordModal() {
        document.getElementById('passwordModal').style.display = 'flex';
    },
    
    closePasswordModal() {
        document.getElementById('passwordModal').style.display = 'none';
    },
    
    // Выход
    logout() {
        app.currentUser = null;
        sessionStorage.removeItem('currentUser');
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('moderatorBadge').style.display = 'none';
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    },
    
    showLogin() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    },
    
    showRegister() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    },
    
    async checkAuth() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            const data = await app.loadData();
            if (data.users[savedUser]) {
                app.currentUser = savedUser;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'block';
                document.getElementById('currentUserName').textContent = savedUser;
                
                if (savedUser === app.moderatorName) {
                    document.getElementById('moderatorBadge').style.display = 'inline-block';
                }
                
                await links.loadLinks();
                await links.loadCategories();
                app.updateStats(data);
            } else {
                sessionStorage.removeItem('currentUser');
            }
        }
    }
};