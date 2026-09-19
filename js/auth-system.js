/**
 * ====================================================================
 * HUNTER GAMES — SISTEMA DE AUTENTICACIÓN, USUARIOS Y BIBLIOTECA GAMER
 * ====================================================================
 * Gestiona:
 * - Registro con validación estricta (correo real sin espacios, clave 8-12 con mayúscula y caracteres especiales).
 * - Inicio y cierre de sesión seguro con persistencia en localStorage.
 * - Catálogo de juegos adquiridos / biblioteca personal del usuario.
 * - Descuentos exclusivos y notificaciones de próximos lanzamientos.
 * - Sincronización del navbar y buscador global entre páginas.
 * ====================================================================
 */

class AuthSystem {
  static USERS_KEY = 'hunter_registered_users';
  static ACTIVE_USER_KEY = 'hunter_active_user';

  /**
   * Obtiene todos los usuarios registrados
   * @returns {Array<Object>}
   */
  static getUsers() {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[AuthSystem] Error al leer usuarios:', e);
      return [];
    }
  }

  /**
   * Guarda la lista de usuarios
   * @param {Array<Object>} users 
   */
  static saveUsers(users) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('[AuthSystem] Error al guardar usuarios:', e);
    }
  }

  /**
   * Obtiene el usuario actualmente conectado
   * @returns {Object|null}
   */
  static getActiveUser() {
    try {
      const data = localStorage.getItem(this.ACTIVE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Establece el usuario conectado
   * @param {Object} user 
   */
  static setActiveUser(user) {
    try {
      localStorage.setItem(this.ACTIVE_USER_KEY, JSON.stringify(user));
      this.updateNavbar();
    } catch (e) {
      console.error('[AuthSystem] Error al guardar sesión activa:', e);
    }
  }

  /**
   * Cierra la sesión activa
   */
  static logout() {
    localStorage.removeItem(this.ACTIVE_USER_KEY);
    this.updateNavbar();
    window.location.reload();
  }

  /**
   * Valida correo electrónico real (sin espacios y formato estricto)
   * @param {string} email
   * @returns {{isValid: boolean, message: string}}
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, message: 'El correo electrónico es requerido.' };
    }
    const trimmed = email.trim();
    if (trimmed !== email || email.includes(' ')) {
      return { isValid: false, message: 'El correo no debe contener espacios en blanco.' };
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Ingresa un correo electrónico real y válido (ejemplo: gamer@dominio.com).' };
    }
    return { isValid: true, message: '' };
  }

  /**
   * Valida clave de seguridad según requisitos del usuario:
   * - Entre 8 y 12 caracteres
   * - Al menos una letra mayúscula
   * - Al menos un carácter especial
   * - Sin espacios
   * @param {string} password 
   * @returns {{isValid: boolean, errors: string[]}}
   */
  static validatePassword(password) {
    const errors = [];
    if (!password) {
      return { isValid: false, errors: ['La contraseña es requerida.'] };
    }
    if (password.includes(' ')) {
      errors.push('No debe contener espacios en blanco.');
    }
    if (password.length < 8 || password.length > 12) {
      errors.push('Debe tener entre 8 y 12 caracteres.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula (A-Z).');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (!@#$%*&...).');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Registra un nuevo usuario con validación integral
   * @param {Object} userData 
   * @returns {{success: boolean, message: string, user?: Object}}
   */
  static register({ username, email, password, newsletter = true }) {
    // 1. Validar Username
    if (!username || username.trim().length < 3) {
      return { success: false, message: 'El nombre de Gamer debe tener al menos 3 caracteres.' };
    }

    // 2. Validar Email
    const emailCheck = this.validateEmail(email);
    if (!emailCheck.isValid) {
      return { success: false, message: emailCheck.message };
    }

    // 3. Validar Contraseña
    const pwCheck = this.validatePassword(password);
    if (!pwCheck.isValid) {
      return { success: false, message: pwCheck.errors[0] };
    }

    // 4. Comprobar duplicidad de email
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'Este correo electrónico ya está registrado. Por favor inicia sesión.' };
    }

    // 5. Crear usuario con biblioteca inicial y cupones de descuento
    const newUser = {
      id: 'USR_' + Date.now(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password, // Almacenamiento local para prototipo seguro
      registeredAt: new Date().toISOString(),
      newsletter: Boolean(newsletter),
      discounts: [
        { code: 'BIENVENIDOGAMER', desc: '20% de descuento en cualquier compra', discountPercent: 20 },
        { code: 'HUNTERPRO', desc: '$15 USD de regalo en compras mayores a $50 USD', discountAmount: 15 }
      ],
      purchasedGames: [
        {
          id: 4,
          title: 'Black Myth: Wukong (Edición Bienvenida)',
          acquiredDate: new Date().toLocaleDateString(),
          key: 'HNTR-WUKO-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          img: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
          genre: 'Hack & Slash / RPG',
          sizeGB: 130,
          status: 'Listo para Instalar'
        }
      ]
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setActiveUser(newUser);

    return { success: true, message: '¡Cuenta creada con éxito!', user: newUser };
  }

  /**
   * Inicia sesión verificando credenciales
   * @param {string} email 
   * @param {string} password 
   * @returns {{success: boolean, message: string, user?: Object}}
   */
  static login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Por favor ingresa tu correo y contraseña.' };
    }

    const emailClean = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailClean);

    if (!user || user.password !== password) {
      return { success: false, message: 'Correo o contraseña incorrectos. Verifica tus datos.' };
    }

    this.setActiveUser(user);
    return { success: true, message: 'Inicio de sesión exitoso.', user };
  }

  /**
   * Agrega juegos adquiridos al usuario activo
   * @param {Array<Object>} games
   */
  static addPurchasedGamesToActiveUser(games) {
    const activeUser = this.getActiveUser();
    if (!activeUser) return;

    if (!Array.isArray(activeUser.purchasedGames)) {
      activeUser.purchasedGames = [];
    }

    games.forEach(g => {
      const alreadyHas = activeUser.purchasedGames.some(pg => pg.id === g.id);
      if (!alreadyHas) {
        activeUser.purchasedGames.push({
          id: g.id,
          title: g.title,
          acquiredDate: new Date().toLocaleDateString(),
          key: 'HNTR-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
          img: g.imageUrl || g.img || 'img/predator.jpg',
          genre: g.genre || 'Acción AAA',
          sizeGB: g.sizeGB || 50,
          status: 'Disponible en Biblioteca'
        });
      }
    });

    // Actualizar en la lista general de usuarios
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === activeUser.id);
    if (index !== -1) {
      users[index] = activeUser;
      this.saveUsers(users);
    }
    this.setActiveUser(activeUser);
  }

  /**
   * Obtiene la lista de anuncios de próximos videojuegos
   * @returns {Array<Object>}
   */
  static getUpcomingAnnouncements() {
    return [
      {
        id: 'ann-1',
        title: 'Grand Theft Auto VI',
        developer: 'Rockstar Games',
        releaseYear: 'Otoño 2025 - 2026',
        genre: 'Mundo Abierto / Acción',
        platforms: ['PS5', 'Xbox Series X/S', 'PC'],
        badge: 'Hype Máximo ★★★★★',
        img: 'img/gta.jpg',
        desc: 'El regreso legendario a Vice City con Lucia y Jason. Simulación de vida urbana y gráficos hiperrealistas.',
        discountCoupon: 'BIENVENIDOGAMER'
      },
      {
        id: 'ann-2',
        title: 'Monster Hunter Wilds',
        developer: 'Capcom',
        releaseYear: '2025',
        genre: 'RPG / Caza de Monstruos',
        platforms: ['PC', 'PS5', 'Xbox Series X/S'],
        badge: 'Crossplay Total',
        img: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/library_hero.jpg',
        desc: 'Tierras Prohibidas con ecosistemas mutables en tiempo real, monturas Seikret y cacerías épicas en grupo.',
        discountCoupon: 'HUNTERPRO'
      },
      {
        id: 'ann-3',
        title: 'DOOM: The Dark Ages',
        developer: 'id Software / Bethesda',
        releaseYear: '2025',
        genre: 'FPS / Combate Medieval',
        platforms: ['PC', 'PS5', 'Xbox Series X/S'],
        badge: 'Motor idTech 8',
        img: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2877010/library_hero.jpg',
        desc: 'La precuela medieval que narra el nacimiento de la furia del Slayer con escudo sierra y dragones cibernéticos.',
        discountCoupon: 'BIENVENIDOGAMER'
      },
      {
        id: 'ann-4',
        title: 'Clair Obscur: Expedition 33',
        developer: 'Sandfall Interactive',
        releaseYear: '2025',
        genre: 'RPG Reactivo / Aventura',
        platforms: ['PC', 'PS5', 'Xbox Series X/S'],
        badge: 'Unreal Engine 5',
        img: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_hero.jpg',
        desc: 'RPG por turnos con esquivas y paradas reactivas en tiempo real. Inspirado en la deslumbrante Belle Époque francesa.',
        discountCoupon: 'HUNTERPRO'
      }
    ];
  }

  /**
   * Actualiza dinámicamente la barra de navegación en todas las páginas
   */
  static updateNavbar() {
    const activeUser = this.getActiveUser();
    const navAccessLinks = document.querySelectorAll('a.nav-link[href="login.html"]');

    navAccessLinks.forEach(link => {
      if (activeUser) {
        link.innerHTML = `<i class="bi bi-person-check-fill text-success me-1"></i>${activeUser.username}`;
        link.title = `Conectado como: ${activeUser.username} (${activeUser.email})`;
        link.style.color = 'var(--hg-secondary)';
      } else {
        link.innerHTML = `<i class="bi bi-person-circle me-1"></i>Acceder`;
        link.title = 'Iniciar sesión o registrarse';
        link.style.color = '';
      }
    });
  }

  /**
   * Inicializa el buscador global del navbar en cualquier página
   */
  static initNavbarSearch() {
    const searchForms = document.querySelectorAll('form[role="search"]');
    searchForms.forEach(form => {
      const input = form.querySelector('input[type="search"]');
      const btn = form.querySelector('button[type="submit"], button.btn-search, #liveSearchBtn');

      const executeSearch = (e) => {
        if (e) e.preventDefault();
        const query = input ? input.value.trim() : '';
        if (!query) return;

        // Si ya estamos en index.html
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
          if (window.hunterCatalogController) {
            window.hunterCatalogController._activeCriteria.query = query;
            window.hunterCatalogController.render();
            const section = document.getElementById('seccion-generos');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // Redirigir a index.html con el parámetro de búsqueda
          window.location.href = 'index.html?search=' + encodeURIComponent(query);
        }
      };

      if (form) {
        form.onsubmit = executeSearch;
      }
      if (btn) {
        btn.onclick = executeSearch;
      }
    });
  }
}

// Inicialización en DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  AuthSystem.updateNavbar();
  AuthSystem.initNavbarSearch();
  window.HunterAuth = AuthSystem;
});
