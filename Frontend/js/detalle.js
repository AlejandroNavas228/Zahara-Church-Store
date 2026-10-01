// Obtenemos el ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const idProducto = parseInt(urlParams.get('id'));

const WHATSAPP_NUMBER = '584143894452'; 

function cargarDetalle() {
    // Buscamos directamente en el archivo productosZahara
    const p = productosZahara.find(prod => prod.id === idProducto);

    if (!p) {
        document.getElementById('info-producto').innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h2 style="color: white; margin-bottom: 20px;">Producto no encontrado 😕</h2>
                <a href="index.html" style="color: #fff; text-decoration: underline;">Volver al catálogo</a>
            </div>`;
        return;
    }

    const descripcion = p.descripcion || 'Sin descripción detallada por el momento. Una prenda con el diseño y la calidad exclusiva de Zahara Store.';
    
    // 1. Añadimos esta línea para leer el ajuste
    const ajusteImagen = p.posicionImagen || 'cover'; 
    
    const arrayFotos = (p.imagenes && p.imagenes.length > 0) ? p.imagenes : [p.imagen];
    
    let galeriaHTML = '';
    if (arrayFotos.length > 1) {
        let miniaturas = arrayFotos.map((foto, index) => {
            return `<img src="${foto}" 
                         onclick="cambiarFotoPrincipal('${foto}', this)" 
                         class="miniatura ${index === 0 ? 'activa' : ''}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${index === 0 ? '#fff' : 'transparent'}; opacity: ${index === 0 ? '1' : '0.6'}; transition: 0.3s;">`;
        }).join('');
        
        galeriaHTML = `<div style="display: flex; gap: 15px; margin-top: 20px; overflow-x: auto; padding-bottom: 10px;">${miniaturas}</div>`;
    }

    document.getElementById('info-producto').innerHTML = `
        <div class="grid-detalle" style="display: flex; flex-wrap: wrap; gap: 50px; max-width: 1100px; margin: 0 auto; padding: 40px 20px; width: 100%;">
            
            <div class="col-imagen" style="flex: 1; min-width: 320px;">
                <!-- 2. Cambiamos 'cover' por '\${ajusteImagen}' aquí abajo -->
                <img id="foto-principal" src="${arrayFotos[0]}" alt="${p.nombre}" style="width: 100\%; aspect-ratio: 1/1; object-fit: ${ajusteImagen}; border-radius: 12px; background: #111;">
                ${galeriaHTML}
            </div>
            
            <!-- Columna de Información -->
            <div class="col-info" style="flex: 1; min-width: 320px; display: flex; flex-direction: column; justify-content: center;">
                <h1 style="font-size: 2.5rem; margin-top: 0; margin-bottom: 10px; font-weight: 700;">${p.nombre}</h1>
                <p class="precio" style="font-size: 2rem; font-weight: bold; color: #fff; margin: 0 0 30px 0;">€${p.precio.toFixed(2)}</p>
                
                <div class="caja-descripcion" style="margin-bottom: 40px; color: #ccc; line-height: 1.6;">
                    <h3 style="color: #fff; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">Detalles de la prenda</h3>
                    <p style="font-size: 1.05rem;">${descripcion}</p>
                </div>
                
                <div class="grupo-botones" style="display: flex; flex-direction: column; gap: 15px; margin-top: auto;">
                    <!-- Botón Agregar al Carrito -->
                    <button class="btn-full" 
                        style="width: 100%; background: #fff; color: #000; border: none; padding: 18px; font-weight: bold; font-size: 1.1rem; border-radius: 8px; cursor: pointer; text-transform: uppercase; transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"
                        onclick="comprarDirecto(${p.id}, '${p.nombre.replace(/'/g, "\\'")}', ${p.precio}, '${p.imagen}')">
                        Añadir al Carrito <i class="fa-solid fa-cart-shopping" style="margin-left: 8px;"></i>
                    </button>
                    
                    <!-- Botón WhatsApp -->
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hola Zahara! Me interesa la prenda: ${encodeURIComponent(p.nombre)}" 
                       class="btn-full" 
                       style="width: 100%; box-sizing: border-box; display: inline-block; text-align: center; background: transparent; color: #fff; border: 1px solid #fff; padding: 18px; font-weight: bold; font-size: 1.1rem; border-radius: 8px; cursor: pointer; text-transform: uppercase; text-decoration: none; transition: 0.3s;"
                       onmouseover="this.style.background='#333'" onmouseout="this.style.background='transparent'"
                       target="_blank">
                        Consultar por WhatsApp <i class="fa-brands fa-whatsapp" style="margin-left: 8px;"></i>
                    </a>
                </div>
            </div>

        </div>
    `;
}

// Función global para cambiar la foto principal al hacer clic en una miniatura
window.cambiarFotoPrincipal = function(srcNueva, elementoClickeado) {
    document.getElementById('foto-principal').src = srcNueva;
    
    // Apagamos todas las miniaturas
    const todasLasMiniaturas = document.querySelectorAll('.miniatura');
    todasLasMiniaturas.forEach(img => {
        img.style.borderColor = 'transparent';
        img.style.opacity = '0.6';
    });
    
    // Encendemos la miniatura que se acaba de clickear
    elementoClickeado.style.borderColor = '#fff';
    elementoClickeado.style.opacity = '1';
};

// Función para añadir al carrito
function comprarDirecto(id, nombre, precio, imagen) {
    let carrito = JSON.parse(localStorage.getItem('carritoZahara')) || [];
    const existe = carrito.some(item => item.id === id);
    
    if (!existe) {
        carrito.push({ id, nombre, precio, imagen });
        localStorage.setItem('carritoZahara', JSON.stringify(carrito));
        
        // Usamos SweetAlert si está disponible en la página, sino un alert nativo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¡Añadido!',
                text: 'El producto está en tu carrito.',
                icon: 'success',
                confirmButtonColor: '#000'
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            alert('¡Prenda añadida al carrito con éxito!');
            window.location.href = 'index.html';
        }
    } else {
        alert('Este producto ya se encuentra en tu carrito.');
        window.location.href = 'index.html';
    }
}

// Arrancamos la función al cargar el script
cargarDetalle();