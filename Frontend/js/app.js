// 1. Configuración de la URL del Servidor
// Mientras trabajas en tu PC, usamos localhost. 
const API_URL = "https://zahara-api.onrender.com/api"; // Cambia a tu URL de Render cuando esté desplegado

let productos = []; 

// Función para buscar los productos reales en el servidor NEON y Prisma
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);
        const datosRaw = await respuesta.json(); 

        // Mapeamos los datos de la base de datos para que el frontend los entienda
        productos = datosRaw.map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio_usd, // Conectamos el precio_usd de Neon al precio del frontend
            imagen: p.imagen,
            stock: p.stock
        }));
        
        const contenedor = document.getElementById('contenedor-productos');

        // Si no hay productos en la base de datos, mostramos el anuncio
        if (productos.length === 0) {
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="anuncio-vacio">
                        <img src="assets/img/Anuncio.webp" alt="Próximamente nueva mercancía">
                    </div>
                `;
            }
            return; 
        }

        renderizarProductos(); 
        
    } catch (error) {
        console.error("Error al cargar el catálogo desde Neon:", error);
        mostrarNotificacion("No se pudo conectar con el servidor de productos.", "error");
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

// 2. Renderizar Productos
function renderizarProductos() {
    if (!contenedorProductos) return;
    contenedorProductos.innerHTML = '';

    productos.forEach(producto => {
        const divProducto = document.createElement('div');
        divProducto.classList.add('producto');

        divProducto.innerHTML = `
            <img src="${producto.imagen || 'assets/img/placeholder.png'}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            
            <select id="talla-${producto.id}" class="selector-talla">
                <option value="S">Talla S</option>
                <option value="M">Talla M</option>
                <option value="L">Talla L</option>
                <option value="XL">Talla XL</option>
            </select>

            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        `;

        contenedorProductos.appendChild(divProducto);
    });
}

// 3. Agregar al carrito
function agregarAlCarrito(id) {
    const productoElegido = productos.find(producto => producto.id === id);
    const selectTalla = document.getElementById(`talla-${id}`);
    const tallaElegida = selectTalla.value;
    const idUnico = `${id}-${tallaElegida}`;
    
    const existe = carrito.some(item => item.idUnico === idUnico);
    
    if (existe) {
        mostrarNotificacion(`Ya tienes esta camisa en talla ${tallaElegida} en el carrito.`, 'error');
    } else {
        const productoConTalla = { ...productoElegido, idUnico: idUnico, talla: tallaElegida };
        carrito.push(productoConTalla);
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
                <h4>${item.nombre} (Talla: ${item.talla})</h4>
                <p class="item-precio">$${item.precio.toFixed(2)}</p>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.idUnico}')">X</button>
        `;
        contenedorItemsCarrito.appendChild(div);
        total += item.precio;
    });

    totalCarritoDOM.innerText = `$${total.toFixed(2)}`;
    document.querySelector('.btn-carrito').innerHTML = `<i class="fa-solid fa-bag-shopping"></i> (${carrito.length})`;
}

function eliminarDelCarrito(idUnico) {
    carrito = carrito.filter(item => item.idUnico !== idUnico);
    guardarCarritoEnLocalStorage();
    actualizarCarrito();
}

// 5. LÓGICA DE WHATSAPP
const btnPagar = document.querySelector('.btn-pagar');
const numeroTelefono = "584143894452"; 

if (btnPagar) {
    btnPagar.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarNotificacion("Tu carrito está vacío.", 'error');
            return;
        }

        let mensaje = "¡Hola Zahara Church Store! 🔥 Quiero realizar el siguiente pedido:%0A%0A";
        carrito.forEach((item, index) => {
            mensaje += `${index + 1}. ${item.nombre} (Talla: ${item.talla}) | $${item.precio.toFixed(2)}%0A`;
        });

        const totalFinal = totalCarritoDOM.innerText;
        mensaje += `%0A*TOTAL A PAGAR: ${totalFinal}*`;
        mensaje += "%0A%0A¿Quedo atento a los métodos de pago!";

        const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
        window.open(urlWhatsApp, '_blank');
        cerrarCarrito();
    });
}

// --- INICIO DE LA APLICACIÓN ---
cargarProductos();
actualizarCarrito();