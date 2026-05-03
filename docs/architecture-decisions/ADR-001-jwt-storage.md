# ADR-001 — JWT Storage Strategy: localStorage vs HttpOnly Cookie

**Estado:** Aceptado  
**Fecha:** 2026-04-29  
**Fase:** 3 — Refresh Tokens Rotativos  

---

## Contexto

Thalassa es una SPA React + Spring Boot. El access token JWT debe transmitirse
en cada petición autenticada al backend. Existen dos estrategias principales
de almacenamiento en el cliente:

| Criterio | `localStorage` (Zustand persist) | HttpOnly Cookie |
|---------|----------------------------------|-----------------|
| Resistencia a XSS | ❌ Accesible desde JS | ✅ Inaccesible desde JS |
| Resistencia a CSRF | ✅ No se envía automáticamente | ❌ Requiere token CSRF |
| Complejidad de implementación | Baja | Alta (CORS + SameSite + CSRF token) |
| Uso con SPA pura | Natural | Requiere proxy o backend for frontend |
| Alcance del proyecto | TFG / demo | Producción real |

## Decisión

**Mantener JWT en `localStorage` mediante Zustand persist** para el acceso
token. El refresh token también se almacena en `localStorage` (campo
`refreshToken` del store).

## Consecuencias

### Riesgos asumidos

- **XSS** puede robar el access token. Mitigación: access token tiene TTL
  de 15 minutos, lo que limita la ventana de abuso.
- Si el refresh token es robado, el atacante puede obtener nuevos access tokens
  hasta que expire (30 días) o hasta que se detecte reutilización.

### Mitigaciones aplicadas

1. **TTL corto en access token**: 15 minutos (en lugar de las 24 h anteriores).
2. **Refresh tokens rotativos con detección de reuse**: si se usa un token ya
   revocado, se invalida toda la familia del usuario.
3. **CSP estricta** (pendiente Fase 11): `script-src 'self'` bloquea scripts
   inyectados que podrían robar el token.
4. **No `dangerouslySetInnerHTML`** en ningún componente de la aplicación.
5. **Refresh token hasheado en BD**: solo el hash SHA-256 se persiste,
   nunca el token en claro.

### Deuda técnica documentada

Si el proyecto evoluciona a producción real con requisitos de seguridad más
altos, se debe migrar a httpOnly cookies con:

- `SameSite=Strict` para protección CSRF.
- Un endpoint `/api/auth/me` que devuelva el perfil del usuario autenticado
  (sin necesidad de leer el token en frontend).
- Revisión de la config de CORS para permitir `credentials: true`.

Esta migración requiere cambios en `SecurityConfig`, `AuthController`,
`axiosConfig.ts` y `authStore.ts`.
