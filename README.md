# 🐠 Asoc. Pescadores Cahuita — Plataforma Digital

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=flat-square&logo=docker)](https://www.docker.com/)

Plataforma web integral para la **Asociación de Pescadores de Subsistencia y Acuicultura de Cahuita**, diseñada para modernizar la gestión de servicios turísticos, reservas y comunicación comunitaria en el Caribe Sur de Costa Rica.

> *"Cahuita en tus manos: Tradición pesquera, aventura segura."*

---

## 🚀 Características Principales

- **Gestión de Servicios**: Catálogo dinámico de tours y actividades con imágenes y precios.
- **Motor de Reservas**: Sistema inteligente con control de cupos en tiempo real y validaciones de disponibilidad.
- **Seguridad Robusta**: Autenticación basada en **JWT (JSON Web Tokens)** con roles diferenciados.
- **Dashboard Administrativo**: Panel de control completo para CRUD de servicios, noticias, directiva y usuarios.
- **Reportes Avanzados**: Exportación de datos de reservas a formato **Excel (XLSX)** con filtros aplicados.
- **Noticias y Avisos**: Módulo de comunicación para eventos y avisos importantes de la asociación.
- **Diseño Premium**: Interfaz moderna, responsive y con efectos de *glassmorphism* para una experiencia de usuario fluida.

---

## 🛠️ Tecnologías Utilizadas

### Backend (API REST)
- **Java 17** con **Spring Boot 3**
- **Spring Security** + **JWT** para protección de rutas
- **Spring Data JPA** con **Hibernate**
- **MySQL 8.0** como motor de persistencia
- **Lombok** para código limpio y mantenible

### Frontend (SPA)
- **HTML5, CSS3 (Vanilla)** y **JavaScript (ES6+)**
- **Thymeleaf** como motor de plantillas (servidor de entrada)
- **SheetJS** para la generación de reportes Excel
- **Arquitectura SPA** para navegación sin recargas

### Despliegue y DevOps
- **Docker** & **Docker Compose** para orquestación de contenedores
- **Maven** para gestión de dependencias y construcción

---

## 📂 Estructura del Proyecto

```text
ProyFinal/
├── api/                     # Código fuente del Backend (Spring Boot)
│   ├── src/main/java/       # Lógica en Java (Controllers, Services, Entities)
│   └── src/main/resources/
│       ├── static/          # Archivos estáticos (CSS, JS, Imágenes)
│       └── templates/       # Plantillas Thymeleaf (index.html)
├── docker-compose.yml       # Orquestación de contenedores (App + DB)
├── Dockerfile               # Configuración de imagen Docker para la API
├── .env                     # Variables de entorno (Configuración sensible)
└── README.md                # Documentación del proyecto
```

---

## ⚙️ Instalación y Configuración

### Opción A: Despliegue Rápido con Docker (Recomendado) 🐳

1. **Requisitos**: Tener instalado [Docker](https://www.docker.com/) y Docker Compose.
2. **Configurar variables**: Crea o edita el archivo `.env` en la raíz con tus credenciales (puedes usar `.env.bak` como referencia).
3. **Levantar servicios**:
   ```bash
   docker-compose up --build -d
   ```
4. **Acceso**: La aplicación estará disponible en `http://localhost:8080`.

### Opción B: Ejecución Local (Desarrollo) 💻

1. **Base de Datos**: Crea una base de datos en MySQL llamada `BaseProy`.
2. **Configurar `application.properties`**: Asegúrate de que las variables de entorno coincidan con tu configuración local o define los valores directamente.
3. **Compilar y Ejecutar**:
   ```bash
   cd api
   mvn clean install
   mvn spring-boot:run
   ```

---

## 🔑 Roles y Acceso

| Rol | Capacidades |
|---|---|
| **VISITANTE** | Explorar servicios, leer noticias y ver la directiva. |
| **USUARIO** | Todo lo anterior + realizar reservas y gestionar su historial. |
| **ADMIN** | Control total: Dashboard, CRUD de todos los módulos, gestión de roles y reportes. |

### Credenciales por Defecto (DataLoader)
- **Admin**: `admin` / `admin123`
- **Usuario**: `usuario1` / `user123`

---

## 📜 Licencia

Desarrollado para el **Proyecto Final de Carrera**. Todos los derechos reservados a la Asociación de Pescadores de Cahuita y los autores.

---

## 👤 Autor

**Keinth** — Desarrollador Full Stack  
📍 Costa Rica, 2026
