// const API_URL = 'http://localhost:3000'; 
const API_URL = 'https://zahara-api.onrender.com';
let carrito = JSON.parse(localStorage.getItem('carritoZahara')) || [];

// 🚨 REGLA DE SEGURIDAD
if (carrito.length === 0) {
    window.location.href = 'index.html';
}

const contenedorResumen = document.getElementById('resumen-carrito');
const totalDOM = document.getElementById('checkout-total');
const btnFinalizar = document.getElementById('btn-finalizar-compra');
const numeroTelefono = "584143894452"; // El número de Zahara

let totalDivisas = 0; 
let tasaActual = 0; 

// --- 1. CONECTAR A LA API DEL EURO BCV ---
async function cargarTasaBCV() {
    try {
        const respuesta = await fetch('https://ve.dolarapi.com/v1/euros/oficial');
        const datos = await respuesta.json();
        tasaActual = datos.promedio;
        
        document.getElementById('tasa-bcv-texto').innerText = `Bs. ${tasaActual.toFixed(2)}`;
        actualizarMontoBolivares();
    } catch (error) {
        console.error("Error al cargar la API del Euro BCV:", error);
        document.getElementById('tasa-bcv-texto').innerText = "Error al conectar.";
        const totalBsDOM = document.getElementById('checkout-total-bs');
        if (totalBsDOM) totalBsDOM.innerText = "Tasa no disponible";
    }
}

// --- 2. CALCULAR TOTAL BS Y AUTOCOMPLETAR ---
function actualizarMontoBolivares() {
    if (tasaActual > 0 && totalDivisas > 0) {
        const totalBolivares = totalDivisas * tasaActual;
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
        div.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #444;">
            <div style="flex: 1; margin-left: 15px;">
                <p style="margin: 0; font-weight: bold; color: #fff;">${item.nombre}</p>
            </div>
            <div style="font-weight: bold; color: #28a745;">$${item.precio.toFixed(2)}</div>
        `;
        contenedorResumen.appendChild(div);
        totalDivisas += item.precio;
    });

    if (totalDOM) totalDOM.innerText = `$${totalDivisas.toFixed(2)}`;
    actualizarMontoBolivares(); 
}

// --- 4. 🌟 NUEVO FLUJO: GENERAR ORDEN Y ENVIAR A WHATSAPP ---
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        const nombre = document.getElementById('cliente-nombre').value.trim();
        const telefono = document.getElementById('cliente-telefono').value.trim();
        
        if (!nombre || !telefono) {
            return Swal.fire({
                icon: 'error',
                title: 'Datos incompletos',
                text: 'Por favor ingresa tu nombre y teléfono para procesar el pedido.',
                confirmButtonColor: '#28a745',
                background: '#1a1a1a',
                color: '#fff'
            });
        }

        btnFinalizar.innerText = "PREPARANDO ORDEN... ⏳";
        btnFinalizar.disabled = true;

        try {
            // 1. Guardamos la orden en el Backend
            const respuesta = await fetch(`${API_URL}/api/ordenes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cliente: nombre,
                    telefono: telefono,
                    total: totalDivisas,
                    detalleCarrito: JSON.stringify(carrito) 
                })
            });

            let idDeLaOrden = "Pendiente";
            if (respuesta.ok) {
                const ordenCreada = await respuesta.json();
                idDeLaOrden = ordenCreada.id; 
            }

            // 2. Limpiamos el carrito local
            localStorage.setItem('carritoZahara', JSON.stringify([]));

            // 3. Armamos el mensaje para el WhatsApp de Zahara
            let mensaje = `¡Hola Zahara Store! 🔥%0A`;
            mensaje += `Soy *${nombre}*. Acabo de hacer un pedido en la página web y quiero coordinar el pago.%0A%0A`;
            mensaje += `*📦 DETALLES DE LA ORDEN #${idDeLaOrden}:*%0A`;

            carrito.forEach(item => {
                mensaje += `- 1x ${item.nombre} ($${item.precio.toFixed(2)})%0A`;
            });

            mensaje += `%0A*💰 TOTAL A PAGAR: $${totalDivisas.toFixed(2)}*%0A`;
            if(tasaActual > 0) {
                mensaje += `*(Equivalente: Bs. ${(totalDivisas * tasaActual).toFixed(2)})*%0A`;
            }
            mensaje += `%0APor favor, indíquenme los métodos de pago disponibles para transferirles. ¡Gracias!`;

            // 4. Redirigimos al cliente directo al WhatsApp
            const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
            window.location.href = urlWhatsApp;

        } catch (error) {
            console.error(error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Error de conexión', 
                text: 'No pudimos generar la orden. Intenta de nuevo.',
                background: '#1a1a1a',
                color: '#fff'
            });
            btnFinalizar.innerText = "FINALIZAR COMPRA";
            btnFinalizar.disabled = false;
        }
    });
}

// ARRANQUE
cargarTasaBCV();
cargarResumenCompra();