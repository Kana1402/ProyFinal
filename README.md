# Asoc. Pescadores Cahuita — Plataforma Digital

Plataforma web integral para la **Asociación de Pescadores de Subsistencia y Acuicultura de Cahuita**, que facilita la promoción de sus servicios turísticos y pesqueros, la gestión de reservas y la comunicación con la comunidad y visitantes.

> *"Cahuita en tus manos: Tradición pesquera, aventura segura."*

---

## Descripción

Este proyecto es una aplicación web full-stack desarrollada como solución digital para la asociación. Permite a los visitantes explorar servicios turísticos, hacer reservas en línea y leer noticias de la zona, mientras que los administradores gestionan todo el contenido desde un dashboard privado.

---

## Tecnologías utilizadas

### Backend
- **Java 17** con **Spring Boot 3**
- **Spring Security** con autenticación **JWT**
- **Spring Data JPA** con **Hibernate**
- **MySQL** como base de datos
- **Lombok** para reducción de código boilerplate
- **Maven** como gestor de dependencias

### Frontend
- **HTML5 + CSS3 + JavaScript vanilla** (ES Modules)
- Arquitectura **SPA** (Single Page Application)
- **SheetJS (XLSX)** para exportación de reportes en Excel

---

## Arquitectura del proyecto

```
ProyFinal/
├── api/
│   └── src/main/java/asoc/api/
│       ├── controller/          # Controladores REST
│       ├── entity/              # Entidades JPA
│       ├── dto/                 # Data Transfer Objects
│       ├── repository/          # Repositorios Spring Data
│       ├── services/            # Lógica de negocio
│       └── security/            # JWT, filtros y configuración
└── frontend/
    ├── index.html               # SPA principal
    ├── style.css                # Estilos globales
    └── js/
        ├── main.js              # Punto de entrada (ES Modules)
        ├── state.js             # Estado global compartido
        ├── api.js               # Cliente HTTP centralizado
        ├── auth.js              # Autenticación y sesión
        ├── nav.js               # Navegación y modales
        ├── servicios.js         # Módulo de servicios
        ├── noticias.js          # Módulo de noticias
        ├── directiva.js         # Módulo de directiva
        ├── reservas.js          # Módulo de reservas
        ├── dashboard.js         # Dashboard administrativo
        └── helpers.js           # Utilidades compartidas
```

---

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| **Inicio** | Hero con imagen, últimas noticias destacadas |
| **Servicios** | Catálogo de tours y actividades con galería |
| **Agenda** | Fechas programadas por servicio con control de cupos |
| **Reservas** | Motor de reservas con validación de disponibilidad |
| **Noticias** | Publicación y lectura de avisos y eventos |
| **Directiva** | Presentación de los miembros de la junta |
| **Dashboard** | Panel admin con métricas, filtros y exportación Excel |
| **Seguridad** | Login/Registro con JWT y control de roles |

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **VISITANTE** | Ver servicios, noticias y directiva sin cuenta |
| **USUARIO** | Todo lo anterior + realizar y ver sus reservas |
| **ADMINISTRADOR** | Acceso total al Dashboard, CRUD de todos los módulos, gestión de usuarios y roles |

---

## Endpoints principales

### Autenticación
```
POST /api/auth/login
POST /api/auth/registro
```

### Servicios (público GET / admin CRUD)
```
GET    /api/servicios
POST   /api/servicios
PUT    /api/servicios/{id}
DELETE /api/servicios/{id}
```

### Actividades
```
GET    /api/actividades/servicio/{servicioId}
POST   /api/actividades
PUT    /api/actividades/{id}
DELETE /api/actividades/{id}
```

### Reservas
```
POST   /api/reservas
GET    /api/reservas
GET    /api/reservas/mis-reservas/{usuarioId}
PATCH  /api/reservas/{id}/estado?estado=
```

### Usuarios
```
GET    /api/usuarios
DELETE /api/usuarios/{id}
PATCH  /api/usuarios/{id}/rol?role=
```

---

## Instalación y configuración

### Requisitos previos
- Java 17+
- Maven 3.8+
- MySQL 8+
- Navegador moderno (Chrome, Firefox, Edge)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/asoc-cahuita.git
cd asoc-cahuita
```

### 2. Configurar la base de datos
Crear una base de datos MySQL:
```sql
CREATE DATABASE asoc_cahuita;
```

### 3. Configurar `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/asoc_cahuita
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update

jwt.secret=tu_clave_secreta_en_base64
jwt.expiration=3600000
```

### 4. Ejecutar el backend
```bash
cd api
mvn spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

### 5. Ejecutar el frontend
Abre `index.html` con **Live Server** en VS Code o cualquier servidor estático. No abrir como `file://` ya que ES Modules requieren un servidor HTTP.

### 6. Usuarios por defecto (DataLoader)
| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMINISTRADOR |
| `usuario1` | `user123` | USUARIO |

---

## Funcionalidades destacadas

- ✅ Autenticación JWT con persistencia de sesión en `localStorage`
- ✅ Control de cupos en tiempo real al hacer reservas
- ✅ Validación para evitar que un usuario reserve la misma actividad dos veces
- ✅ Las actividades pasadas se marcan automáticamente como caducadas
- ✅ Exportación de reservas a Excel con filtros aplicados
- ✅ Filtro de reservas por servicio y estado en el Dashboard
- ✅ Cambio de roles de usuarios desde el Dashboard
- ✅ Botón flotante de WhatsApp para contacto directo
- ✅ Diseño responsive para móvil y escritorio

---

## Licencia

Este proyecto fue desarrollado con fines académicos, Costa Rica.

---

## Autor

Desarrollado por **Keinth** — Proyecto Final   
Costa Rica, 2026
