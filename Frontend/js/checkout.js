let carrito = JSON.parse(localStorage.getItem('carritoZahara')) || [];

// 🚨 REGLA DE SEGURIDAD
if (carrito.length === 0) {
    window.location.href = 'index.html';
}

const contenedorResumen = document.getElementById('resumen-carrito');
const totalDOM = document.getElementById('checkout-total');
const btnFinalizar = document.getElementById('btn-finalizar-compra');

let totalDivisas = 0; 
let tasaActual = 0; 

// --- 1. CONECTAR A LA API DEL EURO BCV ---
async function cargarTasaBCV() {
    try {
        const respuesta = await fetch('https://ve.dolarapi.com/v1/euros/oficial');
        const datos = await respuesta.json();
        tasaActual = datos.promedio;
        
        actualizarMontoBolivares();
    } catch (error) {
        console.error("Error al cargar la API del Euro BCV:", error);
        const totalBsDOM = document.getElementById('checkout-total-bs');
        if (totalBsDOM) totalBsDOM.innerText = "Tasa BCV no disponible";
    }
}

// --- 2. CALCULAR TOTAL BS ---
function actualizarMontoBolivares() {
    if (tasaActual > 0 && totalDivisas > 0) {
        const totalBolivares = totalDivisas * tasaActual;
        
        // Actualizamos el panel lateral
        const totalBsDOM = document.getElementById('checkout-total-bs');
        if (totalBsDOM) totalBsDOM.innerText = `Bs. ${totalBolivares.toFixed(2)}`;
    }
}

// --- 3. CARGAR CARRITO ---
function cargarResumenCompra() {
    if (!contenedorResumen) return;
    contenedorResumen.innerHTML = '';
    totalDivisas = 0;

    carrito.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('item-resumen');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.marginBottom = '15px';
        
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #444;">
            <div style="flex: 1; margin-left: 15px;">
                <p style="margin: 0; font-weight: bold; color: #fff;">${item.nombre}</p>
            </div>
            <div style="font-weight: bold; color: #28a745;">€${item.precio.toFixed(2)}</div>
        `;
        contenedorResumen.appendChild(div);
        totalDivisas += item.precio;
    });

    if (totalDOM) totalDOM.innerText = `€${totalDivisas.toFixed(2)}`;
    actualizarMontoBolivares(); 
}

// --- 4. 🌟 PROCESAR PAGO DIRECTO A WHATSAPP ---
const procesarPagoSeguro = () => {
    // Capturamos todos los datos de facturación
    const inputNombre = document.getElementById('cliente-nombre');
    const inputCedula = document.getElementById('cliente-cedula');
    const inputTelefono = document.getElementById('cliente-telefono');
    const inputDireccion = document.getElementById('cliente-direccion');
    
    const nombreCliente = inputNombre ? inputNombre.value.trim() : "";
    const cedulaCliente = inputCedula ? inputCedula.value.trim() : "";
    const telefonoCliente = inputTelefono ? inputTelefono.value.trim() : "";
    const direccionCliente = inputDireccion ? inputDireccion.value.trim() : "";

    // Validación simple
    if (!nombreCliente || !cedulaCliente || !telefonoCliente) {
        alert("Por favor, completa tus datos de facturación para continuar.");
        return;
    }

    btnFinalizar.innerText = "Preparando tu orden... ⏳";
    btnFinalizar.disabled = true;

    // Número de WhatsApp de Zahara Store
    const numeroWhatsApp = "584143894452";

    // Armamos el mensaje para WhatsApp
    let mensaje = `¡Hola Zahara Store! 🔥%0A`;
    mensaje += `Acabo de realizar un pedido en la tienda web. Aquí están mis datos:%0A%0A`;
    
    mensaje += `*📄 DATOS DE FACTURACIÓN:*%0A`;
    mensaje += `- Nombre: ${nombreCliente}%0A`;
    mensaje += `- Cédula/RIF: ${cedulaCliente}%0A`;
    mensaje += `- Teléfono: ${telefonoCliente}%0A`;
    if (direccionCliente) mensaje += `- Dirección: ${direccionCliente}%0A`;
    
    mensaje += `%0A*📦 DETALLES DE LA ORDEN:*%0A`;
    carrito.forEach(item => {
        mensaje += `- 1x ${item.nombre} (€${item.precio.toFixed(2)})%0A`;
    });

    mensaje += `%0A*💰 TOTAL A PAGAR: €${totalDivisas.toFixed(2)}*%0A`;
    
    // Agregamos el equivalente en Bs si la API cargó
    if (tasaActual > 0) {
        const totalBs = (totalDivisas * tasaActual).toFixed(2);
        mensaje += `*(Equivalente: Bs. ${totalBs})*%0A`;
    }
    
    mensaje += `%0A¡Quedo atento/a para coordinar el pago!`;

    // Limpiamos el carrito local
    localStorage.setItem('carritoZahara', JSON.stringify([]));

    // Redirigimos al cliente directo al WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    window.location.href = urlWhatsApp;
};

// --- 5. VINCULAR EVENTOS ---
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
        procesarPagoSeguro();
    });
}

// ARRANQUE
cargarTasaBCV();
cargarResumenCompra();