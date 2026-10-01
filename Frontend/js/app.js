// Borramos las variables de API_URL porque ya no usamos servidor
let productos = []; // Mantenemos esta variable para que el resto del código (como el carrito) siga funcionando igual

document.getElementById('contenedor-productos').innerHTML = '<div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 40px 0;"><h3 style="color: #ffffff; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">Cargando colección exclusiva... ⏳</h3></div>';

// 1. NUEVA FUNCIÓN CARGAR PRODUCTOS (¡Súper rápida, sin internet!)
function cargarProductos() {
    // Tomamos los datos directamente de tu archivo productos.js
    productos = productosZahara;

    const contenedor = document.getElementById('contenedor-productos');

    // Si tu archivo productos.js está vacío o no lo lee bien, mostramos el cartel
    if (!productos || productos.length === 0) {
        if (contenedor) {
            contenedor.style.display = 'block'; 
            contenedor.innerHTML = `
                <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; box-sizing: border-box;">
                    <img src="assets/img/Anuncio.webp" alt="Próximamente nueva colección" style="width: 100%; height: auto; border-radius: 12px; border: 1px solid #333333; margin-bottom: 25px; box-shadow: 0 10px 20px rgba(255,255,255,0.05);">
                    <p style="color: #ffffff; font-size: 1.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Próximamente nueva mercancía 🔥</p>
                    <p style="color: #888888; font-size: 1rem; margin-top: 10px;">¡Mantente atento a nuestras redes sociales!</p>
                </div>
            `;
        }
        return; 
    }
    
    // Si sí hay productos, los dibujamos en pantalla
    renderizarProductos(); 
}

// Variables y referencias del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
let carrito = JSON.parse(localStorage.getItem('carritoZahara')) || [];

const btnAbrirCarrito = document.querySelector('.btn-carrito');
const panelCarrito = document.getElementById('carrito-panel');
const overlayCarrito = document.getElementById('carrito-overlay');
const btnCerrarCarrito = document.getElementById('btn-cerrar');
const contenedorItemsCarrito = document.getElementById('carrito-items');
const totalCarritoDOM = document.getElementById('carrito-total');

// --- LÓGICA DEL MENÚ HAMBURGUESA ---
const btnMenu = document.getElementById('menu-toggle');
const menuNavegacion = document.querySelector('.nav-links');

if(btnMenu) {
    btnMenu.addEventListener('click', () => {
        menuNavegacion.classList.toggle('activo');
    });
}

// --- FUNCIÓN PARA MOSTRAR NOTIFICACIONES ---
function mostrarNotificacion(mensaje, tipo = 'error') {
    const contenedor = document.getElementById('toast-container');
    if (!contenedor) return;
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (tipo === 'exito') toast.classList.add('exito');
    toast.innerText = mensaje;
    contenedor.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'salirToast 0.4s ease-in forwards';
        setTimeout(() => { toast.remove(); }, 400); 
    }, 3000);
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carritoZahara', JSON.stringify(carrito));
}

if(btnAbrirCarrito) {
    btnAbrirCarrito.addEventListener('click', () => {
        panelCarrito.classList.add('abierto');
        overlayCarrito.style.display = 'block';
    });
}

function cerrarCarrito() {
    panelCarrito.classList.remove('abierto');
    overlayCarrito.style.display = 'none';
}

if(btnCerrarCarrito) btnCerrarCarrito.addEventListener('click', cerrarCarrito);
if(overlayCarrito) overlayCarrito.addEventListener('click', cerrarCarrito);


// --- LÓGICA DEL SENSOR DE SCROLL ---
const observadorScroll = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        // Cuando la tarjeta entra en la pantalla
        if (entrada.isIntersecting) {
            // Le agregamos una clase para que tu CSS haga el efecto visual
            entrada.target.classList.add('visible'); 
            // Dejamos de observarlo para no gastar memoria
            observadorScroll.unobserve(entrada.target);
        }
    });
}, {
    threshold: 0.15 // Se activa cuando el 15% de la tarjeta ya es visible
});

