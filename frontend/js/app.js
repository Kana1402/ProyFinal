// ─── CONSTANTES & ESTADO ──────────────────────────────────────
const BASE = 'http://localhost:8080';
const STORAGE_KEY = 'asoc_cahuita_session';
const IMG_SERVICIO = 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?q=80&w=600';
const IMG_NOTICIA = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600';

let token = null;
let currentUser = null;
let confirmCallback = null;
let servicioActualId = null, servicioActualTitulo = null;

let reservasCargadas = [];
let reservasFiltradas = [];

// ─── HTTP ──────────────────────────────────────────────────────
async function api(method, path, body, auth) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token) headers['Authorization'] = 'Bearer ' + token;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    try {
        const res = await fetch(BASE + path, opts);
        if (res.status === 204) return { ok: true, data: null };
        const text = await res.text();
        try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
        catch { return { ok: res.ok, status: res.status, data: text }; }
    } catch (e) {
        showAlert('error', 'No se pudo conectar con el servidor.');
        return { ok: false, data: null };
    }
}

// ─── SESIÓN PERSISTENTE ────────────────────────────────────────
function guardarSesion() {
    if (currentUser && token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, currentUser }));
    }
}

function restaurarSesion() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const { token: t, currentUser: u } = JSON.parse(saved);
        const payload = JSON.parse(atob(t.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            cerrarSesionLocal();
            return;
        }
        token = t;
        currentUser = u;
        updateNav();
        showAlert('success', 'Sesión restaurada — ' + u.username);
    } catch (e) {
        cerrarSesionLocal();
    }
}

function cerrarSesionLocal() {
    localStorage.removeItem(STORAGE_KEY);
    token = null;
    currentUser = null;
}

// ─── NAV ──────────────────────────────────────────────────────
function goTo(page) {
    // Cerrar todos los modales abiertos antes de navegar
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
    });
    document.body.style.overflow = 'auto';

    // Resetear tabs del dashboard al salir
    const tabReservas = document.getElementById('tab-reservas');
    const tabUsuarios = document.getElementById('tab-usuarios');
    if (tabReservas) tabReservas.style.display = 'block';
    if (tabUsuarios) tabUsuarios.style.display = 'none';
    document.querySelectorAll('.tabs .tab').forEach((t, i) => {
        t.classList.toggle('active', i === 0);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    const labels = {
        inicio: 'inicio', servicios: 'servicios', noticias: 'noticias',
        directiva: 'directiva', reservas: 'mis reservas', dashboard: 'dashboard'
    };
    document.querySelectorAll('.nav-btn').forEach(b => {
        if (b.textContent.trim().toLowerCase() === labels[page]) b.classList.add('active');
    });

    const isAdmin = currentUser?.role === 'ADMINISTRADOR';

    if (page === 'inicio') loadNoticiasHome();
    if (page === 'servicios') {
        setVisible('btn-nuevo-servicio', isAdmin);
        loadServicios();
        document.getElementById('detalle-servicio').style.display = 'none';
    }
    if (page === 'noticias') {
        setVisible('btn-nueva-noticia', isAdmin);
        loadNoticias();
    }
    if (page === 'directiva') {
        setVisible('btn-nuevo-miembro', isAdmin);
        loadDirectiva();
    }
    if (page === 'reservas') loadMisReservas();
    if (page === 'dashboard') loadDashboard();
}

function updateNav() {
    const isAdmin = currentUser?.role === 'ADMINISTRADOR';

    setVisible('auth-buttons', !currentUser);
    document.getElementById('user-info').style.display = currentUser ? 'flex' : 'none';

    setVisible('btn-reservas', currentUser?.role === 'USUARIO');
    setVisible('btn-dashboard', isAdmin);

    if (currentUser) {
        document.getElementById('user-info').innerHTML = `
            <span style="font-size:0.88rem;color:#555;font-weight:600">${esc(currentUser.username)}</span>
            <span class="role-badge ${isAdmin ? 'admin' : ''}">${currentUser.role}</span>
            <button class="btn btn-sm" onclick="doLogout()">Salir</button>
        `;
        document.getElementById('token-debug').textContent = 'JWT · ' + currentUser.role;
        document.getElementById('token-debug').style.display = 'none';
    } else {
        document.getElementById('token-debug').style.display = 'none';
    }

    const activePage = document.querySelector('.page.active')?.id?.replace('page-', '');
    if (activePage) {
        setVisible('btn-nuevo-servicio', isAdmin && activePage === 'servicios');
        setVisible('btn-nueva-noticia', isAdmin && activePage === 'noticias');
        setVisible('btn-nuevo-miembro', isAdmin && activePage === 'directiva');
        if (['servicios', 'noticias', 'directiva', 'dashboard'].includes(activePage)) {
            goTo(activePage);
        }
    }
}

function setVisible(id, visible) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? (el.tagName === 'DIV' ? 'flex' : 'inline-block') : 'none';
}

