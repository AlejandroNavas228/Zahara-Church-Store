// Definimos la URL de tu servidor
// const API_URL = 'http://localhost:3000'; 
const API_URL = 'https://zahara-api.onrender.com';

// ==========================================
// 1. LÓGICA DE LOGIN (SEGURIDAD)
// ==========================================
const formLogin = document.getElementById('form-login');
const mensajeError = document.getElementById('mensaje-error');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usuarioInput = document.getElementById('usuario').value;
        const passwordInput = document.getElementById('password').value;
        const btnEntrar = formLogin.querySelector('button');

        btnEntrar.innerText = "Verificando...";
        btnEntrar.disabled = true;
        mensajeError.style.display = 'none';

        try {
            const respuesta = await fetch(`${API_URL}/api/login`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: usuarioInput, password: passwordInput })
            });

            const resultado = await respuesta.json();

            if (resultado.exito) {
                localStorage.setItem('zaharaAdminLogueado', 'true');
                window.location.href = 'admin.html';
            } else {
                mensajeError.innerText = "Usuario o contraseña incorrectos";
                mensajeError.style.display = 'block';
                btnEntrar.innerText = "Entrar";
                btnEntrar.disabled = false;
            }
        } catch (error) {
            console.error("Error de login:", error);
            mensajeError.innerText = "Error al conectar con el servidor";
            mensajeError.style.display = 'block';
            btnEntrar.innerText = "Entrar";
            btnEntrar.disabled = false;
        }
    });
}

// ==========================================
// 2. LÓGICA DEL PANEL ADMIN (SUBIR Y VER)
// ==========================================
const formAdmin = document.getElementById('form-admin');

if (formAdmin) {
    
    // A) CARGAR LA TABLA AL INICIAR
    cargarProductosAdmin();

    // B) SUBIR PRODUCTO NUEVO (Ahora con Stock y Múltiples Fotos)
    formAdmin.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre-producto').value;
        const precio = document.getElementById('precio-producto').value;
        const stock = document.getElementById('stock-producto').value; // Atrapamos el stock
        const archivosImagenes = document.getElementById('imagen-producto').files; // Atrapamos TODAS las fotos
        const btnGuardar = document.querySelector('button[type="submit"]');

        if (archivosImagenes.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Falta la foto', text: 'Por favor selecciona al menos una imagen.'});
            return;
        }

        btnGuardar.innerText = "Subiendo fotos al servidor... 🚀"; 
        btnGuardar.disabled = true;

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('precio_usd', precio); 
        formData.append('stock', stock); 
        
        // Empaquetamos todas las fotos seleccionadas
        for (let i = 0; i < archivosImagenes.length; i++) {
            formData.append('imagenes', archivosImagenes[i]); 
        }

        try {
            const respuesta = await fetch(`${API_URL}/api/admin/productos`, {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Producto guardado correctamente en la base de datos.'});
                formAdmin.reset();
                cargarProductosAdmin(); 
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: resultado.error || "Hubo un problema al subir el producto."});
            }

        } catch (error) {
            console.error("Error al subir:", error);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.'});
        } finally {
            btnGuardar.innerText = "Guardar Producto";
            btnGuardar.disabled = false;
        }
    });
}

// ==========================================
// 3. FUNCIONES AUXILIARES (TABLA Y BORRAR)
// ==========================================

async function cargarProductosAdmin() {
    const cuerpoTabla = document.getElementById('tabla-productos');
    if (!cuerpoTabla) return; 

    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        const productos = await respuesta.json();
        
        cuerpoTabla.innerHTML = ''; 

        productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = "1px solid #333";

            // Lógica para mostrar la imagen: si es un array nuevo muestra la primera, si es el formato viejo, muestra la única
            const imagenAMostrar = (producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes[0] : (producto.imagen || 'assets/img/placeholder.png');

            fila.innerHTML = `
                <td style="padding: 10px;">
                    <img src="${imagenAMostrar}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 10px;">${producto.nombre}</td>
                <td style="padding: 10px;">$${producto.precio_usd ? producto.precio_usd.toFixed(2) : '0.00'}</td>
                <td style="padding: 10px; font-weight: bold; color: #28a745;">${producto.stock || 0}</td>
                <td style="padding: 10px;">
                    <button onclick="eliminarProducto(${producto.id})" style="background: #ff3333; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-weight: bold;">Borrar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar inventario:", error);
    }
}

async function eliminarProducto(id) {
    const confirmar = await Swal.fire({
        title: '¿Seguro?',
        text: "¡Esta camisa se borrará para siempre!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff3333',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmar.isConfirmed) {
        try {
            const respuesta = await fetch(`${API_URL}/api/admin/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (respuesta.ok) {
                Swal.fire('¡Borrado!', 'El producto ha sido eliminado.', 'success');
                cargarProductosAdmin(); 
            } else {
                Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Problema de conexión.', 'error');
        }
    }
}

