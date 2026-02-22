// 1. Array de productos temporales
const productos = [
    { id: 1, nombre: "Camisa Fuego Urbano", precio: 25.00, imagen: "assets/img/3.jpeg" },
    { id: 2, nombre: "Camisa León Fe", precio: 25.00, imagen: "assets/img/4.jpeg" },
    { id: 3, nombre: "Camisa Zarza", precio: 20.00, imagen: "assets/img/5.jpeg" },
    { id: 4, nombre: "Hoodie Cruz", precio: 35.00, imagen: "assets/img/6.jpeg" },
    { id: 5, nombre: "Camisa Gracia", precio: 22.00, imagen: "assets/img/7.jpeg" },
    { id: 6, nombre: "Camisa Espíritu", precio: 22.00, imagen: "assets/img/8.jpeg" }
];

const contenedorProductos = document.getElementById('contenedor-productos');
let carrito = JSON.parse(localStorage.getItem('carritoZahara')) || [];

// Referencias del DOM para el carrito
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
    // toggle() es mágico: si la clase 'activo' no está, la pone. Si está, la quita.
    menuNavegacion.classList.toggle('activo');
});

// Opcional: Cerrar el menú si hacen clic en un enlace (como "Colección")
const enlacesMenu = document.querySelectorAll('.nav-links a');
enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', () => {
        menuNavegacion.classList.remove('activo');
    });
});

renderizarProductos();
actualizarCarrito();

// --- FUNCIÓN PARA MOSTRAR NOTIFICACIONES MODERNAS ---
function mostrarNotificacion(mensaje, tipo = 'error') {
    const contenedor = document.getElementById('toast-container');
    
    // Creamos el div de la notificación
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (tipo === 'exito') toast.classList.add('exito');
    
    // Le metemos el texto
    toast.innerText = mensaje;
    
    // Lo agregamos a la pantalla
    contenedor.appendChild(toast);
    
    // Magia: Lo eliminamos automáticamente después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'salirToast 0.4s ease-in forwards'; // Animación de salida
        // Esperamos a que termine la animación para borrarlo del HTML
        setTimeout(() => {
            toast.remove();
        }, 400); 
    }, 3000);
}

// Función que guarda el estado actual del carrito en el navegador
function guardarCarritoEnLocalStorage() {
    // Convertimos el arreglo a texto (JSON.stringify) y lo guardamos con el nombre 'carritoZahara'
    localStorage.setItem('carritoZahara', JSON.stringify(carrito));
}

// Funciones para Abrir y Cerrar el panel
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

// 2. Renderizar Productos (AHORA CON SELECTOR DE TALLA)
function renderizarProductos() {
    contenedorProductos.innerHTML = '';

    productos.forEach(producto => {
        const divProducto = document.createElement('div');
        divProducto.classList.add('producto');

        divProducto.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
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

// 3. Agregar al carrito capturando la talla
function agregarAlCarrito(id) {
    const productoElegido = productos.find(producto => producto.id === id);
    
    // Capturamos la talla
    const selectTalla = document.getElementById(`talla-${id}`);
    const tallaElegida = selectTalla.value;
    
    // Creamos el ID único
    const idUnico = `${id}-${tallaElegida}`;
    
    // Verificamos si ESA camisa en ESA talla ya está en el carrito
    const existe = carrito.some(item => item.idUnico === idUnico);
    
    if (existe) {
        mostrarNotificacion(`Ya tienes esta camisa en talla ${tallaElegida} en el carrito.`, 'error');
    } else {
        // Clonamos el objeto producto y le inyectamos la talla y el idUnico
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
    contenedorItemsCarrito.innerHTML = '';
    
    if (carrito.length === 0) {
        contenedorItemsCarrito.innerHTML = '<p class="carrito-vacio">El carrito está vacío.</p>';
        totalCarritoDOM.innerText = '$0.00';
        document.querySelector('.btn-carrito').innerText = `🛒 Carrito (0)`;
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
    document.querySelector('.btn-carrito').innerText = `🛒 Carrito (${carrito.length})`;
}

// 5. Eliminar del carrito
function eliminarDelCarrito(idUnico) {
    // Filtramos usando el idUnico
    carrito = carrito.filter(item => item.idUnico !== idUnico);
    guardarCarritoEnLocalStorage();
    actualizarCarrito();
}

// Ejecutamos al inicio
renderizarProductos();

// ==========================================
// --- LÓGICA DE WHATSAPP (CHECKOUT) ---
// ==========================================

// 1. Seleccionamos el botón de pagar del carrito
const btnPagar = document.querySelector('.btn-pagar');

const numeroTelefono = "584143894452"; 


btnPagar.addEventListener('click', () => {
    // Validación: No dejar pagar si el carrito está vacío
    if (carrito.length === 0) {
        mostrarNotificacion("Tu carrito está vacío. Agrega algunas camisas primero.", 'error');
        return;
    }

    // 2. Construimos el mensaje inicial
    // Usamos '%0A' para hacer saltos de línea en la URL de WhatsApp
    let mensaje = "¡Hola Zahara Church Store! 🔥 Quiero realizar el siguiente pedido:%0A%0A";

    // 3. Recorremos el carrito y añadimos cada producto al mensaje
    carrito.forEach((item, index) => {
        // Ej: "- Camisa Fuego Urbano (Talla: M) | $25.00"
        mensaje += `${index + 1}. ${item.nombre} (Talla: ${item.talla}) | $${item.precio.toFixed(2)}%0A`;
    });

    // 4. Obtenemos el total directamente del DOM que ya calculamos
    const totalFinal = totalCarritoDOM.innerText;
    mensaje += `%0A*TOTAL A PAGAR: ${totalFinal}*`;
    mensaje += "%0A%0A¿Quedo atento a los métodos de pago!";

    // 5. Codificamos el mensaje para que funcione en una URL (convierte espacios y símbolos raros)
    const mensajeCodificado = encodeURIComponent(mensaje);

    // 6. Creamos el enlace oficial de la API de WhatsApp y lo abrimos en una nueva pestaña
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
    
    // Abrir en nueva pestaña
    window.open(urlWhatsApp, '_blank');

    // Opcional: Cerrar el carrito después de enviar
    cerrarCarrito();
});