// 2. DIBUJAR LOS PRODUCTOS EN PANTALLA (Limpiado: eliminamos el código duplicado)
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    contenedor.style.display = 'grid';

    // ¡Filtro eliminado! Ahora iteramos directamente sobre todos los productos
    productos.forEach((producto, index) => {
        const div = document.createElement('div');
        
        // 1. Agregamos la clase de animación de scroll que hicimos antes
        div.classList.add('fade-in-scroll');
        
        // 2. Estilos limpios usando tus nuevas variables CSS
        div.style.cssText = `
            background: var(--card-bg); 
            border: 1px solid var(--border-color); 
            border-radius: 8px; 
            overflow: hidden; 
            transition: all 0.3s ease; 
            display: flex; 
            flex-direction: column; 
            height: 100%;
        `;

        // Añadimos el delay dinámico para crear el efecto cascada (se declara después del cssText)
        div.style.transitionDelay = `${(index % 4) * 0.15}s`;

        const imagenPortada = producto.imagen || 'assets/img/placeholder.png';
        const precioReal = producto.precio || 0;
        
        // Ahora controlamos la POSICIÓN de la foto (arriba, centro, etc.)
        const posicion = producto.posicionImagen || 'center';

        div.innerHTML = `
            <a href="detalle.html?id=${producto.id}" class="tarjeta-link" style="text-decoration: none; color: inherit; display: block; position: relative; overflow: hidden;">
                ${producto.stock !== undefined && producto.stock > 0 && producto.stock < 5 ? `<span style="position:absolute; top:12px; left:12px; background: #ff4444; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; z-index: 2; letter-spacing: 1px;">¡ÚLTIMAS UNIDADES!</span>` : ''}
                <img src="${imagenPortada}" alt="${producto.nombre}" loading="lazy" style="width: 100\%; aspect-ratio: 1/1; object-fit: cover; object-position: ${posicion}; background: #f9f9f9;">

                <div class="tarjeta-ver-detalle" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); opacity:0; transition: opacity 0.25s ease; pointer-events:none;">
                    <span style="border: 1px solid #fff; color:#fff; padding: 8px 18px; font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; border-radius: 4px;">VER DETALLE</span>
                </div>

                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; color: var(--text-color); font-weight: 600;">${producto.nombre}</h3>
                    <p class="precio" style="margin: 0; font-weight: bold; font-size: 1.3rem; color: var(--accent-color);">€${precioReal.toFixed(2)}</p>
                </div>
            </a>

            <div style="padding: 0 20px 20px 20px; margin-top: auto;">
                <button onclick="agregarAlCarrito(${producto.id})" style="width: 100%; padding: 12px; background: var(--text-color); color: var(--card-bg); border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.3s ease; font-size: 0.95rem; font-family: 'Montserrat', sans-serif;">
                    <i class="fa-solid fa-cart-plus" style="margin-right: 8px;"></i> AGREGAR
                </button>
            </div>
        `;

        // 3. Efecto Hover estilo Boutique (sombra suave, overlay "ver detalle" y botón que cambia al color acento)
        div.onmouseover = () => {
            div.style.transitionDelay = "0s"; // Quitamos el delay del scroll para que reaccione rápido
            div.style.transform = "translateY(-8px)";
            div.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)";
            div.style.borderColor = "transparent";
            div.querySelector('button').style.background = "var(--accent-color)";
            div.querySelector('.tarjeta-ver-detalle').style.opacity = "1";
        };
        div.onmouseout = () => {
            div.style.transitionDelay = "0s";
            div.style.transform = "translateY(0)";
            div.style.boxShadow = "none";
            div.style.borderColor = "var(--border-color)";
            div.querySelector('button').style.background = "var(--text-color)";
            div.querySelector('.tarjeta-ver-detalle').style.opacity = "0";
        };
        
        contenedor.appendChild(div);
        
        // 4. Conectamos la tarjeta al sensor de scroll para que se anime
        observadorScroll.observe(div);
    });
}

// ==========================================
// 📸 LÓGICA DE LA GALERÍA DE FOTOS
// ==========================================
let fotosActuales = [];
let indiceFotoActual = 0;

