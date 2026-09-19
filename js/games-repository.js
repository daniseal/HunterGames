/**
 * ====================================================================
 * HUNTER GAMES — REPOSITORIO DE VIDEOJUEGOS AAA (2024 - 2026)
 * Arquitectura: Programación Orientada a Objetos (POO)
 * Algoritmos: Evaluación Recursiva de Predicados y Filtros Compuestos
 * Validación: Tipado Estricto de Datos y Control de Excepciones
 * ====================================================================
 */

/**
 * @typedef {Object} GameDTO
 * @property {number} id
 * @property {string} title
 * @property {number} year
 * @property {string[]} genres
 * @property {string[]} platforms
 * @property {number} sizeGB
 * @property {number} rating
 * @property {string} img
 * @property {string} desc
 * @property {string} [trailerUrl]
 * @property {string[]} [features]
 */

/**
 * Clase que modela un videojuego con validación estricta de tipos
 * y métodos de formato y serialización para la UI.
 */
class Game {
  /**
   * @param {GameDTO} data
   * @throws {TypeError} Si los tipos de datos no son válidos
   * @throws {RangeError} Si los valores numéricos están fuera de rango
   */
  constructor(data) {
    if (!data || typeof data !== 'object') {
      throw new TypeError('Game constructor requiere un objeto de datos válido.');
    }

    // Validación de Tipos (Type Checking)
    if (typeof data.id !== 'number' || isNaN(data.id)) {
      throw new TypeError(`El campo 'id' debe ser un número válido. Recibido: ${data.id}`);
    }
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new TypeError(`El campo 'title' debe ser un string no vacío. Recibido: ${data.title}`);
    }
    if (typeof data.year !== 'number' || data.year < 1980 || data.year > 2030) {
      throw new RangeError(`El campo 'year' (${data.year}) debe estar entre 1980 y 2030.`);
    }
    if (!Array.isArray(data.genres) || data.genres.length === 0) {
      throw new TypeError(`El campo 'genres' debe ser un array con al menos un género.`);
    }
    if (!Array.isArray(data.platforms) || data.platforms.length === 0) {
      throw new TypeError(`El campo 'platforms' debe ser un array con al menos una consola.`);
    }
    if (typeof data.sizeGB !== 'number' || data.sizeGB < 0) {
      throw new RangeError(`El campo 'sizeGB' debe ser un número positivo en Gigabytes.`);
    }
    if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5) {
      throw new RangeError(`El campo 'rating' debe ser un número entre 0 y 5.`);
    }
    if (typeof data.img !== 'string' || data.img.trim().length === 0) {
      throw new TypeError(`El campo 'img' debe ser una URL de imagen válida.`);
    }

    // Encapsulamiento de Propiedades
    this._id = data.id;
    this._title = data.title.trim();
    this._year = data.year;
    this._genres = data.genres.map(g => g.trim().toLowerCase());
    this._platforms = data.platforms.map(p => p.trim().toLowerCase());
    this._sizeGB = data.sizeGB;
    this._rating = data.rating;
    this._img = data.img.trim();
    this._desc = typeof data.desc === 'string' ? data.desc.trim() : 'Sin descripción disponible.';
    this._features = Array.isArray(data.features) ? data.features : ['4K HDR', 'Multiplataforma'];
    
    // Generar precio base según el año de lanzamiento
    let basePrice = 69.99; // Precio estándar AAA
    if (this._year < 2024) basePrice = 39.99;
    else if (this._year === 2024) basePrice = 59.99;
    this._price = data.price !== undefined ? data.price : basePrice;
  }

  // Getters para acceso seguro
  get id() { return this._id; }
  get title() { return this._title; }
  get year() { return this._year; }
  get genres() { return [...this._genres]; }
  get platforms() { return [...this._platforms]; }
  get sizeGB() { return this._sizeGB; }
  get rating() { return this._rating; }
  get img() { return this._img; }
  get desc() { return this._desc; }
  get features() { return [...this._features]; }
  get price() { return this._price; }

  /**
   * Obtiene el tamaño formateado en GB o TB recursivamente
   * @param {number} size
   * @returns {string}
   */
  get formattedSize() {
    return `${this._sizeGB} GB`;
  }

  /**
   * Retorna la clase CSS del badge de año
   * @returns {string}
   */
  get yearBadgeClass() {
    if (this._year >= 2026) return 'badge-2026';
    if (this._year === 2025) return 'badge-2025';
    return 'badge-2024';
  }

  /**
   * Genera el HTML de las insignias de plataforma
   * @returns {string}
   */
  renderPlatformBadges() {
    const map = {
      pc: '<span class="badge-platform badge-plat-pc"><i class="bi bi-windows"></i> PC</span>',
      ps5: '<span class="badge-platform badge-plat-ps5"><i class="bi bi-playstation"></i> PS5</span>',
      ps4: '<span class="badge-platform badge-plat-ps4"><i class="bi bi-playstation"></i> PS4</span>',
      xbox: '<span class="badge-platform badge-plat-xbox"><i class="bi bi-xbox"></i> Xbox Series X/S</span>',
      switch: '<span class="badge-platform badge-plat-switch"><i class="bi bi-nintendo-switch"></i> Switch</span>'
    };

    return this._platforms
      .map(p => map[p] || `<span class="badge-platform badge-plat-pc">${p.toUpperCase()}</span>`)
      .join(' ');
  }

  /**
   * Genera el HTML para la tarjeta en el catálogo
   * @returns {string}
   */
  renderCardHtml() {
    const genreTag = this._genres[0] || 'accion';
    const tagClass = `tag-${genreTag}`;
    const mainGenreName = genreTag.charAt(0).toUpperCase() + genreTag.slice(1);
    const featureText = this._features.join(' &middot; ');

    return `
      <div class="col-12 col-md-6 col-lg-4 game-catalog-item"
           data-id="${this._id}"
           data-year="${this._year}"
           data-genres="${this._genres.join(' ')}"
           data-platforms="${this._platforms.join(' ')}"
           data-size="${this._sizeGB}"
           data-title="${this._title.toLowerCase()}">
        <article class="game-showcase-card">
          <div class="game-showcase-img">
            <img src="${this._img}"
                 alt="${this._title}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='img/predator.jpg';">
            <div class="game-showcase-overlay"></div>
            <div class="game-showcase-top-badges">
              <span class="genre-tag ${tagClass}">${mainGenreName}</span>
              <span class="badge-year ${this.yearBadgeClass}">${this._year >= 2026 ? '2025 - 2026' : this._year}</span>
            </div>
          </div>
          <div class="game-showcase-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h3 class="game-showcase-title mb-0">${this._title}</h3>
              <span class="badge-size" title="Espacio requerido en disco">
                <i class="bi bi-hdd-fill text-secondary-hg me-1"></i>${this.formattedSize}
              </span>
            </div>
            <p class="game-showcase-desc">${this._desc}</p>
            <div class="game-showcase-platforms">
              ${this.renderPlatformBadges()}
            </div>
            <div class="game-showcase-footer d-flex flex-column gap-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
              <div class="d-flex justify-content-between align-items-center w-100">
                <span class="game-specs-meta">
                  <i class="bi bi-cpu text-secondary-hg"></i> ${featureText}
                </span>
                <button type="button" class="btn btn-sm btn-outline-secondary text-white" onclick="CatalogController.openGameModal(${this._id})">
                  <i class="bi bi-info-circle"></i>
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center w-100 mt-1">
                <span style="font-size: 1.25rem; font-weight: 700; color: var(--hg-primary);">
                  $${this._price.toFixed(2)}
                </span>
                <button type="button" class="btn-neon btn-sm" onclick="if(window.ecommerceApp) { window.ecommerceApp.cart.addItem({id: '${this._id}', title: '${this._title.replace(/'/g, "\'")}', price: ${this._price}, imageUrl: '${this._img}', platforms: ['${this._platforms[0]}']}); window.showToastCart('${this._title.replace(/'/g, "\'")}'); }">
                  <i class="bi bi-cart-plus me-1"></i>Añadir
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }
}

/**
 * Clase Repositorio que gestiona la colección de juegos,
 * filtros recursivos y ordenamiento.
 */
class GameRepository {
  constructor() {
    /** @type {Game[]} */
    this._games = [];
  }

  /**
   * Agrega un juego al repositorio con validación
   * @param {GameDTO} rawGame
   */
  add(rawGame) {
    try {
      const gameInstance = new Game(rawGame);
      this._games.push(gameInstance);
    } catch (err) {
      console.error(`[GameRepository] Error al validar juego "${rawGame?.title}":`, err.message);
    }
  }

  /**
   * Carga un lote de juegos
   * @param {GameDTO[]} gamesList
   */
  loadAll(gamesList) {
    if (!Array.isArray(gamesList)) {
      throw new TypeError('El método loadAll requiere un array.');
    }
    gamesList.forEach(g => this.add(g));
  }

  /**
   * Retorna todos los juegos
   * @returns {Game[]}
   */
  getAll() {
    return [...this._games];
  }

  /**
   * Busca un juego por su identificador
   * @param {number} id
   * @returns {Game | undefined}
   */
  getById(id) {
    return this._games.find(g => g.id === id);
  }

  /**
   * =================================================================
   * ALGORITMO RECURSIVO: Evaluación de Predicados de Filtro Compuesto
   * =================================================================
   * Evalúa recursivamente un conjunto de predicados (funciones filtro)
   * sobre un juego específico. Si alguno no se cumple, retorna false.
   *
   * @param {Game} game
   * @param {Array<(game: Game) => boolean>} predicates
   * @param {number} index
   * @returns {boolean}
   */
  evaluatePredicatesRecursively(game, predicates, index = 0) {
    // Caso base 1: Se evaluaron todos los predicados satisfactoriamente
    if (index >= predicates.length) {
      return true;
    }
    // Caso base 2: El predicado actual falló
    const currentPredicate = predicates[index];
    if (!currentPredicate(game)) {
      return false;
    }
    // Paso recursivo: Evaluar el siguiente predicado
    return this.evaluatePredicatesRecursively(game, predicates, index + 1);
  }

  /**
   * Filtra el repositorio según criterios múltiples usando el algoritmo recursivo
   * @param {Object} criteria
   * @param {string} [criteria.year]
   * @param {string} [criteria.genre]
   * @param {string} [criteria.platform]
   * @param {string} [criteria.sizeRange]
   * @param {string} [criteria.query]
   * @returns {Game[]}
   */
  filter(criteria = {}) {
    const { year = 'all', genre = 'all', platform = 'all', sizeRange = 'all', query = '' } = criteria;

    // Construcción de la lista de funciones predicado
    /** @type {Array<(game: Game) => boolean>} */
    const predicates = [];

    // 1. Predicado de Año
    if (year !== 'all') {
      const yearNum = parseInt(year, 10);
      predicates.push(g => g.year === yearNum);
    }

    // 2. Predicado de Género
    if (genre !== 'all') {
      const targetGenre = genre.toLowerCase();
      predicates.push(g => g.genres.some(gen => gen.includes(targetGenre)));
    }

    // 3. Predicado de Plataforma / Consola
    if (platform !== 'all') {
      const targetPlat = platform.toLowerCase();
      predicates.push(g => g.platforms.includes(targetPlat));
    }

    // 4. Predicado de Peso / Almacenamiento en GB
    if (sizeRange !== 'all') {
      switch (sizeRange) {
        case 'under30':
          predicates.push(g => g.sizeGB < 30);
          break;
        case '30to70':
          predicates.push(g => g.sizeGB >= 30 && g.sizeGB <= 70);
          break;
        case '70to120':
          predicates.push(g => g.sizeGB > 70 && g.sizeGB <= 120);
          break;
        case 'over120':
          predicates.push(g => g.sizeGB > 120);
          break;
      }
    }

    // 5. Predicado de Búsqueda de Texto
    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      predicates.push(g =>
        g.title.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.genres.some(gen => gen.includes(q)) ||
        g.platforms.some(p => p.includes(q))
      );
    }

    // Aplicación del algoritmo recursivo sobre la colección
    return this._games.filter(game => this.evaluatePredicatesRecursively(game, predicates, 0));
  }

  /**
   * Ordena un arreglo de juegos
   * @param {Game[]} games
   * @param {string} sortBy
   * @returns {Game[]}
   */
  sort(games, sortBy = 'year-desc') {
    const list = [...games];
    switch (sortBy) {
      case 'year-desc':
        return list.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return list.sort((a, b) => a.year - b.year);
      case 'size-desc':
        return list.sort((a, b) => b.sizeGB - a.sizeGB);
      case 'size-asc':
        return list.sort((a, b) => a.sizeGB - b.sizeGB);
      case 'rating-desc':
        return list.sort((a, b) => b.rating - a.rating);
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }
}

/**
 * DATASET MAESTRO DE VIDEOJUEGOS AAA (2024 - 2026)
 * @type {GameDTO[]}
 */
const RAW_GAMES_DATABASE = [
  {
    id: 1,
    title: "Grand Theft Auto VI",
    year: 2026,
    genres: ["accion", "aventura"],
    platforms: ["ps5", "xbox", "pc"],
    sizeGB: 150,
    rating: 5.0,
    img: "img/gta.jpg",
    desc: "La evolución definitiva del mundo abierto en Vice City y el estado de Leonida con Lucia y Jason. Gráficos y simulación hiperrealista.",
    features: ["Ray Tracing", "Mundo Abierto", "4K HDR"]
  },
  {
    id: 2,
    title: "Monster Hunter Wilds",
    year: 2025,
    genres: ["rpg", "aventura", "accion"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 140,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2246340/library_hero.jpg",
    desc: "Tierras Prohibidas con cambios climáticos drásticos, monturas Seikret y cacerías épicas con crossplay total entre plataformas.",
    features: ["Crossplay", "Coop 4P", "Modo Concentración"]
  },
  {
    id: 3,
    title: "DOOM: The Dark Ages",
    year: 2025,
    genres: ["accion", "disparos"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 90,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2877010/library_hero.jpg",
    desc: "El origen de la furia del Slayer en una guerra medieval demoníaca. Escudo sierra, mayal de calaveras y dragones mecánicos.",
    features: ["idTech 8", "120 FPS Ready", "Campaña Individual"]
  },
  {
    id: 4,
    title: "Black Myth: Wukong",
    year: 2024,
    genres: ["hack-slash", "accion", "rpg"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 130,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/library_hero.jpg",
    desc: "El Predestinado recorre la mitología de Viaje al Oeste en Unreal Engine 5 con 72 transformaciones y combate ágil.",
    features: ["Unreal Engine 5", "DLSS 3.5", "Full Ray Tracing"]
  },
  {
    id: 5,
    title: "Clair Obscur: Expedition 33",
    year: 2025,
    genres: ["rpg", "aventura"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 65,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1903340/library_hero.jpg",
    desc: "RPG reactivo por turnos inspirado en la Belle Époque francesa. Destruye a la Pintora antes de que pinte el próximo número maldito.",
    features: ["Combate Reactivo", "Banda Sonora Épica", "Unreal Engine 5"]
  },
  {
    id: 6,
    title: "Silent Hill 2 Remake",
    year: 2024,
    genres: ["terror", "aventura"],
    platforms: ["pc", "ps5"],
    sizeGB: 50,
    rating: 4.7,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/library_hero.jpg",
    desc: "James Sunderland llega al pueblo envuelto en niebla tras recibir una carta de su difunta esposa. Terror psicológico recreado desde cero.",
    features: ["Audio 3D Tempest", "Lumen & Nanite", "Cámara al hombro"]
  },
  {
    id: 7,
    title: "Kingdom Come: Deliverance II",
    year: 2025,
    genres: ["rpg", "aventura", "accion"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 110,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1771300/library_hero.jpg",
    desc: "Bohemia del siglo XV en plena guerra civil. Encarna a Henry de Skalitz en una inmersión medieval realista sin magia ni dragones.",
    features: ["Combate Histórico", "Física de Armas", "Mundo Vivo"]
  },
  {
    id: 8,
    title: "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
    year: 2024,
    genres: ["accion", "terror", "disparos"],
    platforms: ["pc", "xbox"],
    sizeGB: 160,
    rating: 4.6,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1643320/library_hero.jpg",
    desc: "Sobrevive en la Zona de Exclusión de Chernóbil repleta de anomalías cósmicas, artefactos invaluables y mutantes sanguinarios.",
    features: ["A-Life 2.0", "Unreal Engine 5", "Supervivencia Extrema"]
  },
  {
    id: 9,
    title: "God of War Ragnarök",
    year: 2024,
    genres: ["hack-slash", "accion", "aventura"],
    platforms: ["pc", "ps5", "ps4"],
    sizeGB: 190,
    rating: 5.0,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/library_hero.jpg",
    desc: "Kratos y Atreus deben decidir entre su propia seguridad y la de los Nueve Reinos mientras el Ragnarök se avecina.",
    features: ["Ultrawide 21:9 & 32:9", "DualSense Support", "Incluye Valhalla"]
  },
  {
    id: 10,
    title: "Elden Ring: Shadow of the Erdtree",
    year: 2024,
    genres: ["rpg", "hack-slash", "accion"],
    platforms: ["pc", "ps5", "ps4", "xbox"],
    sizeGB: 60,
    rating: 5.0,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
    desc: "Viaja al Reino de las Sombras tras los pasos de Miquella el Desposeído con nuevos tipos de armas, jefes brutales y calabozos secretos.",
    features: ["GOTY Edition", "Mundo Sin Límites", "Multijugador Cooperativo"]
  },
  {
    id: 11,
    title: "Dragon Ball: Sparking! ZERO",
    year: 2024,
    genres: ["arcade", "accion"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 30,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1790600/library_hero.jpg",
    desc: "El renacimiento de Budokai Tenkaichi con más de 180 luchadores de Z, Super, GT y películas con destrucción ambiental masiva.",
    features: ["Combates 3D", "Destrucción de Escenarios", "Batallas de Episodio"]
  },
  {
    id: 12,
    title: "EA Sports FC 25",
    year: 2024,
    genres: ["deportes"],
    platforms: ["pc", "ps5", "ps4", "xbox", "switch"],
    sizeGB: 50,
    rating: 4.4,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2669320/library_hero.jpg",
    desc: "FC IQ revoluciona las decisiones estratégicas de todo el equipo con datos de Opta y nuevo modo Rush 5v5 para jugar con amigos.",
    features: ["FC IQ", "Modo Rush 5v5", "Crossplay Total"]
  },
  {
    id: 13,
    title: "Forza Horizon 5",
    year: 2023,
    genres: ["deportes"],
    platforms: ["pc", "xbox"],
    sizeGB: 110,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/library_hero.jpg",
    desc: "Conducción en el mundo abierto de México con cientos de autos y clima dinámico con tormentas de arena y lluvias tropicales.",
    features: ["4K 60FPS", "Mundo Abierto Masivo", "HDR10"]
  },
  {
    id: 14,
    title: "Resident Evil 4 Gold Edition",
    year: 2023,
    genres: ["terror", "accion"],
    platforms: ["pc", "ps5", "ps4", "xbox"],
    sizeGB: 68,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/library_hero.jpg",
    desc: "Leon S. Kennedy rescata a la hija del presidente en un culto rural en España. La cumbre del survival horror moderno en RE Engine.",
    features: ["RE Engine", "Incluye Separate Ways", "Modo Mercenarios"]
  },
  {
    id: 15,
    title: "Hades II",
    year: 2024,
    genres: ["arcade", "hack-slash", "rpg"],
    platforms: ["pc", "switch"],
    sizeGB: 10,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/library_hero.jpg",
    desc: "Melínoe, princesa del Inframundo, utiliza brujería y magia oscura para enfrentar a Cronos, el titán del tiempo.",
    features: ["Roguelike Legendario", "Arte Dibujado a Mano", "Supergiant Games"]
  },
  {
    id: 16,
    title: "Microsoft Flight Simulator 2024",
    year: 2024,
    genres: ["simuladores"],
    platforms: ["pc", "xbox"],
    sizeGB: 50,
    rating: 4.7,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250410/library_hero.jpg",
    desc: "El gemelo digital de la Tierra en tiempo real con aviación comercial, rescate aéreo, combate contra incendios y globos aerostáticos.",
    features: ["Datos Satelitales", "Clima en Vivo", "Física Aerodinámica"]
  },
  {
    id: 17,
    title: "Farming Simulator 25",
    year: 2024,
    genres: ["simuladores"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 45,
    rating: 4.5,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2300320/library_hero.jpg",
    desc: "Siembra arrozales asiáticos, campos de trigo estadounidenses y colinas centroeuropeas con física de deformación de barro.",
    features: ["Maquinaria Real", "Deformación de Suelo", "Modo Cooperativo"]
  },
  {
    id: 18,
    title: "Warhammer 40,000: Space Marine 2",
    year: 2024,
    genres: ["accion", "disparos", "hack-slash"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 75,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1849250/library_hero.jpg",
    desc: "El teniente Titus combate millones de Tiránidas con espada sierra, rifle bólter y fuerza de supersoldado en batallas colosales.",
    features: ["Swarm Engine", "Campaña Cooperativa 3P", "JcJ 6v6"]
  },
  {
    id: 19,
    title: "Final Fantasy XVI",
    year: 2024,
    genres: ["rpg", "hack-slash", "accion"],
    platforms: ["pc", "ps5"],
    sizeGB: 170,
    rating: 4.7,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2515020/library_hero.jpg",
    desc: "Clive Rosfield desata el poder del Eikon Ifrit en batallas de titanes cinemáticas que sacuden el continente de Valisthea.",
    features: ["Batallas Eikónicas", "Combate en Tiempo Real", "Incluye DLCs"]
  },
  {
    id: 20,
    title: "Tekken 8",
    year: 2024,
    genres: ["arcade", "accion"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 100,
    rating: 4.8,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1778820/library_hero.jpg",
    desc: "Siente el impacto de cada golpe con Unreal Engine 5, el sistema Heat ofensivo y el clímax del enfrentamiento Mishima.",
    features: ["Unreal Engine 5", "Rollback Netcode", "Crossplay"]
  },
  {
    id: 21,
    title: "Cyberpunk 2077: Phantom Liberty",
    year: 2023,
    genres: ["rpg", "accion", "disparos"],
    platforms: ["pc", "ps5", "xbox"],
    sizeGB: 70,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg",
    desc: "Thriller de espionaje en Dogtown con Solomon Reed e Idris Elba. Árbol de habilidades Relic y combate vehicular.",
    features: ["Path Tracing", "DLSS 3.5 Ray Reconstruction", "Dogtown"]
  },
  {
    id: 22,
    title: "The Legend of Zelda: Tears of the Kingdom",
    year: 2023,
    genres: ["aventura", "rpg"],
    platforms: ["switch"],
    sizeGB: 16,
    rating: 5.0,
    img: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    desc: "Link surca los cielos y las profundidades de Hyrule construyendo vehículos e ingenios mecánicos con Ultramano y Combinación.",
    features: ["Física Emergente", "Islas Celestes", "Exclusivo Nintendo"]
  },
  {
    id: 23,
    title: "Helldivers 2",
    year: 2024,
    genres: ["disparos", "accion"],
    platforms: ["pc", "ps5"],
    sizeGB: 70,
    rating: 4.7,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg",
    desc: "Lucha por la Democracia Gestionada en una guerra galáctica interconectada contra Autómatas y Termínidos con amigos.",
    features: ["Guerra Galáctica en Vivo", "Estratagemas Épicas", "Crossplay"]
  },
  {
    id: 24,
    title: "Ghost of Yōtei",
    year: 2025,
    genres: ["accion", "aventura"],
    platforms: ["ps5"],
    sizeGB: 85,
    rating: 4.9,
    img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2215430/header.jpg",
    desc: "Atsu recorre las tierras salvajes del Monte Yōtei en 1603. La esperada secuela de Ghost of Tsushima por Sucker Punch.",
    features: ["Exclusivo PS5", "DualSense Inmersivo", "Japón Feudal"]
  }
];

/**
 * Clase Controlador que conecta el Repositorio con la Interfaz de Usuario (DOM)
 */
class CatalogController {
  /**
   * @param {GameRepository} repository
   */
  constructor(repository) {
    this._repo = repository;
    this._activeCriteria = {
      year: 'all',
      genre: 'all',
      platform: 'all',
      sizeRange: 'all',
      query: ''
    };
    this._activeSort = 'year-desc';

    this._gridElement = document.getElementById('gamesShowcaseGrid');
    this._counterElement = document.getElementById('filterCounter');
    this._noResultsElement = document.getElementById('noResultsMsg');
  }

  /**
   * Inicializa los listeners y renderiza la lista inicial
   */
  init() {
    this._bindEvents();
    this.render();
  }

  /**
   * Vincula los controladores de eventos con debounce y delegación
   * @private
   */
  _bindEvents() {
    // 1. Filtro por Género (Píldoras)
    const genrePills = document.querySelectorAll('[data-genre-filter]');
    genrePills.forEach(pill => {
      pill.addEventListener('click', () => {
        genrePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this._activeCriteria.genre = pill.getAttribute('data-genre-filter') || 'all';
        this.render();
      });
    });

    // 2. Filtro por Plataforma (Píldoras)
    const platformPills = document.querySelectorAll('[data-platform-filter]');
    platformPills.forEach(pill => {
      pill.addEventListener('click', () => {
        platformPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this._activeCriteria.platform = pill.getAttribute('data-platform-filter') || 'all';
        this.render();
      });
    });

    // 3. Filtro por Año (Selector o botones)
    const yearSelect = document.getElementById('yearFilterSelect');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        this._activeCriteria.year = e.target.value;
        this.render();
      });
    }

    // 4. Filtro por Peso / Almacenamiento (Selector)
    const sizeSelect = document.getElementById('sizeFilterSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        this._activeCriteria.sizeRange = e.target.value;
        this.render();
      });
    }

    // 5. Selector de Ordenamiento
    const sortSelect = document.getElementById('sortFilterSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this._activeSort = e.target.value;
        this.render();
      });
    }

    // 6. Buscador en vivo con debounce
    const searchInput = document.getElementById('liveSearchInput');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this._activeCriteria.query = e.target.value.trim();
          this.render();
        }, 150);
      });
    }

    // 7. Botón de Reiniciar Filtros
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // 8. Enlaces del menú desplegable del Navbar
    document.querySelectorAll('.genre-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetGenre = link.getAttribute('data-genre') || 'all';
        this.setGenreFromNavbar(targetGenre);
      });
    });
  }

  /**
   * Cambia el filtro de género desde el navbar o scripts externos
   * @param {string} genre
   */
  setGenreFromNavbar(genre) {
    this._activeCriteria.genre = genre;
    const genrePills = document.querySelectorAll('[data-genre-filter]');
    genrePills.forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-genre-filter') === genre);
    });
    this.render();
    const section = document.getElementById('seccion-generos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Reinicia todos los filtros a su estado inicial
   */
  resetFilters() {
    this._activeCriteria = {
      year: 'all',
      genre: 'all',
      platform: 'all',
      sizeRange: 'all',
      query: ''
    };
    this._activeSort = 'year-desc';

    document.querySelectorAll('[data-genre-filter]').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-genre-filter') === 'all');
    });
    document.querySelectorAll('[data-platform-filter]').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-platform-filter') === 'all');
    });

    const yearSelect = document.getElementById('yearFilterSelect');
    if (yearSelect) yearSelect.value = 'all';

    const sizeSelect = document.getElementById('sizeFilterSelect');
    if (sizeSelect) sizeSelect.value = 'all';

    const sortSelect = document.getElementById('sortFilterSelect');
    if (sortSelect) sortSelect.value = 'year-desc';

    const searchInput = document.getElementById('liveSearchInput');
    if (searchInput) searchInput.value = '';

    this.render();
  }

  /**
   * Renderiza los juegos filtrados y ordenados en el DOM
   */
  render() {
    if (!this._gridElement) return;

    try {
      // 1. Filtrado usando el algoritmo recursivo del repositorio
      const filtered = this._repo.filter(this._activeCriteria);

      // 2. Ordenamiento
      const sorted = this._repo.sort(filtered, this._activeSort);

      // 3. Renderizado del DOM
      if (sorted.length === 0) {
        this._gridElement.innerHTML = '';
        if (this._noResultsElement) this._noResultsElement.classList.remove('d-none');
        if (this._counterElement) this._counterElement.textContent = '0 juegos';
      } else {
        if (this._noResultsElement) this._noResultsElement.classList.add('d-none');
        if (this._counterElement) {
          this._counterElement.textContent = `${sorted.length} juego${sorted.length === 1 ? '' : 's'} encontrado${sorted.length === 1 ? '' : 's'}`;
        }
        this._gridElement.innerHTML = sorted.map(game => game.renderCardHtml()).join('');
      }
    } catch (err) {
      console.error('[CatalogController] Error durante el renderizado:', err);
      this._gridElement.innerHTML = `
        <div class="col-12 text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle fs-2"></i>
          <p>Ocurrió un error al procesar el catálogo: ${err.message}</p>
        </div>
      `;
    }
  }

  /**
   * Abre el modal de detalles para un juego
   * @param {number} gameId
   */
  static openGameModal(gameId) {
    if (!window.hunterGamesRepo) return;
    const game = window.hunterGamesRepo.getById(gameId);
    if (!game) return;

    const modalTitle = document.getElementById('gameModalTitle');
    const modalImg = document.getElementById('gameModalImg');
    const modalDesc = document.getElementById('gameModalDesc');
    const modalYear = document.getElementById('gameModalYear');
    const modalSize = document.getElementById('gameModalSize');
    const modalPlatforms = document.getElementById('gameModalPlatforms');
    const modalFeatures = document.getElementById('gameModalFeatures');

    if (modalTitle) modalTitle.textContent = game.title;
    if (modalImg) modalImg.src = game.img;
    if (modalDesc) modalDesc.textContent = game.desc;
    if (modalYear) modalYear.textContent = `Lanzamiento: ${game.year}`;
    if (modalSize) modalSize.textContent = `Tamaño: ${game.formattedSize}`;
    if (modalPlatforms) modalPlatforms.innerHTML = game.renderPlatformBadges();
    if (modalFeatures) modalFeatures.innerHTML = game.features.map(f => `<span class="badge bg-dark border border-secondary text-info me-1">${f}</span>`).join('');

    const modalEl = document.getElementById('gameDetailModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();

      // Garantizar que los botones de cierre funcionen sin fallo
      modalEl.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          modal.hide();
        };
      });
    }
  }
}

/**
 * Carga enriquecida en segundo plano con caché en sessionStorage y timeout de 3.5s.
 * Garantiza que la página cargue en 0ms y nunca se quede colgada si la API externa está lenta.
 * @param {GameRepository} repo
 * @param {CatalogController} controller
 */
async function fetchLiveGamesInBackground(repo, controller) {
  const CACHE_KEY = 'hunter_cached_api_games';
  const CACHE_TIME_KEY = 'hunter_cached_api_games_time';
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  // 1. Intentar cargar desde caché de sesión para arranque instantáneo (0ms)
  try {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
    if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_TTL)) {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        repo.loadAll(parsed);
        controller.render();
        console.info(`[HunterGames] ⚡ ${parsed.length} títulos en vivo cargados instantáneamente desde caché.`);
        return;
      }
    }
  } catch (e) {
    console.warn('[HunterGames] Error leyendo caché local:', e);
  }

  // 2. Si no hay caché o caducó, consultar CheapShark API con timeout de seguridad (3.5s)
  try {
    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 3500);

    const response = await fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&sortBy=Metacritic&AAA=1', {
      signal: abortCtrl.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const liveGames = await response.json();
      const existingTitles = new Set(repo.getAll().map(g => g.title.toLowerCase()));
      
      const apiGames = liveGames
        .filter(g => g.steamAppID && !existingTitles.has(g.title.toLowerCase()))
        .slice(0, 24)
        .map((g, index) => {
          return {
            id: 1000 + index,
            title: g.title,
            year: new Date(g.releaseDate * 1000).getFullYear() || 2024,
            genres: [['accion', 'rpg', 'aventura', 'disparos'][Math.floor(Math.random() * 4)]],
            platforms: ['pc'],
            sizeGB: Math.floor(Math.random() * 50) + 15,
            rating: parseFloat(g.dealRating) || 4.5,
            img: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${g.steamAppID}/header.jpg`,
            desc: `Juego aclamado por la crítica con Metascore de ${g.metacriticScore}. Adquiérelo a $${g.salePrice} (Antes $${g.normalPrice}).`,
            features: ['Singleplayer', 'API Data', 'Metacritic'],
            price: parseFloat(g.salePrice) || 39.99
          };
        });

      if (apiGames.length > 0) {
        repo.loadAll(apiGames);
        controller.render();
        
        // Guardar en sesión para cargas inmediatas posteriores
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(apiGames));
          sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (e) {}
        console.info(`[HunterGames] 🌐 ${apiGames.length} juegos en vivo añadidos y cacheados exitosamente.`);
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      console.warn('[HunterGames] ⏱️ Timeout en API externa (3.5s). Se mantiene la base de datos local fluida.');
    } else {
      console.warn('[HunterGames] Error al sincronizar API externa:', e);
    }
  }
}

// Inicialización Global Inmediata (0ms Latencia)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const repo = new GameRepository();
    repo.loadAll(RAW_GAMES_DATABASE);
    window.hunterGamesRepo = repo;

    const controller = new CatalogController(repo);
    controller.init();
    window.hunterCatalogController = controller;

    console.info(`[HunterGames] 🚀 Catálogo cargado instantáneamente con ${repo.getAll().length} títulos AAA base.`);

    // Sincronización asíncrona no bloqueante
    fetchLiveGamesInBackground(repo, controller);
  } catch (err) {
    console.error('[HunterGames] Fallo en la inicialización:', err);
  }
});


