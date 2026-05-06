# NEXT STEP AUDIT — Thalassa

> **Fecha:** 2026-05-03
> **Auditor:** Tech Lead (Claude Code)
> **Rama auditada:** `feat/fase14-mvp` (== `main` @ `88d81f6`)
> **Scope:** Auditoría pre-entrega TFG para identificar gaps y definir alcance MVP final.

---

## Resumen Ejecutivo

El proyecto está significativamente más avanzado de lo que sugería el backlog pendiente. El backend cubre ~90% del dominio funcional con endpoints reales sobre PostgreSQL. Los 4 "huecos" visibles en el frontend son stubs intencionados (`ComingSoonView`) que no reflejan ausencia de backend, sino trabajo de UI pendiente.

**Veredicto:** La base es sólida. En ~15h de desarrollo frontend se puede tener una demo completa y convincente.

---

## 1. Estado del Frontend

### Páginas completamente implementadas ✅

| Página | Ruta | Notas |
|--------|------|-------|
| Dashboard | `/dashboard` | CRUD acuarios, stats globales, skeleton loading |
| Aquarium Detail | `/dashboard/aquarium/:id` | Parámetros + charts + livestock + equipment, CSV export |
| Landing | `/` | Hero, pricing, features — datos de marketing hardcoded (intencional) |
| Login / Register | `/login`, `/register` | Auth completo, RHF + Zod, errores de API |
| Forgot / Reset Password | `/forgot-password`, `/reset-password` | Token handling correcto |
| Profile | `/dashboard/profile` | User info + selector idioma — sección Settings stub |
| AI Chat | `drawer global` | Rate limiting, context selector, typing indicator |

### Páginas en stub `ComingSoonView` ❌

| Página | Ruta | Backend disponible |
|--------|------|--------------------|
| Wishlist | `/dashboard/wishlist` | ✅ 100% (CRUD completo) |
| Energy Calculator | `/dashboard/calculator/energy` | ✅ endpoint `GET /api/aquariums/{id}/energy` |
| Market | `/dashboard/market` | ⚠️ Solo scraper (no transacciones) |
| Dosing Calculator | `/dashboard/calculator/dosing` | ❌ No existe |

### Secciones parciales ⚠️

| Sección | Estado | Backend disponible |
|---------|--------|--------------------|
| Profile → Settings | "Coming soon" badge | ✅ `PUT /api/users/me` acepta electricityPrice, locale, units |
| Notification Bell | Funciona pero datos hardcoded en backend | ⚠️ Mock (ver sección backend) |

---

## 2. Estado del Backend

### Endpoints completamente implementados ✅

| Dominio | Endpoints | Notas |
|---------|-----------|-------|
| Auth | POST register/login/refresh/logout/forgot-password/reset-password | JWT + refresh token rotation |
| User | GET/PUT `/api/users/me` | electricityPrice, locale, temperatureUnit, volumeUnit |
| Aquariums | CRUD completo + sub-recursos | Ownership validation, FREE tier gate |
| Equipment | CRUD + energy calculation | Fórmula kWh/mes implementada |
| Livestock | CRUD + reef-safe warning | Link opcional a SpeciesCatalog |
| Parameters | Log + historial paginado + CSV export | 8 parámetros, filtro por rango de fechas |
| Wishlist | CRUD completo (priority, notes, category) | 100% funcional |
| Species Catalog | Search + browse | Seed data incluido |
| Dashboard | Summary (contadores globales) | |
| AI Chat | Proxy Gemini + rate limiting | FREE: 5/día, REEFMASTER: ilimitado |
| Scraper | Proxy Python → tiendanimal + kiwoko | Error handling robusto |

### Endpoints mock/stub ❌

| Endpoint | Estado | Impacto |
|----------|--------|---------|
| `GET /api/notifications` | Devuelve 5 notificaciones hardcodeadas en el controller. Sin BD. | Demo-able. No crítico para TFG. |

### Endpoints completamente ausentes ❌

| Feature | Endpoints faltantes | Decisión |
|---------|---------------------|---------|
| Dosing Calculator | Ninguno | FE puro — fórmulas en JavaScript |
| Mantenimiento/Schedules | Ninguno | **DESCARTADO** Post-v1.0 |
| Alertas automáticas (triggers BD) | Ninguno | **DESCARTADO** Post-v1.0 |
| Email real (SMTP) | `EmailService` loguea a SLF4J | **DESCARTADO** — no visible en demo |
| Marketplace transacciones | Ninguno | **DESCARTADO** Post-v1.0 |

### Servicios con deuda técnica (no bloquea demo)

| Servicio | Issue | Prioridad |
|----------|-------|-----------|
| `EmailService.java` | Loguea reset links a SLF4J en vez de enviar email real | Post-v1.0 |
| `ScraperController.java` | No expone el parámetro `store` del Python service | Post-v1.0 (workaround: filtro client-side) |

---

## 3. Infraestructura y Seguridad

### Estado post-fases 1–13