// ==========================================
// 📦 SISTEMA DE GESTIÓN DE ÓRDENES
// ==========================================

// 1. Cargar las órdenes desde el servidor
async function cargarOrdenes() {
    try {
        const respuesta = await fetch(`${API_URL}/api/ordenes`);
        const ordenes = await respuesta.json();
        renderizarOrdenes(ordenes);
    } catch (error) {
        console.error("Error al cargar órdenes:", error);
    }
}

// 2. Dibujar las órdenes en el panel
function renderizarOrdenes(ordenes) {
    const contenedor = document.getElementById('contenedor-ordenes');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    const ordenesPendientes = ordenes.filter(o => o.estado === "Pendiente");

    if (ordenesPendientes.length === 0) {
        contenedor.innerHTML = '<p style="color: #fff; text-align: center;">No hay pedidos pendientes por confirmar. 🙌</p>';
        return;
    }

    ordenesPendientes.forEach(orden => {
        const div = document.createElement('div');
        div.style.cssText = "background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 20px; color: #fff;";
        
        let detallesRopa = "";
        const carrito = typeof orden.detalleCarrito === 'string' ? JSON.parse(orden.detalleCarrito) : orden.detalleCarrito;
        
        carrito.forEach(item => {
            detallesRopa += `<li>1x ${item.nombre}</li>`;
        });

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #28a745;">Orden #${orden.id}</h3>
                <span style="background: #ffc107; color: #000; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 0.8rem;">${orden.estado}</span>
            </div>
            
            <p><strong>👤 Cliente:</strong> ${orden.clienteNombre} (${orden.clienteTelefono})</p>
            <p><strong>🧾 Pago:</strong> $${orden.totalPagado.toFixed(2)} vía ${orden.metodoPago}</p>
            <p><strong>#️⃣ Referencia:</strong> ${orden.referencia}</p>
            
            <div style="background: #111; padding: 10px; border-radius: 5px; margin-top: 15px;">
                <p style="margin: 0 0 10px 0; color: #aaa; font-weight: bold;">Artículos a entregar:</p>
                <ul style="margin: 0; padding-left: 20px;">
                    ${detallesRopa}
                </ul>
            </div>

            <button onclick="aprobarOrden(${orden.id})" style="width: 100%; margin-top: 15px; padding: 12px; background: #28a745; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s;">
                ✅ APROBAR PAGO Y DESCONTAR INVENTARIO
            </button>
        `;
        contenedor.appendChild(div);
    });
}

// 3. Función para Aprobar la Orden (El botón verde)
async function aprobarOrden(idOrden) {
    const confirmar = await Swal.fire({
        title: '¿Confirmar Pago?',
        text: "Esto aprobará la orden y descontará los productos del inventario actual.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sí, aprobar',
        cancelButtonText: 'Cancelar'
    });
    
    if (confirmar.isConfirmed) {
        try {
            const respuesta = await fetch(`${API_URL}/api/ordenes/${idOrden}/aprobar`, {
                method: 'PUT'
            });

            if (respuesta.ok) {
                Swal.fire('¡Aprobada!', 'El stock se ha descontado automáticamente.', 'success');
                cargarOrdenes(); // Recargamos las órdenes
                cargarProductosAdmin(); // ¡Corregido! Ahora recarga la tabla del admin para ver el stock actualizado
            } else {
                const errorData = await respuesta.json();
                Swal.fire('Error', errorData.error, 'error');
            }
        } catch (error) {
            console.error("Error al aprobar:", error);
            Swal.fire('Error', 'Hubo un error de conexión.', 'error');
        }
    }
}

// Arrancar la carga de órdenes al abrir el panel
cargarOrdenes();