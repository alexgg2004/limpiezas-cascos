# 1. Etapa de compilación
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Descarga dependencias en caché
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compila el JAR omitiendo tests
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Etapa de ejecución (imagen ligera)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Crear directorio para almacenar los PDFs subidos
RUN mkdir -p uploads/facturas

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]