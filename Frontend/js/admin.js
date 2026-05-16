// Asegúrate de que esta URL sea la correcta
// const API_URL = 'http://localhost:3000'; 
const API_URL = 'https://zahara-api.onrender.com';

// ==========================================
// 1. LÓGICA DE LOGIN (login.html)
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
        if (mensajeError) mensajeError.style.display = 'none';

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
                if (mensajeError) {
                    mensajeError.innerText = "Usuario o contraseña incorrectos";
                    mensajeError.style.display = 'block';
                } else {
                    alert("Usuario o contraseña incorrectos");
                }
                btnEntrar.innerText = "Entrar";
                btnEntrar.disabled = false;
            }
        } catch (error) {
            console.error("Error de login:", error);
            if (mensajeError) {
                mensajeError.innerText = "Error al conectar con el servidor";
                mensajeError.style.display = 'block';
            } else {
                alert("Error al conectar con el servidor");
            }
            btnEntrar.innerText = "Entrar";
            btnEntrar.disabled = false;
        }
    });
}

// ==========================================
// 2. LÓGICA PARA CREAR PRODUCTOS (admin.html)
// ==========================================
const formAdmin = document.getElementById('form-admin');

if (formAdmin) {
    formAdmin.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 1. PRIMERO capturamos la foto que seleccionó tu hermana
        const archivoImagen = document.getElementById('imagen-producto').files[0];

        // 2. LUEGO usamos el escudo: verificamos que sí haya foto y que no pase de 10MB
        if (!archivoImagen) {
            alert("Por favor, selecciona una foto para el producto.");
            return;
        }
        
        if (archivoImagen.size > 10485760) { // 10MB en bytes
            alert("¡Alto ahí! 🛑 La foto pesa demasiado (más de 10MB)");
            return; // Detiene todo aquí mismo
        }

        // 3. Si la foto pasó la prueba, ahora sí armamos la caja
        const formData = new FormData();

        formData.append('nombre', document.getElementById('nombre-producto').value);
        formData.append('precio', document.getElementById('precio-producto').value);
        formData.append('stock', document.getElementById('stock-producto').value);
        formData.append('descripcion', document.getElementById('descripcion-producto').value);
        formData.append('imagen', archivoImagen); // Guardamos la foto aprobada

        try {
            const respuesta = await fetch(`${API_URL}/api/productos`, {
                method: 'POST',
                body: formData 
            });
            
            if (respuesta.ok) {
                alert("¡Producto subido a la tienda con éxito! 🚀");
                formAdmin.reset(); 
                cargarProductosAdmin(); // Actualiza la tabla automáticamente
            } else {
                const errorData = await respuesta.json(); 
                alert("❌ Fallo al subir: " + errorData.error);
            }
        } catch(error) {
            console.error("Error al guardar:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

// ==========================================
// 3. TABLA DE PRODUCTOS Y BORRADO (admin.html)
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

            const imagenAMostrar = producto.imagen || 'assets/img/placeholder.png';

            fila.innerHTML = `
                <td style="padding: 10px;">
                    <img src="${imagenAMostrar}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 10px; color: #fff;">${producto.nombre}</td>
                <td style="padding: 10px; color: #fff;">$${producto.precio.toFixed(2)}</td>
                <td style="padding: 10px; font-weight: bold; color: #28a745;">${producto.stock || 0}</td>
                <td style="padding: 10px;">
                    <button onclick="eliminarProducto(${producto.id})" style="background: #ff3333; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Borrar</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar inventario:", error);
    }
}

// La función de eliminar producto debe ser global (fuera de otras funciones)
async function eliminarProducto(id) {
    const confirmar = await Swal.fire({
        title: '¿Seguro?',
        text: "¡Esta prenda se borrará para siempre!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff3333',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmar.isConfirmed) {
        try {
            // RUTA CORREGIDA: Apunta a /api/productos
            const respuesta = await fetch(`${API_URL}/api/productos/${id}`, {
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
// 4. SISTEMA DE GESTIÓN DE ÓRDENES (admin.html)
// ==========================================
async function cargarOrdenes() {
    const contenedor = document.getElementById('contenedor-ordenes');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_URL}/api/ordenes`);
        const ordenes = await respuesta.json();
        renderizarOrdenes(ordenes, contenedor);
    } catch (error) {
        console.error("Error al cargar órdenes:", error);
    }
}

