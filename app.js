let productos = [];

// Busca el id aunque MockAPI lo llame distinto
function sacarId(p) {
  return p.id ?? p.ID ?? p.Id ?? p._id ?? p.productoId ?? p.productId;
}

async function cargar() {
  const msg = document.getElementById("mensaje");
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("MockAPI respondió " + res.status);
    const datos = await res.json();
    console.log("Ejemplo de producto:", datos[0]);
    productos = datos.map(p => ({ ...p, id: sacarId(p) }));
    llenarCategorias();
    mostrar();
  } catch (e) {
    msg.textContent = "Error al cargar productos: " + e.message;
    console.error(e);
  }
}

function llenarCategorias() {
  const select = document.getElementById("filtro");
  const actual = select.value;
  const cats = [...new Set(productos.map(p => p.categoria).filter(c => c))];
  select.innerHTML = '<option value="">Todas las categorías</option>';
  cats.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
  select.value = actual;
}

function mostrar() {
  const filtro = document.getElementById("filtro").value;
  const cont = document.getElementById("catalogo");
  cont.innerHTML = "";
  productos.forEach((p, i) => {
    if (filtro && p.categoria !== filtro) return;
    const agotado = Number(p.stock) <= 0;
    cont.innerHTML += `
      <div class="card">
        <img src="${p.imagen || ''}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p>${p.categoria || ''}</p>
        <p class="precio">Bs ${p.precio}</p>
        <p>${agotado ? '<span class="agotado">Agotado</span>' : 'Stock: ' + p.stock}</p>
        <button ${agotado ? 'disabled' : ''} onclick="comprar(${i})">Comprar</button>
      </div>`;
  });
}

// Recibe la posición del producto en la lista
async function comprar(i) {
  const msg = document.getElementById("mensaje");
  const p = productos[i];
  if (!p) { msg.textContent = "Producto no encontrado"; return; }

  if (p.id === undefined || p.id === null) {
    msg.textContent = "Error: el producto no tiene id. Campos que llegan: " + Object.keys(p).join(", ");
    return;
  }

  const stockActual = Number(p.stock);
  if (isNaN(stockActual) || stockActual <= 0) { msg.textContent = "Sin stock"; return; }

  try {
    const res = await fetch(`${API_URL}/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, stock: stockActual - 1 })
    });
    if (!res.ok) throw new Error("MockAPI respondió " + res.status);

    p.stock = stockActual - 1;
    mostrar();
    msg.textContent = `Compraste 1 ${p.nombre}`;
  } catch (e) {
    msg.textContent = "Error al comprar: " + e.message;
    console.error(e);
  }
}

cargar();