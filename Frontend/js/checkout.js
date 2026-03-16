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
const numeroTelefono = "584143894452"; 

let totalDivisas = 0; // Ahora lo llamamos divisas para que sirva para $ o €
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
        
        const inputMonto = document.getElementById('monto-pagomovil');
        if (inputMonto) inputMonto.value = totalBolivares.toFixed(2);
    }
}

// --- 3. LÓGICA DE PESTAÑAS (DINÁMICO) ---
const radiosPago = document.querySelectorAll('input[name="metodo_pago"]');
const formPagoMovil = document.getElementById('formulario-pagomovil');
const formBinance = document.getElementById('formulario-binance');
const formPayPal = document.getElementById('formulario-paypal'); // Cambiado a PayPal

if (radiosPago.length > 0) {
    radiosPago.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if(formPagoMovil) formPagoMovil.style.display = 'none';
            if(formBinance) formBinance.style.display = 'none';
            if(formPayPal) formPayPal.style.display = 'none';
            
            if (e.target.value === 'pagomovil' && formPagoMovil) formPagoMovil.style.display = 'block';
            if (e.target.value === 'binance' && formBinance) formBinance.style.display = 'block';
            if (e.target.value === 'paypal' && formPayPal) formPayPal.style.display = 'block';
        });
    });
}

// --- 4. CARGAR CARRITO ---
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

// --- 5. ENVIAR A LUMINA (NUEVO FLUJO AUTOMATIZADO) ---
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        // 1. Solo pedimos los datos de contacto básicos
        const nombre = document.getElementById('cliente-nombre').value.trim();
        const telefono = document.getElementById('cliente-telefono').value.trim();
        
        if (!nombre || !telefono) {
            return Swal.fire({
                icon: 'error',
                title: 'Datos incompletos',
                text: 'Por favor ingresa tu nombre y teléfono para procesar el envío.',
                confirmButtonColor: '#28a745',
                background: '#1a1a1a',
                color: '#fff'
            });
        }

        btnFinalizar.innerText = "CONECTANDO CON LA PASARELA... 🔒";
        btnFinalizar.disabled = true;

        try {
            // 2. Registramos la orden en el Backend de Zahara como "Pendiente"
            const respuesta = await fetch(`${API_URL}/api/ordenes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    clienteNombre: nombre,
                    clienteTelefono: telefono,
                    metodoPago: "Lumina Gateway", // Esto se actualizará luego
                    referencia: "Pendiente de pago", 
                    totalPagado: totalDivisas,
                    detalleCarrito: carrito 
                })
            });

            // Obtenemos la orden que tu backend acaba de guardar
            const ordenCreada = await respuesta.json();
            
            // Extraemos el ID real que Prisma le asignó a esta orden
            // (Asegúrate de que tu API devuelve el ID. Si lo devuelve como 'id', usamos ese)
            const idDeLaOrden = ordenCreada.id; 

            // 3. Limpiamos el carrito local porque la orden ya está registrada en tu base de datos
            localStorage.setItem('carritoZahara', JSON.stringify([]));

            // 4. ¡EL VIAJE A LUMINA!
            // Reemplaza esto con el ID real de Zahara que está en tu panel de Lumina
            const comercioId = "PEGA_AQUI_EL_ID_DE_COMERCIO_DE_ZAHARA"; 
            
            // Construimos la URL con el monto exacto y el ID de la orden
            const urlLumina = `https://pay-saas-frontend.vercel.app/checkout?comercioId=${comercioId}&monto=${totalDivisas}&referencia=${idDeLaOrden}`;

            // 5. Redirigimos al cliente a pagar de forma segura
            window.location.href = urlLumina;

        } catch (error) {
            console.error(error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Error de conexión', 
                text: 'No pudimos conectar con el servidor de pagos. Intenta de nuevo.',
                background: '#1a1a1a',
                color: '#fff'
            });
            btnFinalizar.innerText = "IR A PAGAR";
            btnFinalizar.disabled = false;
        }
    });
}

// --- 6. FUNCIÓN GLOBAL PARA ABRIR WHATSAPP DESDE LA FACTURA ---
window.enviarComprobanteWA = function(nombreCliente, metodo, ref) {
    let mensaje = `¡Hola Zahara Store! 🔥%0A`;
    mensaje += `Soy *${nombreCliente}*. Acabo de registrar mi orden en la página web y aquí les envío mi comprobante de pago.%0A%0A`;
    mensaje += `*🧾 DATOS REGISTRADOS:*%0A`;
    mensaje += `Método: ${metodo}%0A`;
    mensaje += `Referencia: ${ref}%0A%0A`;
    mensaje += `(Aquí adjunto mi capture 👇)`;
    
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
    window.location.href = urlWhatsApp;
};

// ARRANQUE DE LA PASARELA
cargarTasaBCV();
cargarResumenCompra();