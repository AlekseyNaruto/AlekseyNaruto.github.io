const auth = {
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
            document.getElementById('currentUser').textContent = `👤 ${username}`;
            
            if (username === app.moderatorName) {
                document.getElementById('moderatorBadge').style.display = 'inline-block';
            }
            
            await links.loadLinks();
            await links.loadCategories();
            app.updateStats(data);
        } else {
            alert('Неверное имя или пароль');
        }
    },
    
    async register() {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        
        if (!username || !password) {
            alert('Заполните все поля');
            return;
        }
        
        if (password !== confirm) {
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
            alert('Регистрация успешна!');
            this.showLogin();
        } else {
            alert('Ошибка регистрации');
        }
    },
    
    async changePassword() {
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;
        
        if (!oldPass || !newPass || !confirmPass) {
            alert('Заполните все поля');
            return;
        }
        
        if (newPass !== confirmPass) {
            alert('Пароли не совпадают');
            return;
        }
        
        const data = await app.loadData();
        const user = data.users[app.currentUser];
        
        if (atob(user.password) !== oldPass) {
            alert('Неверный старый пароль');
            return;
        }
        
        user.password = btoa(newPass);
        const success = await app.saveData(data);
        
        if (success) {
            alert('Пароль изменён');
            this.closePasswordModal();
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        }
    },
    
    logout() {
        app.currentUser = null;
        sessionStorage.removeItem('currentUser');
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('moderatorBadge').style.display = 'none';
    },
    
    showLogin() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    },
    
    showRegister() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    },
    
    openPasswordModal() {
        document.getElementById('passwordModal').style.display = 'flex';
    },
    
    closePasswordModal() {
        document.getElementById('passwordModal').style.display = 'none';
    },
    
    async checkAuth() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            const data = await app.loadData();
            if (data.users[savedUser]) {
                app.currentUser = savedUser;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'block';
                document.getElementById('currentUser').textContent = `👤 ${savedUser}`;
                
                if (savedUser === app.moderatorName) {
                    document.getElementById('moderatorBadge').style.display = 'inline-block';
                }
                
                await links.loadLinks();
                await links.loadCategories();
                app.updateStats(data);
            }
        }
    }
};