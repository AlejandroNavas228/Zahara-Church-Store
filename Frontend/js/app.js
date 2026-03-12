// 1. Configuración de la URL del Servidor
// Mientras trabajas en tu PC, usamos localhost. 
// const API_URL = 'http://localhost:3000'; 
const API_URL = 'https://zahara-api.onrender.com';

let productos = []; 

// Función actualizada para entender la nueva Base de Datos (con galerías y stock)
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        const datosRaw = await respuesta.json(); 

        // 🌟 AQUÍ ESTÁ EL TRUCO: Actualizamos el mapeo 🌟
        productos = datosRaw.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio_usd,      // Lo dejamos como 'precio' para que el carrito no se rompa
            precio_usd: p.precio_usd,  // Lo agregamos para que la galería pueda poner los decimales (.toFixed)
            imagenes: p.imagenes || [],// Ahora lee la LISTA de fotos, no una sola
            stock: p.stock || 0
        }));
        
        const contenedor = document.getElementById('contenedor-productos');

        if (productos.length === 0) {
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="anuncio-vacio" style="text-align: center; width: 100%;">
                        <p style="color: white; font-size: 1.2rem;">Próximamente nueva mercancía 🔥</p>
                    </div>
                `;
            }
            return; 
        }

        renderizarProductos(); 
        
    } catch (error) {
        console.error("Error al cargar el catálogo desde Neon:", error);
    }
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

btnMenu.addEventListener('click', () => {
    menuNavegacion.classList.toggle('activo');
});

// --- FUNCIÓN PARA MOSTRAR NOTIFICACIONES ---
function mostrarNotificacion(mensaje, tipo = 'error') {
    const contenedor = document.getElementById('toast-container');
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

btnAbrirCarrito.addEventListener('click', () => {
    panelCarrito.classList.add('abierto');
    overlayCarrito.style.display = 'block';
});

function cerrarCarrito() {
    panelCarrito.classList.remove('abierto');
    overlayCarrito.style.display = 'none';
}

btnCerrarCarrito.addEventListener('click', cerrarCarrito);
overlayCarrito.addEventListener('click', cerrarCarrito);

// 2. DIBUJAR LOS PRODUCTOS EN PANTALLA
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        contenedor.innerHTML = `<p style="color: white; text-align: center; width: 100%;">Próximamente nueva mercancía 🔥</p>`;
        return;
    }

    productos.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto');

        // Tomamos la primera imagen de la lista como portada
        const imagenPortada = (producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes[0] : 'assets/img/placeholder.png';

        div.innerHTML = `
            <div style="position: relative;">
                <img src="${imagenPortada}" alt="${producto.nombre}" onclick="abrirGaleria(${producto.id})" style="cursor: zoom-in;">
                
                <span style="position: absolute; top: 10px; right: 10px; background: ${producto.stock > 0 ? '#28a745' : '#ff3333'}; color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.8rem; font-weight: bold;">
                    ${producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                </span>
            </div>
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio_usd.toFixed(2)}</p>
            
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})" ${producto.stock === 0 ? 'disabled style="background:#555; cursor:not-allowed;"' : ''}>
                ${producto.stock > 0 ? 'Agregar al carrito' : 'Sin Stock'}
            </button> 
        `;
        contenedor.appendChild(div);
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
        totalCarritoDOM.innerText = '$0.00';
        document.querySelector('.btn-carrito').innerHTML = `<i class="fa-solid fa-bag-shopping"></i> (0)`;
        return;
    }

    let total = 0;
    carrito.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('item-carrito');
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.nombre} )</h4>
                <p class="item-precio">$${item.precio.toFixed(2)}</p>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">X</button>
        `;
        contenedorItemsCarrito.appendChild(div);
        total += item.precio;
    });

    totalCarritoDOM.innerText = `$${total.toFixed(2)}`;
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

// 5. LÓGICA DE WHATSAPP
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