/**
 * Auto-generated from docs/openapi.yaml
 * Regenerate with: npm run gen:api
 */

export interface paths {
  "/api/auth/register": {
    post: operations["register"];
  };
  "/api/auth/login": {
    post: operations["login"];
  };
  "/api/auth/refresh": {
    post: operations["refreshToken"];
  };
  "/api/auth/logout": {
    post: operations["logout"];
  };
  "/api/auth/forgot-password": {
    post: operations["forgotPassword"];
  };
  "/api/auth/reset-password": {
    post: operations["resetPassword"];
  };
  "/api/users/me": {
    get: operations["getProfile"];
    put: operations["updateElectricityPrice"];
  };
  "/api/aquariums": {
    get: operations["listAquariums"];
    post: operations["createAquarium"];
  };
  "/api/aquariums/{id}": {
    get: operations["getAquariumDetail"];
    put: operations["updateAquarium"];
    delete: operations["deleteAquarium"];
  };
  "/api/aquariums/{id}/equipment": {
    get: operations["listEquipment"];
    post: operations["addEquipment"];
  };
  "/api/equipment/{id}": {
    put: operations["updateEquipment"];
    delete: operations["deleteEquipment"];
  };
  "/api/aquariums/{id}/energy": {
    get: operations["calculateEnergy"];
  };
  "/api/aquariums/{id}/livestock": {
    get: operations["listLivestock"];
    post: operations["addLivestock"];
  };
  "/api/livestock/{id}": {
    put: operations["updateLivestock"];
    delete: operations["deleteLivestock"];
  };
  "/api/scraper/search": {
    get: operations["scraperSearch"];
  };
  "/api/wishlist": {
    get: operations["getWishlist"];
    post: operations["addToWishlist"];
  };
  "/api/wishlist/{id}": {
    put: operations["updateWishlistItem"];
    delete: operations["removeFromWishlist"];
  };
  "/api/aquariums/{id}/parameters": {
    get: operations["getWaterParameters"];
    post: operations["logWaterParameter"];
  };
  "/api/dashboard/summary": {
    get: operations["getDashboardSummary"];
  };
  "/api/chat/usage": {
    get: operations["getChatUsage"];
  };
  "/api/chat": {
    post: operations["sendChatMessage"];
  };
  "/api/species": {
    get: operations["searchSpecies"];
  };
  "/api/species/{id}": {
    get: operations["getSpeciesById"];
  };
}