function renderizarOrdenes(ordenes, contenedor) {
    contenedor.innerHTML = '';

    // Si tu backend no guarda "estado", asumimos que todas las que están en la BD están pendientes
    // Puedes ajustar este filtro si en un futuro agregas una columna "estado" a la BD
    const ordenesPendientes = ordenes;

    if (ordenesPendientes.length === 0) {
        contenedor.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No hay pedidos pendientes por confirmar. 🙌</p>';
        return;
    }

    ordenesPendientes.forEach(orden => {
        const div = document.createElement('div');
        div.style.cssText = "background: #111; border: 1px solid #333; border-radius: 8px; padding: 20px; color: #fff; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);";
        
        let detallesRopa = "";
        
        // Manejamos el JSON del carrito asegurándonos de que no rompa si viene nulo
        try {
            // Nota: En tu BD actual de SQLite 'cliente' y 'total' existen. 
            // Si quieres mostrar ropa, tu BD debe guardar 'detalleCarrito' en el futuro.
            const carrito = orden.detalleCarrito ? (typeof orden.detalleCarrito === 'string' ? JSON.parse(orden.detalleCarrito) : orden.detalleCarrito) : [];
            
            if (carrito.length > 0) {
                carrito.forEach(item => {
                    detallesRopa += `<li style="margin-bottom: 5px;">1x ${item.nombre} - $${item.precio}</li>`;
                });
            } else {
                detallesRopa = `<li style="color: #888;">No hay detalles de ropa guardados en esta orden.</li>`;
            }
        } catch (e) {
            detallesRopa = `<li style="color: #ff4444;">Error al leer los detalles de la orden.</li>`;
        }

        // HTML Corregido para inyectar correctamente los detalles
        div.innerHTML = `
            <div class="orden-card">
                <h4 style="font-family: 'Anton', sans-serif; font-size: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; color: #fff;">
                    Orden #${orden.id} - ${orden.cliente || 'Cliente Desconocido'}
                </h4>
                
                <div style="margin-bottom: 20px;">
                    <strong style="color: #ccc; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Productos solicitados:</strong>
                    <ul style="list-style: none; padding: 0; margin-top: 10px;">
                        ${detallesRopa}
                    </ul>
                    <p style="margin-top: 15px; font-size: 1.2rem; font-weight: bold; color: #fff;">
                        Total: $${(orden.total || 0).toFixed(2)}
                    </p>
                </div>

                <div class="acciones-orden" style="display: flex; gap: 10px;">
                    <button onclick="aprobarOrden(${orden.id})" style="flex: 1; background: #28a745; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold; text-transform: uppercase;">
                        Aprobar Orden
                    </button>
                    <button onclick="eliminarPedido(${orden.id})" style="flex: 1; background: #ff4444; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-weight: bold; text-transform: uppercase;">
                        Eliminar / Rechazar
                    </button>
                </div>
            </div>
        `;
        
        contenedor.appendChild(div);
    });
}

// Funciones globales para las Órdenes
async function eliminarPedido(id) {
    const confirmar = await Swal.fire({
        title: '¿Rechazar pedido?',
        text: "Si el cliente no pagó, puedes borrarlo. El stock no se verá afectado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4444',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmar.isConfirmed) {
        try {
            await fetch(`${API_URL}/api/ordenes/${id}`, { method: 'DELETE' });
            cargarOrdenes(); 
            Swal.fire('Eliminado', 'La orden fue eliminada.', 'success');
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'No se pudo eliminar la orden.', 'error');
        }
    }
}

async function aprobarOrden(idOrden) {
    const confirmar = await Swal.fire({
        title: '¿Confirmar Pago?',
        text: "Esto aprobará la orden. Asegúrate de tener la lógica en el backend para descontar el stock.",
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
                Swal.fire('¡Aprobada!', 'La orden ha sido procesada.', 'success');
                cargarOrdenes(); 
                cargarProductosAdmin(); 
            } else {
                const errorData = await respuesta.json();
                Swal.fire('Aviso', 'Asegúrate de tener creada la ruta PUT /api/ordenes/:id/aprobar en server.js', 'info');
            }
        } catch (error) {
            console.error("Error al aprobar:", error);
            Swal.fire('Error', 'Hubo un error de conexión.', 'error');
        }
    }
}

// ==========================================
// 5. INICIALIZADOR
// ==========================================
// Carga los datos solo si estamos en la página del panel de administrador
if (document.getElementById('tabla-productos')) {
    cargarProductosAdmin();
}
if (document.getElementById('contenedor-ordenes')) {
    cargarOrdenes();
}