// ─── MODALES ────────────────────────────────────────────────
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = 'auto';
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['tab-reservas', 'tab-usuarios'].forEach(t => document.getElementById(t).style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    if (tabId === 'tab-usuarios') loadAdminUsuarios();
}

// ─── ALERTAS ──────────────────────────────────────────────────
function showAlert(type, msg) {
    const div = document.createElement('div');
    div.className = 'alert alert-' + type;
    div.textContent = msg;
    document.getElementById('alert-area').appendChild(div);
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.3s';
        setTimeout(() => div.remove(), 300);
    }, 3500);
}

// ─── AUTH ─────────────────────────────────────────────────────
async function doLogin() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    if (!username || !password) { showAlert('error', 'Completa usuario y contraseña.'); return; }

    const res = await api('POST', '/api/auth/login', { username, password });
    if (!res.ok) { showAlert('error', 'Credenciales inválidas.'); return; }

    token = res.data.token;
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUser = {
        username,
        role: payload.role || 'USUARIO',
        id: payload.userId
    };

    guardarSesion();
    closeModal('login-modal');
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';

    updateNav();
    showAlert('success', `Bienvenido, ${username} (${currentUser.role})`);
}

async function doRegistro() {
    const username = document.getElementById('reg-user').value.trim();
    const correo = document.getElementById('reg-email').value.trim();
    const telefono = document.getElementById('reg-tel').value.trim();
    const password = document.getElementById('reg-pass').value;

    if (!username || !correo || !password) { showAlert('error', 'Completa los campos requeridos.'); return; }

    const res = await api('POST', '/api/auth/registro', { username, correo, telefono, password });
    if (res.ok) {
        closeModal('registro-modal');
        showAlert('success', 'Cuenta creada. Ya puedes ingresar.');
        ['reg-user', 'reg-email', 'reg-tel', 'reg-pass'].forEach(id => document.getElementById(id).value = '');
    } else {
        showAlert('error', typeof res.data === 'string' ? res.data : 'Error al registrarse.');
    }
}

function doLogout() {
    cerrarSesionLocal();
    updateNav();
    goTo('inicio');
    showAlert('success', 'Sesión cerrada.');
}

// ─── INICIO ───────────────────────────────────────────────────
async function loadNoticiasHome() {
    const el = document.getElementById('noticias-home');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando...</div>';

    const res = await api('GET', '/api/noticias');
    if (!res.ok) {
        el.innerHTML = '<div class="empty">No se pudieron cargar las noticias.</div>';
        return;
    }

    const noticiasOrdenadas = res.data.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
    const noticiasRecientes = noticiasOrdenadas.slice(0, 3);

    el.innerHTML = noticiasRecientes.length ? noticiasRecientes.map(n => {
        const img = n.imagenUrl?.startsWith('http') ? n.imagenUrl : IMG_NOTICIA;
        const fecha = formatFecha(n.fechaPublicacion).split(',')[0];
        const autor = n.autor?.username || 'Asociación';

        return `
        <article class="news-card"
            style="cursor:pointer; margin-bottom: 1rem;"
            data-titulo="${esc(n.titulo)}"
            data-contenido="${esc(n.contenido)}"
            data-autor="${esc(autor)}"
            data-fecha="${fecha}"
            data-img="${esc(img)}"
            onclick="prepararLectura(this)">
            <div class="news-img-container" style="height: 150px;">
                <img src="${esc(img)}" class="news-img" alt="${esc(n.titulo)}" onerror="this.src='${IMG_NOTICIA}'">
            </div>
            <div class="news-body">
                <div class="news-meta">📅 ${fecha}</div>
                <h3 class="news-title" style="font-size: 1.1rem;">${esc(n.titulo)}</h3>
                <p class="news-excerpt" style="-webkit-line-clamp: 2;">${esc(n.contenido)}</p>
                <div class="news-footer">
                    <div class="news-author">👤 ${esc(autor)}</div>
                </div>
            </div>
        </article>`;
    }).join('') : '<div class="empty">Sin noticias publicadas aún.</div>';
}

// ─── SERVICIOS ────────────────────────────────────────────────
async function loadServicios() {
    const el = document.getElementById('servicios-grid');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando experiencias...</div>';
    const res = await api('GET', '/api/servicios');
    if (!res.ok) { el.innerHTML = '<div class="empty">Error al cargar servicios.</div>'; return; }

    const isAdmin = currentUser?.role === 'ADMINISTRADOR';
    el.innerHTML = res.data.length ? res.data.map((s) => {
        const img = s.imagenUrl?.startsWith('http') ? s.imagenUrl : IMG_SERVICIO;
        return `
        <div class="serv-card" onclick="verServicio(${s.id},'${esc(s.titulo)}','${esc(s.descripcion || '')}',${s.precio})">
            ${isAdmin ? `
            <div class="serv-admin-btns">
                <button class="btn btn-sm" style="background:white;color:#333" onclick="event.stopPropagation();editarServicio(${s.id},'${esc(s.titulo)}','${esc(s.descripcion || '')}',${s.precio},'${esc(s.imagenUrl || '')}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();confirmarEliminar('¿Eliminar el servicio «${esc(s.titulo)}»?',()=>eliminarServicio(${s.id}))">Eliminar</button>
            </div>` : ''}
            <img src="${esc(img)}" class="serv-card-img" alt="${esc(s.titulo)}" onerror="this.src='${IMG_SERVICIO}'">
            <div class="serv-card-overlay">
                <div class="serv-text-content">
                    <h3 class="serv-name">${esc(s.titulo)}</h3>
                    ${s.descripcion ? `<p style="font-size:0.85rem;opacity:0.85;margin-bottom:8px">${esc(s.descripcion.substring(0, 80))}...</p>` : ''}
                    <div class="serv-price">&#8353;${Number(s.precio).toLocaleString('es-CR')}</div>
                </div>
            </div>
        </div>`;
    }).join('') : '<div class="empty">Sin servicios disponibles.</div>';
}

