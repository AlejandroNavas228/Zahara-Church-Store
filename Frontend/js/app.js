// const API_URL = 'http://localhost:3000'; 
const API_URL = 'https://zahara-api.onrender.com';

let productos = []; 

document.getElementById('contenedor-productos').innerHTML = '<div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 40px 0;"><h3 style="color: #ffffff; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">Cargando colección exclusiva... ⏳</h3></div>';

// Función actualizada para entender la nueva Base de Datos (con galerías y stock)
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        const datosRaw = await respuesta.json(); 

        // 🌟 MAPEO CORREGIDO CON LA BASE DE DATOS ACTUAL 🌟
        productos = datosRaw.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,   
            imagen: p.imagen,   
            stock: 10           
        }));
        
        const contenedor = document.getElementById('contenedor-productos');

        if (productos.length === 0) {
        if (contenedor) {
            // ¡EL TRUCO DEFINITIVO! Apagamos la cuadrícula/flexbox para que ocupe toda la pantalla libremente
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
// 2. DIBUJAR LOS PRODUCTOS EN PANTALLA
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (productos.length === 0) {
        // Apagamos flexbox/grid para que el banner se centre libremente
        contenedor.style.display = 'block'; 
        
        contenedor.innerHTML = `
            <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; box-sizing: border-box;">
                <img src="assets/img/Anuncio.webp" alt="Próximamente nueva colección" style="width: 100%; height: auto; border-radius: 12px; border: 1px solid #333333; margin-bottom: 25px; box-shadow: 0 10px 20px rgba(255,255,255,0.05);">
                <p style="color: #ffffff; font-size: 1.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Próximamente nueva mercancía 🔥</p>
                <p style="color: #888888; font-size: 1rem; margin-top: 10px;">¡Mantente atento a nuestras redes sociales!</p>
            </div>
        `;
        return; 
    }

    // Volvemos a encender el Grid por si hay productos
    contenedor.style.display = 'grid';

    // AQUÍ INICIA EL CICLO CORRECTAMENTE
    productos.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto');

        const imagenPortada = producto.imagen || 'assets/img/placeholder.png';

        div.innerHTML = `
            <div style="position: relative;">
                <a href="detalle.html?id=${producto.id}" target="_blank">
                    <img src="${imagenPortada}" alt="${producto.nombre}" title="Ver detalles">
                </a>
            </div>
            
            <div class="producto-info-fila">
                <div class="producto-textos">
                    <h3>${producto.nombre}</h3>
                    <p class="precio">$${producto.precio.toFixed(2)}</p>
                </div>
                
                <button class="btn-agregar-cuadrado" onclick="agregarAlCarrito(${producto.id})" title="Agregar al carrito">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

   productos.forEach(producto => {
        const div = document.createElement('div');
        
        // Tarjeta oscura con borde sutil. 
        div.style.cssText = "background: #0a0a0a; border: 1px solid #333333; border-radius: 12px; overflow: hidden; transition: all 0.3s ease;";

        const imagenPortada = producto.imagen || 'assets/img/placeholder.png';
        const precioReal = producto.precio || 0;

        div.innerHTML = `
            <a href="detalle.html?id=${producto.id}" target="_blank" style="text-decoration: none; color: inherit; display: block; position: relative;">
                <img src="${imagenPortada}" alt="${producto.nombre}" loading="lazy" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
                
                <div style="padding: 15px; text-align: center;">
                    <h3 style="margin: 0 0 8px 0; font-size: 1rem; color: #ffffff;">${producto.nombre}</h3>
                    <p class="precio" style="margin: 0; font-weight: bold; font-size: 1.2rem; color: #ffffff;">$${precioReal.toFixed(2)}</p>
                </div>
            </a>
            
            <div style="padding: 0 15px 15px 15px;">
                <button onclick="agregarAlCarrito(${producto.id})" style="width: 100%; padding: 10px; background: #ffffff; color: #000000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                    Agregar al carrito
                </button>
            </div>
        `;
        
        // Efecto hover: Al pasar el mouse, la tarjeta sube un poco y el borde se ilumina en blanco
        div.onmouseover = () => {
            div.style.transform = "translateY(-5px)";
            div.style.borderColor = "#ffffff";
            div.style.boxShadow = "0 5px 15px rgba(255,255,255,0.1)";
        };
        div.onmouseout = () => {
            div.style.transform = "translateY(0)";
            div.style.borderColor = "#333333";
            div.style.boxShadow = "none";
        };
        
        contenedor.appendChild(div);
    });


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