Las fases de hardening (1–3) y observabilidad (11) ya se ejecutaron según el MASTER_ACTION_PLAN.md original:

- ✅ JWT secret en variables de entorno (no hardcodeado)
- ✅ Flyway migrations activas (V1–V4)
- ✅ Refresh token rotation con reuse detection
- ✅ BCrypt password hashing
- ✅ CORS configurado (no wildcard)
- ✅ Rate limiting en ChatService
- ✅ Structured logging (MDC)
- ✅ @Scheduled purge de tokens expirados (3am daily)
- ✅ i18n (EN/DE/ES)
- ✅ CSV export
- ✅ PWA config

### Pendiente (no crítico para demo)

- ⚠️ EmailService sin SMTP real → reset password solo funciona si el admin copia el link del log
- ⚠️ Parámetro `store` del scraper Python no expuesto en Spring → filtro de tienda es client-side

---

## 4. Gaps de UX detectados

| Gap | Ubicación | Severidad |
|-----|-----------|-----------|
| Sección Settings en ProfilePage sin implementar | `ProfilePage.tsx:80-89` | Media — afecta configuración de precio electricidad |
| Notification bell con datos hardcoded | `NotificationController.java` | Baja — funciona visualmente |
| Market sin categorías ni filtros | `MarketPage.tsx` | Alta — página completamente stub |
| Wishlist sin ninguna UI | `WishlistPage.tsx` | Alta — backend listo, UI ausente |
| Energy Calc sin página standalone | `EnergyCalcPage.tsx` | Media — cálculo existe en AquariumDetail (parcial) |
| Dosing Calc sin nada | `DosingCalcPage.tsx` | Media — feature estrella para ReefMaster |

---

## 5. Triaje MVP Final

### FUNCIONAL — Conectado a BD (implementar completamente)

| # | Feature | Esfuerzo | Justificación |
|---|---------|----------|---------------|
| 1 | Wishlist Page | ~3–4h | Backend 100% listo. Victoria rápida. |
| 2 | Energy Calculator | ~2–3h | Endpoint listo. Solo UI. |
| 3 | Profile Settings form | ~1–2h | Backend listo. Mejora la demo. |

### MOCKEADO — Visualmente funcional (datos fake/scraper)

| # | Feature | Enfoque | Esfuerzo |
|---|---------|---------|----------|
| 4 | Market Page | Scraper live + fallback JSON estático | ~4h |
| 5 | Dosing Calculator | Fórmulas puras en JavaScript | ~2–3h |
| 6 | Notifications polish | Mock mejorado + alertas client-side | ~1–2h |

### DESCARTADO — Post-v1.0

- Marketplace con transacciones (buy/sell, pagos, listings de usuarios)
- Sistema de alertas real con triggers en base de datos
- Mantenimiento y scheduling de tareas
- Email service real (SMTP/SendGrid/SES)
- Full preferences system más allá de electricidad + i18n
- Species Catalog como página pública navegable
- Exposición del parámetro `store` del scraper en Spring Boot

---

## 6. Archivos críticos por feature

| Feature | Archivos FE | Archivos BE |
|---------|-------------|-------------|
| Wishlist | `WishlistPage.tsx`, `wishlistApi.ts` | Sin cambios |
| Energy Calc | `EnergyCalcPage.tsx` | Sin cambios |
| Profile Settings | `ProfilePage.tsx` | Sin cambios |
| Market | `MarketPage.tsx`, `market-fallback.json`, `marketApi.ts` | Sin cambios |
| Dosing Calc | `DosingCalcPage.tsx` | Sin cambios (no existe) |
| Notifications | `NotificationBell.tsx`, `useParameterAlerts.ts` | Sin cambios |

---

## 7. Demo Flow recomendado para la presentación

```
1. Login como usuario ReefMaster
2. Dashboard → crear acuario de demostración (o usar existente)
3. Aquarium Detail → ver parámetros en gráfica + añadir medición
4. Energy Calculator → seleccionar acuario → ver desglose kWh
5. Dosing Calculator → introducir parámetros → ver dosis calculadas
6. Market → buscar "led" → navegar por categorías → añadir a wishlist
7. Wishlist → ver items añadidos, cambiar prioridad
8. Profile → cambiar precio electricidad → verificar que se actualiza en Energy Calc
9. Notification Bell → ver alertas (si parámetros fuera de rango → alertas dinámicas)
10. AI Chat → pregunta sobre el acuario seleccionado
```

---

## 8. Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Scraper Python caído durante demo | Media | Alto | Fallback JSON garantiza UI nunca vacía |
| Gemini API caída durante demo | Baja | Medio | Error handling ya implementado |
| Password reset no funciona (email stub) | Alta | Bajo | No hacer demo de forgot password |
| Parámetros sin datos → Energy Calc vacío | Media | Medio | Usar acuario de demo pre-cargado con equipos |

---

*Documento generado: 2026-05-03 · Rama: feat/fase14-mvp*