async function verServicio(id, titulo, desc, precio) {
    const det = document.getElementById('detalle-servicio');

    if (det.classList.contains('abierto') && servicioActualId === id) {
        det.classList.remove('abierto');
        servicioActualId = null;
        return;
    }

    det.classList.remove('abierto');

    setTimeout(async () => {
        servicioActualId = id;
        servicioActualTitulo = titulo;

        document.getElementById('detalle-titulo').textContent = `${titulo} — ₡${Number(precio).toLocaleString('es-CR')}`;
        document.getElementById('detalle-desc').textContent = desc;

        setVisible('btn-nueva-actividad', currentUser?.role === 'ADMINISTRADOR');

        await refreshFechas(id, titulo);

        det.style.display = 'block';
        det.classList.add('abierto');

        setTimeout(() => {
            det.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }, 100);
}

async function refreshFechas(id, titulo) {
    const fl = document.getElementById('fechas-list');
    fl.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando fechas...</div>';

    const res = await api('GET', '/api/actividades/servicio/' + id);
    if (!res.ok) {
        fl.innerHTML = '<div class="empty">Error al cargar fechas.</div>';
        return;
    }

    const isAdmin = currentUser?.role === 'ADMINISTRADOR';
    const ahora = new Date();

    fl.innerHTML = res.data.length ? res.data.map(a => {
        const fechaActividad = new Date(a.fechaHora);
        const esPasada = fechaActividad < ahora;

        let botonAccion = '';

        if (esPasada) {
            botonAccion = `<span class="badge badge-gray" style="padding: 6px 12px;">ACT. CADUCADA</span>`;
        } else if (a.estado === 'PROGRAMADA' && a.cupoDisponible > 0) {
            botonAccion = `<button class="btn btn-primary btn-sm" onclick="abrirReserva('${esc(titulo)}','${formatFecha(a.fechaHora)}',${a.id})">Reservar</button>`;
        } else if (a.cupoDisponible <= 0) {
            botonAccion = `<span class="badge badge-red">COMPLETO</span>`;
        } else {
            botonAccion = `<span class="badge badge-amber">${a.estado}</span>`;
        }

        return `
        <div class="card" style="${esPasada ? 'opacity: 0.7; background: #f9f9f9;' : ''}">
            <div class="card-row" style="align-items:center">
                <div>
                    <div class="card-title" style="font-size:0.95rem; ${esPasada ? 'text-decoration: line-through;' : ''}">
                        ${formatFecha(a.fechaHora)}
                    </div>
                    <div class="card-sub">
                        ${a.cupoDisponible} / ${a.cupoMaximo} cupos &nbsp;
                        <span class="badge ${estadoBadge(a.estado)}">${a.estado}</span>
                    </div>
                </div>
                <div class="card-actions">
                    ${botonAccion}
                    ${isAdmin ? `
                    <div style="margin-left: 8px; border-left: 1px solid #ddd; padding-left: 8px; display: flex; gap: 4px;">
                        <button class="btn btn-sm" onclick="editarActividad(${a.id},'${a.fechaHora}',${a.cupoMaximo},'${a.estado}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('¿Eliminar esta fecha?',()=>eliminarActividad(${a.id}))">Eliminar</button>
                    </div>` : ''}
                </div>
            </div>
        </div>`;
    }).join('') : '<div class="empty">Sin fechas programadas para este servicio.</div>';
}

// ─── CRUD SERVICIOS ───────────────────────────────────────────
function abrirModalServicio() {
    document.getElementById('servicio-modal-title').textContent = 'Nuevo servicio';
    document.getElementById('serv-id').value = '';
    ['serv-titulo', 'serv-desc', 'serv-precio', 'serv-imagen'].forEach(id => document.getElementById(id).value = '');
    openModal('servicio-modal');
}

function editarServicio(id, titulo, desc, precio, imagen) {
    document.getElementById('servicio-modal-title').textContent = 'Editar servicio';
    document.getElementById('serv-id').value = id;
    document.getElementById('serv-titulo').value = titulo;
    document.getElementById('serv-desc').value = desc;
    document.getElementById('serv-precio').value = precio;
    document.getElementById('serv-imagen').value = imagen;
    openModal('servicio-modal');
}

async function guardarServicio() {
    const id = document.getElementById('serv-id').value;
    const body = {
        titulo: document.getElementById('serv-titulo').value,
        descripcion: document.getElementById('serv-desc').value,
        precio: parseFloat(document.getElementById('serv-precio').value),
        imagenUrl: document.getElementById('serv-imagen').value
    };
    if (!body.titulo || !body.precio) { showAlert('error', 'Título y precio son requeridos.'); return; }
    const res = id ? await api('PUT', '/api/servicios/' + id, body, true) : await api('POST', '/api/servicios', body, true);
    if (res.ok) { closeModal('servicio-modal'); showAlert('success', id ? 'Servicio actualizado.' : 'Servicio creado.'); loadServicios(); }
    else { showAlert('error', 'Error al guardar el servicio.'); }
}

async function eliminarServicio(id) {
    const res = await api('DELETE', '/api/servicios/' + id, null, true);
    if (res.ok) { showAlert('success', 'Servicio eliminado.'); loadServicios(); document.getElementById('detalle-servicio').style.display = 'none'; }
    else { showAlert('error', 'Error al eliminar. Verifica que no tenga actividades activas.'); }
}

// ─── CRUD ACTIVIDADES ─────────────────────────────────────────
function abrirModalActividad() {
    document.getElementById('actividad-modal-title').textContent = 'Nueva fecha';
    document.getElementById('act-id').value = '';
    document.getElementById('act-servicio-id').value = servicioActualId;
    document.getElementById('act-fecha').value = '';
    document.getElementById('act-cupo').value = '';
    document.getElementById('act-estado-group').style.display = 'none';
    openModal('actividad-modal');
}

function editarActividad(id, fechaHora, cupoMaximo, estado) {
    document.getElementById('actividad-modal-title').textContent = 'Editar fecha';
    document.getElementById('act-id').value = id;
    document.getElementById('act-fecha').value = fechaHora ? fechaHora.substring(0, 16) : '';
    document.getElementById('act-cupo').value = cupoMaximo;
    document.getElementById('act-estado').value = estado;
    document.getElementById('act-estado-group').style.display = 'block';
    openModal('actividad-modal');
}

async function guardarActividad() {
    const id = document.getElementById('act-id').value;
    const servicioId = document.getElementById('act-servicio-id').value || servicioActualId;
    const fechaHora = document.getElementById('act-fecha').value;
    const cupoMaximo = parseInt(document.getElementById('act-cupo').value);

    if (!fechaHora || !cupoMaximo) {
        showAlert('error', 'Fecha y cupo son requeridos.');
        return;
    }

    if (id) {
        // Traer datos actuales para calcular cupoDisponible correctamente
        const actual = await api('GET', '/api/actividades/' + id);
        if (!actual.ok) {
            showAlert('error', 'Error obteniendo datos actuales.');
            return;
        }

        const act = actual.data;
        const reservados = act.cupoMaximo - act.cupoDisponible;

        if (cupoMaximo < reservados) {
            showAlert('error', 'No puedes poner menos cupos que los ya reservados.');
            return;
        }

        const nuevoDisponible = cupoMaximo - reservados;

        const body = {
            fechaHora,
            cupoMaximo,
            cupoDisponible: nuevoDisponible,
            estado: document.getElementById('act-estado').value
        };

        const res = await api('PUT', '/api/actividades/' + id, body, true);
        if (res.ok) {
            closeModal('actividad-modal');
            showAlert('success', 'Fecha actualizada.');
            refreshFechas(servicioActualId, servicioActualTitulo);
        } else {
            showAlert('error', 'Error al guardar la fecha.');
        }

    } else {
        const res = await api('POST', '/api/actividades', {
            servicio: { id: parseInt(servicioId) },
            fechaHora,
            cupoMaximo
        }, true);

        if (res.ok) {
            closeModal('actividad-modal');
            showAlert('success', 'Fecha creada.');
            refreshFechas(servicioActualId, servicioActualTitulo);
        } else {
            showAlert('error', 'Error al crear la fecha.');
        }
    }
}

async function eliminarActividad(id) {
    const res = await api('DELETE', '/api/actividades/' + id, null, true);
    if (res.ok) { showAlert('success', 'Fecha eliminada.'); refreshFechas(servicioActualId, servicioActualTitulo); }
    else { showAlert('error', 'Error al eliminar la fecha.'); }
}

// ─── RESERVAS ─────────────────────────────────────────────────
function abrirReserva(servicio, fecha, actividadId) {
    if (!currentUser) { showAlert('error', 'Debes iniciar sesión o registrarte para reservar.'); openModal('login-modal'); return; }
    if (currentUser.role === 'ADMINISTRADOR') { showAlert('error', 'Los administradores no realizan reservas.'); return; }
    document.getElementById('res-servicio').value = servicio;
    document.getElementById('res-fecha').value = fecha;
    document.getElementById('res-actividad-id').value = actividadId;
    openModal('reserva-modal');
}

async function doReserva() {
    const actividadId = document.getElementById('res-actividad-id').value;
    const cantidadPersonas = parseInt(document.getElementById('res-personas').value);
    const notas = document.getElementById('res-notas').value;

    const res = await api('POST', '/api/reservas', {
        usuario: { id: currentUser.id },
        actividad: { id: parseInt(actividadId) },
        cantidadPersonas,
        notas
    }, true);

    if (res.ok) {
        closeModal('reserva-modal');
        showAlert('success', 'Reserva creada exitosamente.');
        document.getElementById('res-notas').value = '';
    } else {
        showAlert('error', typeof res.data === 'string' ? res.data : 'Error al crear la reserva.');
    }
}

async function loadMisReservas() {
    if (!currentUser) return;
    const el = document.getElementById('mis-reservas-list');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando...</div>';
    const res = await api('GET', '/api/reservas/mis-reservas/' + (parseInt(currentUser.id) || 2), null, true);
    if (!res.ok) { el.innerHTML = '<div class="empty">No se pudieron cargar tus reservas.</div>'; return; }
    el.innerHTML = res.data.filter(r => r.estado !== 'CANCELADA').length ?
        res.data.filter(r => r.estado !== 'CANCELADA').map(r => `
        <div class="card"><div class="card-row">
            <div>
                <div class="card-title">${esc(r.actividad?.servicio?.titulo || 'Actividad #' + r.actividad?.id)}</div>
                <div class="card-sub">${formatFecha(r.actividad?.fechaHora)} · ${r.cantidadPersonas} persona(s)</div>
                ${r.notas ? `<div class="card-sub" style="margin-top:4px">📝 ${esc(r.notas)}</div>` : ''}
            </div>
            <span class="badge ${badgeClass(r.estado)}">${r.estado}</span>
        </div></div>`).join('') : '<div class="empty">No tienes reservas aún.</div>';
}

// ─── NOTICIAS ─────────────────────────────────────────────────
async function loadNoticias() {
    const el = document.getElementById('noticias-list');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando noticias...</div>';
    const res = await api('GET', '/api/noticias');
    if (!res.ok) { el.innerHTML = '<div class="empty">Error al cargar noticias.</div>'; return; }
    
    const noticiasOrdenadas = res.data.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
    
    const isAdmin = currentUser?.role === 'ADMINISTRADOR';
    el.innerHTML = noticiasOrdenadas.length ? noticiasOrdenadas.map(n => {
        const img = n.imagenUrl?.startsWith('http') ? n.imagenUrl : IMG_NOTICIA;
        const fecha = formatFecha(n.fechaPublicacion).split(',')[0];
        const autor = n.autor?.username || 'Asociación';
        return `
        <article class="news-card"
            data-titulo="${esc(n.titulo)}"
            data-contenido="${esc(n.contenido)}"
            data-autor="${esc(autor)}"
            data-fecha="${fecha}"
            data-img="${esc(img)}"
            onclick="prepararLectura(this)">
            <div class="news-img-container">
                <img src="${esc(img)}" class="news-img" alt="${esc(n.titulo)}" onerror="this.src='${IMG_NOTICIA}'">
            </div>
            <div class="news-body">
                <div class="news-meta">📅 ${fecha}</div>
                <h3 class="news-title">${esc(n.titulo)}</h3>
                <p class="news-excerpt">${esc(n.contenido)}</p>
                <div class="news-footer">
                    <div class="news-author">👤 ${esc(autor)}</div>
                    ${isAdmin ? `
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-sm" onclick="editarNoticia(${n.id},'${esc(n.titulo)}','${esc(n.contenido)}','${esc(n.imagenUrl || '')}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('¿Eliminar esta noticia?',()=>eliminarNoticia(${n.id}))">Eliminar</button>
                    </div>` : ''}
                </div>
            </div>
        </article>`;
    }).join('') : '<div class="empty">No hay noticias publicadas.</div>';
}

function prepararLectura(el) {
    leerNoticia(el.dataset.titulo, el.dataset.contenido, el.dataset.autor, el.dataset.fecha, el.dataset.img);
}

function leerNoticia(titulo, contenido, autor, fecha, img) {
    const cont = document.getElementById('noticia-lectura-contenido');
    cont.scrollTop = 0;
    const imgHtml = img?.startsWith('http') ? `<img src="${img}" style="width:100%;height:320px;object-fit:cover;border-radius:16px;margin-bottom:1.5rem">` : '';
    cont.innerHTML = `
        ${imgHtml}
        <div style="font-size:0.82rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem">📅 ${fecha} · ${autor}</div>
        <h2 style="font-size:1.8rem;font-weight:800;margin-bottom:1.5rem;letter-spacing:-0.5px;color:#1a202c">${titulo}</h2>
        <div style="font-size:1.05rem;line-height:1.85;color:#444;white-space:pre-wrap">${contenido}</div>
    `;
    openModal('noticia-lectura-modal');
}

function abrirModalNoticia() {
    document.getElementById('noticia-modal-title').textContent = 'Nueva noticia';
    document.getElementById('not-id').value = '';
    ['not-titulo', 'not-contenido', 'not-imagen'].forEach(id => document.getElementById(id).value = '');
    openModal('noticia-modal');
}

function editarNoticia(id, titulo, contenido, imagen) {
    document.getElementById('noticia-modal-title').textContent = 'Editar noticia';
    document.getElementById('not-id').value = id;
    document.getElementById('not-titulo').value = titulo;
    document.getElementById('not-contenido').value = contenido;
    document.getElementById('not-imagen').value = imagen;
    openModal('noticia-modal');
}

async function guardarNoticia() {
    const id = document.getElementById('not-id').value;
    const body = {
        titulo: document.getElementById('not-titulo').value,
        contenido: document.getElementById('not-contenido').value,
        imagenUrl: document.getElementById('not-imagen').value,
        autor: { id: currentUser.id }  // ✅ Usa el usuario logueado, no hardcodeado
    };
    if (!body.titulo || !body.contenido) { showAlert('error', 'Título y contenido son requeridos.'); return; }
    const res = id ? await api('PUT', '/api/noticias/' + id, body, true) : await api('POST', '/api/noticias', body, true);
    if (res.ok) { closeModal('noticia-modal'); showAlert('success', id ? 'Noticia actualizada.' : 'Noticia publicada.'); loadNoticias(); loadNoticiasHome(); }
    else { showAlert('error', 'Error al guardar la noticia.'); }
}

async function eliminarNoticia(id) {
    const res = await api('DELETE', '/api/noticias/' + id, null, true);
    if (res.ok) { showAlert('success', 'Noticia eliminada.'); loadNoticias(); }
    else { showAlert('error', 'Error al eliminar la noticia.'); }
}

// ─── DIRECTIVA ────────────────────────────────────────────────
async function loadDirectiva() {
    const el = document.getElementById('directiva-list');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando directiva...</div>';
    const res = await api('GET', '/api/directiva');
    if (!res.ok) { el.innerHTML = '<div class="empty">Error al cargar la directiva.</div>'; return; }
    const isAdmin = currentUser?.role === 'ADMINISTRADOR';
    const miembros = res.data.sort((a, b) => (a.ordenPrioridad || 99) - (b.ordenPrioridad || 99));
    el.innerHTML = miembros.length ? miembros.map(m => `
        <div class="card">
            <div class="avatar-container">
                ${m.fotoUrl?.startsWith('http')
            ? `<img src="${esc(m.fotoUrl)}" alt="${esc(m.nombre)}" onerror="this.parentElement.innerHTML='<div class=\\'avatar\\'>${iniciales(m.nombre)}</div>'">`
            : `<div class="avatar">${iniciales(m.nombre)}</div>`}
            </div>
            <div class="member-info">
                <span class="puesto">${esc(m.puesto)}</span>
                <h3>${esc(m.nombre)}</h3>
                <p class="bio">${m.biografia ? esc(m.biografia) : 'Comprometido con el desarrollo sostenible de la pesca en Cahuita.'}</p>
            </div>
            ${isAdmin ? `
            <div class="member-actions">
                <button class="btn btn-sm" onclick="editarMiembro(${m.id},'${esc(m.nombre)}','${esc(m.puesto)}','${esc(m.biografia || '')}','${esc(m.fotoUrl || '')}',${m.ordenPrioridad || 1})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('¿Eliminar a ${esc(m.nombre)}?',()=>eliminarMiembro(${m.id}))">Eliminar</button>
            </div>` : ''}
        </div>`).join('') : '<div class="empty">Sin miembros registrados.</div>';
}

function abrirModalMiembro() {
    document.getElementById('miembro-modal-title').textContent = 'Nuevo miembro';
    document.getElementById('miem-id').value = '';
    ['miem-nombre', 'miem-puesto', 'miem-bio', 'miem-foto', 'miem-orden'].forEach(id => document.getElementById(id).value = '');
    openModal('miembro-modal');
}

function editarMiembro(id, nombre, puesto, bio, foto, orden) {
    document.getElementById('miembro-modal-title').textContent = 'Editar miembro';
    document.getElementById('miem-id').value = id;
    document.getElementById('miem-nombre').value = nombre;
    document.getElementById('miem-puesto').value = puesto;
    document.getElementById('miem-bio').value = bio;
    document.getElementById('miem-foto').value = foto;
    document.getElementById('miem-orden').value = orden;
    openModal('miembro-modal');
}

async function guardarMiembro() {
    const id = document.getElementById('miem-id').value;
    const body = {
        nombre: document.getElementById('miem-nombre').value,
        puesto: document.getElementById('miem-puesto').value,
        biografia: document.getElementById('miem-bio').value,
        fotoUrl: document.getElementById('miem-foto').value,
        ordenPrioridad: parseInt(document.getElementById('miem-orden').value) || 1
    };
    if (!body.nombre || !body.puesto) { showAlert('error', 'Nombre y puesto son requeridos.'); return; }
    const res = id ? await api('PUT', '/api/directiva/' + id, body, true) : await api('POST', '/api/directiva', body, true);
    if (res.ok) { closeModal('miembro-modal'); showAlert('success', id ? 'Miembro actualizado.' : 'Miembro agregado.'); loadDirectiva(); }
    else { showAlert('error', 'Error al guardar el miembro.'); }
}

async function eliminarMiembro(id) {
    const res = await api('DELETE', '/api/directiva/' + id, null, true);
    if (res.ok) { showAlert('success', 'Miembro eliminado.'); loadDirectiva(); }
    else { showAlert('error', 'Error al eliminar el miembro.'); }
}

// ─── DASHBOARD ────────────────────────────────────────────────
async function loadDashboard() {
    const [rRes, rUsu, rServ] = await Promise.all([
        api('GET', '/api/reservas', null, true),
        api('GET', '/api/usuarios', null, true),
        api('GET', '/api/servicios')
    ]);

    if (rRes.ok) {
        document.getElementById('m-reservas').textContent = rRes.data.length;
        document.getElementById('m-pendientes').textContent = rRes.data.filter(r => r.estado === 'PENDIENTE').length;
        reservasCargadas = rRes.data.filter(r => r.estado !== 'CANCELADA');
    }

    if (rServ.ok) {
        document.getElementById('m-servicios').textContent = rServ.data.length;
        const selectServicio = document.getElementById('filtro-servicio');
        if (selectServicio) {
            selectServicio.innerHTML = '<option value="TODOS">Todos los servicios</option>' +
                rServ.data.map(s => `<option value="${s.id}">${esc(s.titulo)}</option>`).join('');
        }
    }

    if (rUsu.ok) document.getElementById('m-usuarios').textContent = rUsu.data.length;

    filtrarTablaReservas();
}

async function cambiarEstadoReserva(id, estado) {
    const res = await api('PATCH', `/api/reservas/${id}/estado?estado=${estado}`, null, true);
    if (res.ok) {
        const mensaje = estado === 'CANCELADA' ? 'Reserva removida de la lista.' : 'Reserva confirmada.';
        showAlert('success', mensaje);
        await loadDashboard();
    } else {
        const errorMsg = typeof res.data === 'string' ? res.data : 'Error al actualizar la reserva.';
        showAlert('error', errorMsg);
    }
}

async function loadAdminUsuarios() {
    const el = document.getElementById('admin-usuarios');
    el.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando...</div>';
    const res = await api('GET', '/api/usuarios', null, true);
    if (!res.ok) { el.innerHTML = '<div class="empty">Error al cargar usuarios.</div>'; return; }
    el.innerHTML = res.data.length ? res.data.map(u => `
        <div class="card"><div class="card-row" style="align-items:center;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:200px">
                <div class="avatar" style="width:40px;height:40px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--primary);font-size:0.9rem;flex-shrink:0">${iniciales(u.username)}</div>
                <div>
                    <div class="card-title" style="font-size:0.9rem">${esc(u.username)}</div>
                    <div class="card-sub">${esc(u.correo || '—')} · Registrado: ${formatFecha(u.fechaRegistro)}</div>
                </div>
            </div>
            <div class="card-actions" style="flex-wrap:wrap">
                <select onchange="cambiarRolUsuario(${u.id}, this.value, '${esc(u.username)}')"
                    style="padding:5px 10px;font-size:0.8rem;border-radius:8px;border:1px solid #ddd;cursor:pointer;background:white;font-weight:600;width:auto">
                    <option value="VISITANTE"     ${u.role === 'VISITANTE' ? 'selected' : ''}>VISITANTE</option>
                    <option value="USUARIO"       ${u.role === 'USUARIO' ? 'selected' : ''}>USUARIO</option>
                    <option value="ADMINISTRADOR" ${u.role === 'ADMINISTRADOR' ? 'selected' : ''}>ADMINISTRADOR</option>
                </select>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('¿Eliminar al usuario ${esc(u.username)}?',()=>eliminarUsuario(${u.id}))">Eliminar</button>
            </div>
        </div></div>`).join('') : '<div class="empty">Sin usuarios registrados.</div>';
}

async function eliminarUsuario(id) {
    const res = await api('DELETE', '/api/usuarios/' + id, null, true);
    if (res.ok) { showAlert('success', 'Usuario eliminado.'); loadAdminUsuarios(); loadDashboard(); }
    else { 
        const errorMsg = typeof res.data === 'string' ? res.data : 'Error al eliminar el usuario (probablemente tenga reservas o noticias asociadas).';
        showAlert('error', errorMsg); 
    }
}

async function cambiarRolUsuario(id, nuevoRol, username) {
    const res = await api('PATCH', `/api/usuarios/${id}/rol?role=${nuevoRol}`, null, true);
    if (res.ok) { showAlert('success', `Rol de ${username} actualizado a ${nuevoRol}.`); }
    else { showAlert('error', 'Error al cambiar el rol.'); loadAdminUsuarios(); }
}

// ─── CONFIRMACIÓN ELIMINAR ────────────────────────────────────
function confirmarEliminar(msg, cb) {
    document.getElementById('confirm-msg').textContent = msg;
    confirmCallback = cb;
    openModal('confirm-modal');
}

function ejecutarEliminar() {
    closeModal('confirm-modal');
    if (confirmCallback) { confirmCallback(); confirmCallback = null; }
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatFecha(f) {
    if (!f) return '—';
    try { return new Date(f).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return f; }
}

function iniciales(n) { return (n || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }

function badgeClass(e) { return { PENDIENTE: 'badge-amber', CONFIRMADA: 'badge-green', CANCELADA: 'badge-red' }[e] || 'badge-blue'; }

function estadoBadge(e) { return { PROGRAMADA: 'badge-green', CANCELADA: 'badge-red', COMPLETA: 'badge-gray' }[e] || 'badge-blue'; }

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

// ─── WHATSAPP ─────────────────────────────────────────────────
function configurarWhatsApp() {
    const telefono = "50686670745";
    const btn = document.getElementById('whatsapp-float');
    if (!btn) return;

    let mensaje = "Hola, Asoc. Pescadores Cahuita. Necesito ayuda.";
    if (currentUser) {
        mensaje = `Hola, soy ${currentUser.username}. Quisiera solicitar la cancelación de una reserva.`;
    }

    btn.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    btn.onclick = (e) => {
        if (btn.href.includes("javascript:void(0)")) e.preventDefault();
    };
}

// ─── INICIO ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    restaurarSesion();
    loadNoticiasHome();
    configurarWhatsApp();
});

// ─── EXCEL ────────────────────────────────────────────────────
function descargarExcelReservas() {
    if (!reservasFiltradas || reservasFiltradas.length === 0) {
        showAlert('error', 'No hay datos filtrados para exportar.');
        return;
    }

    const datosExcel = reservasFiltradas.map(r => ({
        "ID": r.id,
        "Estado": r.estado,
        "Servicio": r.actividad?.servicio?.titulo || '—',
        "Fecha Actividad": formatFecha(r.actividad?.fechaHora),
        "Cupos Reservados": r.cantidadPersonas,
        "Usuario": r.usuario?.username || '—',
        "Correo Usuario": r.usuario?.correo || '—',
        "Teléfono": r.usuario?.telefono || '—',
        "Notas Adicionales": r.notas || '—'
    }));

    try {
        const hoja = XLSX.utils.json_to_sheet(datosExcel);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Reservas");
        XLSX.writeFile(libro, "Reservas_Cahuita.xlsx");
        showAlert('success', 'Excel descargado con los datos mostrados. 📊');
    } catch (e) {
        console.error(e);
        showAlert('error', 'Ocurrió un error al construir el archivo Excel.');
    }
}

function filtrarTablaReservas() {
    const servicioId = document.getElementById('filtro-servicio')?.value || 'TODOS';
    const estado = document.getElementById('filtro-estado')?.value || 'TODAS';
    const el = document.getElementById('admin-reservas');
    if (!el) return;

    reservasFiltradas = reservasCargadas.filter(r => {
        const coincideEstado = estado === 'TODAS' || r.estado === estado;
        const resServId = r.actividad?.servicio?.id?.toString();
        const coincideServicio = servicioId === 'TODOS' || resServId === servicioId;
        return coincideEstado && coincideServicio;
    });

    el.innerHTML = reservasFiltradas.length ? reservasFiltradas.map(r => `
        <div class="card" id="reserva-card-${r.id}">
            <div class="card-row" style="align-items:center">
                <div>
                    <div class="card-title" style="font-size:0.9rem">
                        ${esc(r.usuario?.username || 'Usuario')} · 
                        ${esc(r.actividad?.servicio?.titulo || 'Servicio')} · 
                        ${r.cantidadPersonas} pers.
                    </div>
                    <div class="card-sub">${formatFecha(r.actividad?.fechaHora)}</div>
                    ${r.notas ? `<div class="card-sub">📝 ${esc(r.notas)}</div>` : ''}
                </div>
                <div class="card-actions">
                    <span class="badge ${badgeClass(r.estado)}">${r.estado}</span>
                    ${r.estado === 'PENDIENTE' ?
                        `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoReserva(${r.id},'CONFIRMADA')">Confirmar</button>`
                        : ''}
                    <button class="btn btn-sm btn-danger" onclick="confirmarEliminar('¿Seguro que desea cancelar esta reserva?', () => cambiarEstadoReserva(${r.id},'CANCELADA'))">Cancelar</button>
                </div>
            </div>
        </div>`).join('') : '<div class="empty">No hay reservas para este filtro.</div>';
}