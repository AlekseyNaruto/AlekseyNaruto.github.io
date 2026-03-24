const auth = {
    // Вход
    login: function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users[username];
        
        if (user && atob(user.password) === password) {
            app.currentUser = username;
            sessionStorage.setItem('currentUser', username);
            
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('currentUserName').textContent = username;
            
            // Показываем бейдж модератора если нужно
            if (username === app.moderatorName || user.role === 'moderator') {
                document.getElementById('moderatorBadge').style.display = 'inline-block';
                // Обновляем роль в базе
                users[username].role = 'moderator';
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            links.loadLinks();
            links.loadCategories();
            app.updateStats();
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    },
    
    // Регистрация
    register: function() {
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
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        if (users[username]) {
            alert('Пользователь уже существует');
            return;
        }
        
        // Проверяем, не пытается ли кто-то зарегистрироваться как модератор
        const role = (username === app.moderatorName) ? 'moderator' : 'user';
        
        users[username] = {
            password: btoa(password),
            role: role,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        alert('Регистрация успешна! Теперь войдите');
        this.showLogin();
    },
    
    // Выход
    logout: function() {
        app.currentUser = null;
        sessionStorage.removeItem('currentUser');
        document.getElementById('authContainer').style.display = 'flex';
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('moderatorBadge').style.display = 'none';
        
        // Очистка полей
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    },
    
    // Показать форму входа
    showLogin: function() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
    },
    
    // Показать форму регистрации
    showRegister: function() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
    },
    
    // Проверка авторизации при загрузке
    checkAuth: function() {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            app.currentUser = savedUser;
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('currentUserName').textContent = savedUser;
            
            const users = JSON.parse(localStorage.getItem('users'));
            if (savedUser === app.moderatorName || users[savedUser]?.role === 'moderator') {
                document.getElementById('moderatorBadge').style.display = 'inline-block';
            }
            
            links.loadLinks();
            links.loadCategories();
            app.updateStats();
        }
    }
};