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

// --- 5. ENVIAR PAGO Y GENERAR FACTURA ---
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        const nombre = document.getElementById('cliente-nombre').value.trim();
        const telefono = document.getElementById('cliente-telefono').value.trim();
        
        const metodoRadio = document.querySelector('input[name="metodo_pago"]:checked');
        if (!metodoRadio) return alert("Selecciona un método de pago.");
        const metodoSeleccionado = metodoRadio.value;
        
        let bancoInfo = "";
        let referenciaInfo = "";
        let montoInfo = totalDivisas; 

        if (metodoSeleccionado === 'pagomovil') {
            bancoInfo = document.getElementById('banco-origen').value;
            referenciaInfo = document.getElementById('referencia-pagomovil').value.trim();
            montoInfo = parseFloat(document.getElementById('monto-pagomovil').value);
            
            if (!bancoInfo || !referenciaInfo || isNaN(montoInfo)) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Faltan datos',
                    text: 'Por favor completa tu Banco y N° de Referencia del Pago Móvil.',
                    confirmButtonColor: '#28a745',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        } else if (metodoSeleccionado === 'binance') {
            bancoInfo = "Binance USDT";
            referenciaInfo = document.getElementById('referencia-binance').value.trim();
            if (!referenciaInfo) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Faltan datos',
                    text: 'Ingresa tu usuario o referencia de Binance.',
                    confirmButtonColor: '#28a745',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        } else if (metodoSeleccionado === 'paypal') {
            bancoInfo = "PayPal USD";
            referenciaInfo = document.getElementById('referencia-paypal').value.trim();
            if (!referenciaInfo) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Faltan datos',
                    text: 'Ingresa tu correo o referencia de PayPal.',
                    confirmButtonColor: '#28a745',
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        }

        if (!nombre || !telefono) {
            return Swal.fire({
                icon: 'error',
                title: 'Datos de contacto incompletos',
                text: 'Por favor ingresa tu nombre y teléfono para poder contactarte sobre tu pedido.',
                confirmButtonColor: '#28a745',
                background: '#1a1a1a',
                color: '#fff'
            });
        }
        btnFinalizar.innerText = "PROCESANDO... ⏳";
        btnFinalizar.disabled = true;

        try {
           // Guardar en la base de datos con todo el detalle de la orden
            await fetch(`${API_URL}/api/ordenes`, { // OJO: Cambiamos /pagos por /ordenes
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    clienteNombre: nombre,
                    clienteTelefono: telefono,
                    metodoPago: bancoInfo, 
                    referencia: referenciaInfo, 
                    totalPagado: montoInfo,
                    detalleCarrito: carrito // ¡Aquí viajan las camisas compradas!
                })
            });
            // 🌟 MAGIA DE LA FACTURA 🌟
            // 1. Ocultar todo el checkout
            document.querySelector('.checkout-container').style.display = 'none';
            document.querySelector('.checkout-header').style.display = 'none';
            
            // 2. Construir la factura en HTML
            const numeroOrden = Math.floor(Math.random() * 100000);
            let htmlFactura = `
                <div style="max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid #333; text-align: left;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-check" style="color: #28a745; font-size: 3rem; margin-bottom: 10px;"></i>
                        <h2 style="color: #fff; margin: 0;">¡Orden Registrada!</h2>
                        <p style="color: #aaa; margin-top: 5px;">Orden #ZH-${numeroOrden}</p>
                    </div>
                    
                    <hr style="border-color: #333; margin: 20px 0;">
                    
                    <h3 style="color: #fff;">Hola, ${nombre}</h3>
                    <p style="color: #ddd;">Tu pedido ha sido guardado en nuestro sistema. Aquí tienes el resumen de tu compra:</p>
                    
                    <ul style="color: #fff; line-height: 1.8; padding-left: 20px;">
            `;
            
            carrito.forEach(item => {
                htmlFactura += `<li><strong>${item.nombre}</strong> - $${item.precio.toFixed(2)}</li>`;
            });

            htmlFactura += `
                    </ul>
                    <hr style="border-color: #333; margin: 20px 0;">
                    
                    <div style="background: #111; padding: 15px; border-radius: 5px; border: 1px solid #444;">
                        <p style="color: #fff; margin: 5px 0;"><strong>Total Pagado:</strong> <span style="color:#28a745;">$${totalDivisas.toFixed(2)}</span></p>
                        <p style="color: #fff; margin: 5px 0;"><strong>Método:</strong> ${bancoInfo}</p>
                        <p style="color: #fff; margin: 5px 0;"><strong>Referencia:</strong> ${referenciaInfo}</p>
                    </div>
                    
                    <div style="background: #1e3021; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin-top: 25px;">
                        <p style="color: #d4edda; margin: 0; font-size: 0.95rem;">
                            ⚠️ <strong>Paso Final:</strong> Para procesar tu envío de inmediato, por favor envíanos el comprobante (Capture) de tu pago por WhatsApp.
                        </p>
                    </div>

                    <button onclick="enviarComprobanteWA('${nombre}', '${bancoInfo}', '${referenciaInfo}')" style="width: 100%; padding: 15px; background-color: #25D366; color: white; font-weight: bold; border: none; border-radius: 5px; font-size: 16px; margin-top: 25px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s;">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.3rem;"></i> ENVIAR CAPTURE AL WHATSAPP
                    </button>
                </div>
            `;

            // 3. Mostrar la factura
            const pantallaFactura = document.getElementById('pantalla-factura');
            pantallaFactura.innerHTML = htmlFactura;
            pantallaFactura.style.display = 'block';
            
            // 4. Limpiar el carrito
            localStorage.setItem('carritoZahara', JSON.stringify([]));

        } catch (error) {
            console.error(error);
           Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión...' });
            btnFinalizar.innerText = "CONFIRMAR Y PAGAR AHORA";
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