// const API_URL = 'http://localhost:3000'; // Cámbialo a tu URL de Render cuando subas a producción
const API_URL = 'https://zahara-api.onrender.com';
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
        
        document.getElementById('tasa-bcv-texto').innerText = `Bs. ${tasaActual.toFixed(2)}`;
        actualizarMontoBolivares();
    } catch (error) {
        console.error("Error al cargar la API del Euro BCV:", error);
        document.getElementById('tasa-bcv-texto').innerText = "Error al conectar.";
        const totalBsDOM = document.getElementById('checkout-total-bs');
        if (totalBsDOM) totalBsDOM.innerText = "Tasa no disponible";
    }
}

// --- 2. CALCULAR TOTAL BS ---
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

// --- 4. PROCESAR PAGO SEGURO ---
const procesarPagoSeguro = async () => {
    const inputNombre = document.getElementById('cliente-nombre');
    const inputTelefono = document.getElementById('cliente-telefono');
    
    const nombreCliente = inputNombre ? inputNombre.value.trim() : "";
    const telefonoCliente = inputTelefono ? inputTelefono.value.trim() : "";

    if (!nombreCliente || !telefonoCliente) {
        alert("Por favor, ingresa tu nombre y teléfono antes de continuar.");
        return;
    }

    btnFinalizar.innerText = "Conectando de forma segura... ⏳";
    btnFinalizar.disabled = true;

    try {
        // 🛡️ MAGIA: Solo le hablamos a nuestro propio backend (Zahara)
        const respuesta = await fetch(`${API_URL}/api/ordenes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente: nombreCliente,
                telefono: telefonoCliente,
                total: parseFloat(totalDivisas.toFixed(2)),
                detalleCarrito: JSON.stringify(carrito)
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok && data.url_pago) {
            // El backend nos devolvió el link de Lumina, borramos el carrito
            localStorage.setItem('carritoZahara', JSON.stringify([]));
            // ¡Viaje directo al checkout de Lumina!
            window.location.href = data.url_pago; 
        } else {
            throw new Error(data.error || "No se recibió el link de pago");
        }

    } catch (error) {
        console.error("Error en el proceso:", error);
        alert("Hubo un error al generar tu pago. Intenta de nuevo.");
        btnFinalizar.innerText = "Pagar y Finalizar Compra";
        btnFinalizar.disabled = false;
    }
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