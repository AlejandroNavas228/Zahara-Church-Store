// Definimos la URL de tu nuevo servidor local
const API_URL = 'https://zahara-api.onrender.com'; // Cambia a tu URL de Render cuando esté desplegado

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
            // Apuntamos a tu servidor local
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

    // B) SUBIR PRODUCTO NUEVO
    formAdmin.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre-producto').value;
        const precio = document.getElementById('precio-producto').value;
        const archivoImagen = document.getElementById('imagen-producto').files[0];
        const btnGuardar = document.querySelector('button[type="submit"]');

        if (!archivoImagen) {
            alert("Por favor selecciona una imagen");
            return;
        }

        btnGuardar.innerText = "Procesando... 🚀"; // Un pequeño toque visual
        btnGuardar.disabled = true;

        const formData = new FormData();
        formData.append('nombre', nombre);
        // IMPORTANTE: Ahora el backend espera que esto se llame 'precio_usd'
        formData.append('precio_usd', precio); 
        formData.append('imagen', archivoImagen);

        try {
            // Usamos la ruta protegida de admin que creamos
            const respuesta = await fetch(`${API_URL}/api/admin/productos`, {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert("✅ " + resultado.mensaje);
                formAdmin.reset();
                cargarProductosAdmin(); 
            } else {
                alert("❌ Error: " + (resultado.error || "Revisa la terminal"));
            }

        } catch (error) {
            console.error("Error al subir:", error);
            alert("Error de conexión con el servidor");
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

            // Usamos producto.precio_usd en lugar de producto.precio
            fila.innerHTML = `
                <td style="padding: 10px;">
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 10px;">${producto.nombre}</td>
                <td style="padding: 10px;">$${producto.precio_usd.toFixed(2)}</td>
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
    if (confirm("¿Seguro que quieres borrar esta camisa?")) {
        try {
            const respuesta = await fetch(`${API_URL}/api/admin/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (respuesta.ok) {
                alert("🗑️ Producto eliminado");
                cargarProductosAdmin(); 
            } else {
                alert("Error al eliminar");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    }
}