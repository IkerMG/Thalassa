# =============================================================================
# Thalassa Backend — Dockerfile multi-stage
# Stage 1 (builder): compila el proyecto Maven y genera el fat JAR
# Stage 2 (runtime): imagen mínima JRE para producción
# =============================================================================

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM maven:3.9.7-eclipse-temurin-17 AS builder

WORKDIR /build

# Copiar solo el POM primero para cachear la descarga de dependencias.
# Este layer solo se invalida si pom.xml cambia.
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn package -DskipTests -q


# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Crear usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar el fat JAR generado por Spring Boot Maven Plugin
COPY --from=builder /build/target/backend-*.jar app.jar

# Asignar permisos y cambiar al usuario no-root
RUN chown appuser:appgroup app.jar
USER appuser

EXPOSE 8080

# La JVM en contenedor debe respetar los límites de memoria del cgroup.
# -XX:+UseContainerSupport está activo por defecto en Java 11+.
# -XX:MaxRAMPercentage evita fijar un heap estático.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