export interface components {
  schemas: {
    // ── Enumeraciones ───────────────────────────────────────────────────────
    /** @enum {string} */
    SubscriptionPlan: "FREE" | "REEFMASTER";
    /** @enum {string} */
    AquariumType: "REEF" | "FISH_ONLY" | "MIXED";
    /** @enum {string} */
    LivestockCategory: "FISH" | "CORAL" | "INVERTEBRATE";
    /** @enum {string} */
    EquipmentCategory: "LIGHT" | "PUMP" | "SKIMMER" | "HEATER" | "OTHER";
    /** @enum {string} */
    WishlistCategory: "EQUIPMENT" | "LIVESTOCK" | "SUPPLEMENT" | "OTHER";
    /** @enum {string} */
    WishlistPriority: "LOW" | "MEDIUM" | "HIGH";

    // ── Autenticación ────────────────────────────────────────────────────────
    AuthRequest: {
      /** @description Email del usuario registrado */
      email: string;
      password: string;
    };
    AuthResponse: {
      /** @description JWT de acceso (TTL 15 min) */
      token?: string;
      /** @description Refresh token opaco (TTL 30 días). Solo presente en login y refresh. */
      refreshToken?: string | null;
      username?: string;
      email?: string;
      subscriptionPlan?: components["schemas"]["SubscriptionPlan"];
    };
    RefreshTokenRequest: {
      /** @description Refresh token opaco recibido en el login */
      refreshToken: string;
    };
    ForgotPasswordRequest: {
      /** @description Email de la cuenta cuya contraseña se quiere resetear */
      email: string;
    };
    ResetPasswordRequest: {
      /** @description Token de reseteo recibido por email */
      token: string;
      /**
       * @description Nueva contraseña: mínimo 8 caracteres, al menos una letra y un número
       * @minLength 8
       */
      newPassword: string;
    };
    RegisterRequest: {
      /** @maxLength 50 */
      username: string;
      /** @description Email único */
      email: string;
      /**
       * @description Contraseña: mínimo 8 caracteres, al menos una letra y un número
       * @minLength 8
       */
      password: string;
    };

    // ── Usuario ──────────────────────────────────────────────────────────────
    UserResponse: {
      id?: number;
      username?: string;
      email?: string;
      subscriptionPlan?: components["schemas"]["SubscriptionPlan"];
      electricityPriceKwh?: number | null;
      /** @description Interface language: en | de | es */
      locale?: string | null;
      /** @description C or F */
      temperatureUnit?: string | null;
      /** @description L or GAL */
      volumeUnit?: string | null;
    };
    UpdateUserRequest: {
      electricityPriceKwh?: number | null;
      locale?: string | null;
      temperatureUnit?: string | null;
      volumeUnit?: string | null;
    };

    // ── Acuarios ─────────────────────────────────────────────────────────────
    AquariumRequest: {
      /** @description Nombre descriptivo del acuario */
      name: string;
      /** @description Volumen en litros */
      liters: number;
      type: components["schemas"]["AquariumType"];
    };
    AquariumSummaryResponse: {
      id?: number;
      name?: string;
      liters?: number;
      type?: components["schemas"]["AquariumType"];
    };
    AquariumDetailResponse: {
      id?: number;
      name?: string;
      liters?: number;
      type?: components["schemas"]["AquariumType"];
      equipment?: components["schemas"]["EquipmentResponse"][];
      livestock?: components["schemas"]["LivestockResponse"][];
    };

    // ── Equipamiento ─────────────────────────────────────────────────────────
    EquipmentRequest: {
      /** @maxLength 100 */
      name: string;
      /** @minimum 1 */
      powerWatts: number;
      /** @minimum 0.1 @maximum 24 */
      hoursPerDay: number;
      category?: components["schemas"]["EquipmentCategory"];
    };
    EquipmentResponse: {
      id?: number;
      name?: string;
      powerWatts?: number;
      hoursPerDay?: number;
      category?: components["schemas"]["EquipmentCategory"] | null;
    };
    EquipmentEnergyCost: {
      equipmentId?: number;
      name?: string;
      powerWatts?: number;
      hoursPerDay?: number;
      /** @description Coste mensual en € con escala de 4 decimales (BigDecimal) */
      monthlyCost?: number;
    };
    EnergyResponse: {
      aquariumId?: number;
      aquariumName?: string;
      /** @description Suma de costes de todos los equipos (BigDecimal) */
      totalMonthlyCost?: number;
      electricityPriceKwh?: number;
      /** @example € */
      currencySymbol?: string;
      equipmentBreakdown?: components["schemas"]["EquipmentEnergyCost"][];
    };

    // ── Fauna ────────────────────────────────────────────────────────────────
    LivestockRequest: {
      /** @description Nombre del espécimen (puede ser personalizado) */
      name: string;
      category: components["schemas"]["LivestockCategory"];
      /** @description Si es compatible con acuarios de tipo arrecife */
      reefSafe: boolean;
      /** @minimum 1 */
      quantity: number;
      /** @description ID de la especie en el catálogo. Null para especímenes personalizados. */
      speciesCatalogId?: number | null;
    };
    LivestockResponse: {
      id?: number;
      name?: string;
      category?: components["schemas"]["LivestockCategory"];
      reefSafe?: boolean;
      quantity?: number;
      speciesCatalogId?: number | null;
    };
    AddLivestockResponse: {
      livestock?: components["schemas"]["LivestockResponse"];
      /** @description Advertencia de incompatibilidad reef-safe. Ausente cuando no hay problema. */
      warning?: string | null;
    };

    // ── Catálogo de Especies ──────────────────────────────────────────────────
    SpeciesCatalogResponse: {
      id?: number;
      commonName?: string;
      scientificName?: string;
      category?: components["schemas"]["LivestockCategory"];
      reefSafe?: boolean;
      imageUrl?: string | null;
      notes?: string | null;
    };

    // ── Scraper ───────────────────────────────────────────────────────────────
    ScraperProductResult: {
      /** @description Nombre del producto */
      name?: string;
      /** @description Precio en euros */
      price?: number;
      imgUrl?: string | null;
      /** @description Enlace directo al producto en la tienda */
      productUrl?: string;
      /** @description Nombre de la tienda (tiendanimal, kiwoko...) */
      storeName?: string;
    };
    ScraperResponse: {
      keyword?: string;
      store?: string;
      total?: number;
      results?: components["schemas"]["ScraperProductResult"][];
      /** @description TIMEOUT_ERROR | SERVICE_UNAVAILABLE. Null si todo fue bien. */
      errorCode?: string | null;
    };

    // ── Wishlist ──────────────────────────────────────────────────────────────
    WishlistItemRequest: {
      /** @maxLength 200 */
      productName: string;
      /** @minimum 0 */
      price: number;
      imgUrl?: string | null;
      /** @maxLength 500 */
      productUrl: string;
      /** @maxLength 100 */
      storeName: string;
      category?: components["schemas"]["WishlistCategory"] | null;
      priority?: components["schemas"]["WishlistPriority"] | null;
      /** @maxLength 500 */
      notes?: string | null;
    };
    WishlistItemResponse: {
      id?: number;
      productName?: string;
      price?: number;
      imgUrl?: string | null;
      productUrl?: string;
      storeName?: string;
      category?: components["schemas"]["WishlistCategory"] | null;
      priority?: components["schemas"]["WishlistPriority"] | null;
      notes?: string | null;
    };
    WishlistUpdateRequest: {
      /** @maxLength 500 */
      notes?: string | null;
      priority?: components["schemas"]["WishlistPriority"] | null;
    };

    // ── Parámetros del agua ────────────────────────────────────────────────
    WaterParameterPageResponse: {
      content?: components["schemas"]["WaterParameterResponse"][];
      /** @description Total de mediciones que coinciden con el filtro */
      totalElements?: number;
      totalPages?: number;
      /** @description Número de página actual (0-based) */
      number?: number;
      size?: number;
    };
    WaterParameterRequest: {
      /** @description Temperatura en °C (o °F según preferencia del usuario) */
      temperature?: number | null;
      /** @description Salinidad en ppt (partes por mil) */
      salinity?: number | null;
      /** @description pH del agua */
      ph?: number | null;
      /** @description Alcalinidad en dKH */
      alkalinityDKH?: number | null;
      /** @description Calcio en ppm */
      calciumPPM?: number | null;
      /** @description Magnesio en ppm */
      magnesiumPPM?: number | null;
      /** @description Nitratos en ppm */
      nitratesPPM?: number | null;
      /** @description Fosfatos en ppm */
      phosphatesPPM?: number | null;
      /** @description Momento de la medición. Si se omite, se usa la fecha y hora actuales. */
      measuredAt?: string | null;
    };
    WaterParameterResponse: {
      id?: number;
      aquariumId?: number;
      temperature?: number | null;
      salinity?: number | null;
      ph?: number | null;
      alkalinityDKH?: number | null;
      calciumPPM?: number | null;
      magnesiumPPM?: number | null;
      nitratesPPM?: number | null;
      phosphatesPPM?: number | null;
      /** @format date-time */
      measuredAt?: string;
    };

    // ── Dashboard ────────────────────────────────────────────────────────────
    DashboardSummaryResponse: {
      /** @description Número total de acuarios del usuario */
      aquariumCount?: number;
      /** @description Número total de especímenes en todos los acuarios */
      totalLivestock?: number;
      /** @description Número total de equipos en todos los acuarios */
      totalEquipment?: number;
    };

    // ── Chat ─────────────────────────────────────────────────────────────────
    ChatUsageResponse: {
      /** @description Mensajes enviados hoy */
      used?: number;
      /** @description Límite diario del plan. -1 significa ilimitado (REEFMASTER). */
      limit?: number;
    };
    ChatRequest: {
      /**
       * @description Mensaje del usuario al asistente IA
       * @minLength 1 @maxLength 2000
       */
      message: string;
      /** @description ID del acuario cuyo contexto se adjuntará al prompt. Null para consultas genéricas. */
      aquariumId?: number | null;
    };
    ChatResponse: {
      /** @description Respuesta generada por el asistente IA. Vacío si hubo error. */
      reply?: string;
      /** @description GEMINI_ERROR | GEMINI_UNAVAILABLE | INVALID_REQUEST. Null si todo fue bien. */
      errorCode?: string | null;
    };

    // ── Notificaciones ───────────────────────────────────────────────────────
    /** @enum {string} */
    NotificationType: "INFO" | "WARNING" | "SUCCESS";
    NotificationResponse: {
      /** @format int64 */
      id?: number;
      title?: string;
      message?: string;
      type?: components["schemas"]["NotificationType"];
      read?: boolean;
      /** @format date-time */
      createdAt?: string;
    };

    // ── Error ────────────────────────────────────────────────────────────────
    ErrorResponse: {
      /** @description Descripción legible del error */
      message?: string;
      /** @format date-time */
      timestamp?: string;
    };
  };
}