function abrirGaleria(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    
    // Si el producto no tiene fotos, no hacemos nada
    if (!producto || !producto.imagenes || producto.imagenes.length === 0) return;

    fotosActuales = producto.imagenes;
    indiceFotoActual = 0;

    actualizarVistaGaleria();
    document.getElementById('modal-galeria').style.display = 'flex';
}

function cerrarGaleria() {
    document.getElementById('modal-galeria').style.display = 'none';
}

function cambiarFoto(direccion) {
    indiceFotoActual += direccion;

    // Si llegamos al final, volvemos al inicio y viceversa (Carrusel infinito)
    if (indiceFotoActual >= fotosActuales.length) indiceFotoActual = 0;
    if (indiceFotoActual < 0) indiceFotoActual = fotosActuales.length - 1;

    actualizarVistaGaleria();
}

function actualizarVistaGaleria() {
    // 1. Cambiamos la foto principal
    document.getElementById('imagen-principal-galeria').src = fotosActuales[indiceFotoActual];

    // 2. Dibujamos los puntitos indicadores
    const contenedorPuntos = document.getElementById('indicadores-galeria');
    contenedorPuntos.innerHTML = '';
    
    fotosActuales.forEach((_, indice) => {
        const punto = document.createElement('span');
        punto.classList.add('punto');
        if (indice === indiceFotoActual) punto.classList.add('activo');
        // También pueden hacer clic en el puntito para ir a esa foto
        punto.onclick = () => {
            indiceFotoActual = indice;
            actualizarVistaGaleria();
        };
        contenedorPuntos.appendChild(punto);
    });
}
// 3. AGREGAR AL CARRITO (Simplificado, sin tallas)
function agregarAlCarrito(id) {
    const productoElegido = productos.find(producto => producto.id === id);
    
    // Ahora el idUnico es simplemente el id del producto
    const existe = carrito.some(item => item.id === id);
    
    if (existe) {
        // Si ya existe, puedes sumarle 1 a la cantidad (opcional), 
        // pero por ahora solo le avisamos que ya lo tiene:
        mostrarNotificacion(`Ya tienes ${productoElegido.nombre} en el carrito.`, 'error');
    } else {
        carrito.push(productoElegido);
        guardarCarritoEnLocalStorage();
        actualizarCarrito();
        
        panelCarrito.classList.add('abierto');
        overlayCarrito.style.display = 'block';
    }
}
// 4. Actualizar la vista del Carrito
function actualizarCarrito() {
    if (!contenedorItemsCarrito) return;
    contenedorItemsCarrito.innerHTML = '';
    
    if (carrito.length === 0) {
        contenedorItemsCarrito.innerHTML = '<p class="carrito-vacio">El carrito está vacío.</p>';
        totalCarritoDOM.innerText = '€0.00';
        document.querySelector('.btn-carrito').innerHTML = `<i class="fa-solid fa-cart-shopping"></i> (0)`;
        return;
    }

    let total = 0;
    carrito.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('item-carrito');
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p class="item-precio">€${item.precio.toFixed(2)}</p>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">X</button>
        `;
        contenedorItemsCarrito.appendChild(div);
        total += item.precio;
    });

    totalCarritoDOM.innerText = `€${total.toFixed(2)}`;
    document.querySelector('.btn-carrito').innerHTML = `<i class="fa-solid fa-bag-shopping"></i> (${carrito.length})`;
}

// --- 5. ELIMINAR DEL CARRITO (Actualizado sin tallas) ---
function eliminarDelCarrito(id) {
    // Filtramos el carrito para guardar todos EXCEPTO el que tenga el ID que queremos borrar
    carrito = carrito.filter(item => item.id !== id);
    
    // Guardamos la nueva lista en la memoria del navegador y redibujamos el panel
    guardarCarritoEnLocalStorage();
    actualizarCarrito();
}

// 5. REDIRIGIR A LA PASARELA DE PAGO (Checkout)
const btnPagar = document.querySelector('.btn-pagar');

if (btnPagar) {
    btnPagar.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarNotificacion("Tu carrito está vacío.", 'error');
            return;
        }

        // En lugar de abrir WhatsApp, mandamos al cliente a la página de pagos
        window.location.href = 'checkout.html'; 
    });
}

// --- INICIO DE LA APLICACIÓN ---
cargarProductos();
actualizarCarrito();