export interface operations {
  register: {
    requestBody: { content: { "application/json": components["schemas"]["RegisterRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["UserResponse"] } };
      409: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  login: {
    requestBody: { content: { "application/json": components["schemas"]["AuthRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["AuthResponse"] } };
      401: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  refreshToken: {
    requestBody: { content: { "application/json": components["schemas"]["RefreshTokenRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["AuthResponse"] } };
      401: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  logout: {
    requestBody: { content: { "application/json": components["schemas"]["RefreshTokenRequest"] } };
    responses: { 204: never };
  };
  forgotPassword: {
    requestBody: { content: { "application/json": components["schemas"]["ForgotPasswordRequest"] } };
    responses: { 204: never };
  };
  resetPassword: {
    requestBody: { content: { "application/json": components["schemas"]["ResetPasswordRequest"] } };
    responses: {
      204: never;
      400: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  getProfile: {
    responses: { 200: { content: { "application/json": components["schemas"]["UserResponse"] } } };
  };
  updateElectricityPrice: {
    requestBody: { content: { "application/json": components["schemas"]["UpdateUserRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["UserResponse"] } };
      400: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  listAquariums: {
    responses: { 200: { content: { "application/json": components["schemas"]["AquariumSummaryResponse"][] } } };
  };
  createAquarium: {
    requestBody: { content: { "application/json": components["schemas"]["AquariumRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["AquariumSummaryResponse"] } };
      400: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
      403: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  getAquariumDetail: {
    parameters: { path: { id: number } };
    responses: {
      200: { content: { "application/json": components["schemas"]["AquariumDetailResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  updateAquarium: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["AquariumRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["AquariumSummaryResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  deleteAquarium: {
    parameters: { path: { id: number } };
    responses: {
      204: never;
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  listEquipment: {
    parameters: { path: { id: number } };
    responses: {
      200: { content: { "application/json": components["schemas"]["EquipmentResponse"][] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  addEquipment: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["EquipmentRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["EquipmentResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  updateEquipment: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["EquipmentRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["EquipmentResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  deleteEquipment: {
    parameters: { path: { id: number } };
    responses: {
      204: never;
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  calculateEnergy: {
    parameters: { path: { id: number } };
    responses: {
      200: { content: { "application/json": components["schemas"]["EnergyResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
      422: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  listLivestock: {
    parameters: { path: { id: number } };
    responses: {
      200: { content: { "application/json": components["schemas"]["LivestockResponse"][] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  addLivestock: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["LivestockRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["AddLivestockResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  updateLivestock: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["LivestockRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["LivestockResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  deleteLivestock: {
    parameters: { path: { id: number } };
    responses: {
      204: never;
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  scraperSearch: {
    parameters: { query: { keyword: string } };
    responses: { 200: { content: { "application/json": components["schemas"]["ScraperResponse"] } } };
  };
  getWishlist: {
    responses: { 200: { content: { "application/json": components["schemas"]["WishlistItemResponse"][] } } };
  };
  addToWishlist: {
    requestBody: { content: { "application/json": components["schemas"]["WishlistItemRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["WishlistItemResponse"] } };
      400: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  updateWishlistItem: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["WishlistUpdateRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["WishlistItemResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  removeFromWishlist: {
    parameters: { path: { id: number } };
    responses: {
      204: never;
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  getWaterParameters: {
    parameters: {
      path: { id: number };
      query?: { from?: string; to?: string; page?: number; size?: number };
    };
    responses: {
      200: { content: { "application/json": components["schemas"]["WaterParameterPageResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  logWaterParameter: {
    parameters: { path: { id: number } };
    requestBody: { content: { "application/json": components["schemas"]["WaterParameterRequest"] } };
    responses: {
      201: { content: { "application/json": components["schemas"]["WaterParameterResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  getDashboardSummary: {
    responses: { 200: { content: { "application/json": components["schemas"]["DashboardSummaryResponse"] } } };
  };
  getChatUsage: {
    responses: { 200: { content: { "application/json": components["schemas"]["ChatUsageResponse"] } } };
  };
  sendChatMessage: {
    requestBody: { content: { "application/json": components["schemas"]["ChatRequest"] } };
    responses: {
      200: { content: { "application/json": components["schemas"]["ChatResponse"] } };
      429: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  searchSpecies: {
    parameters?: { query?: { search?: string } };
    responses: { 200: { content: { "application/json": components["schemas"]["SpeciesCatalogResponse"][] } } };
  };
  getSpeciesById: {
    parameters: { path: { id: number } };
    responses: {
      200: { content: { "application/json": components["schemas"]["SpeciesCatalogResponse"] } };
      404: { content: { "application/json": components["schemas"]["ErrorResponse"] } };
    };
  };
  getNotifications: {
    responses: { 200: { content: { "application/json": components["schemas"]["NotificationResponse"][] } } };
  };
}
