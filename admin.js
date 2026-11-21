let productos = [];

function sacarId(p) {
  return p.id ?? p.ID ?? p.Id ?? p._id ?? p.productoId ?? p.productId;
}

function entrar() {
  const u = document.getElementById("usuario").value;
  const c = document.getElementById("clave").value;
  if (u === ADMIN_USER && c === ADMIN_PASS) {
    sessionStorage.setItem("admin", "si");
    verPanel();
  } else {
    document.getElementById("error").textContent = "Usuario o contraseña incorrectos";
  }
}

function salir() {
  sessionStorage.removeItem("admin");
  location.reload();
}

function verPanel() {
  document.getElementById("login").classList.add("oculto");
  document.getElementById("panel").classList.remove("oculto");
  document.getElementById("btnSalir").classList.remove("oculto");
  cargar();
}

async function cargar() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("MockAPI respondió " + res.status);
    const datos = await res.json();
    productos = datos.map(p => ({ ...p, id: sacarId(p) }));
    const tabla = document.getElementById("tabla");
    tabla.innerHTML = "";
    productos.forEach((p, i) => {
      tabla.innerHTML += `
        <tr>
          <td>${p.nombre}</td><td>${p.precio}</td><td>${p.stock}</td><td>${p.categoria || ''}</td>
          <td>
            <button onclick="editar(${i})">Editar</button>
            <button class="rojo" onclick="eliminar(${i})">Eliminar</button>
          </td>
        </tr>`;
    });
  } catch (e) {
    alert("Error al cargar productos: " + e.message);
  }
}

async function guardar() {
  const id = document.getElementById("idEditar").value;
  const datos = {
    nombre: document.getElementById("nombre").value,
    precio: Number(document.getElementById("precio").value),
    stock: Number(document.getElementById("stock").value),
    categoria: document.getElementById("categoria").value,
    imagen: document.getElementById("imagen").value
  };
  if (!datos.nombre) { alert("Falta el nombre"); return; }
  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error("MockAPI respondió " + res.status);
    limpiar();
    cargar();
  } catch (e) {
    alert("Error al guardar: " + e.message);
  }
}

function editar(i) {
  const p = productos[i];
  document.getElementById("idEditar").value = p.id;
  document.getElementById("nombre").value = p.nombre;
  document.getElementById("precio").value = p.precio;
  document.getElementById("stock").value = p.stock;
  document.getElementById("categoria").value = p.categoria || "";
  document.getElementById("imagen").value = p.imagen || "";
  document.getElementById("titulo").textContent = "Editar producto";
}

async function eliminar(i) {
  const p = productos[i];
  if (!confirm("¿Eliminar " + p.nombre + "?")) return;
  try {
    const res = await fetch(`${API_URL}/${p.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("MockAPI respondió " + res.status);
    cargar();
  } catch (e) {
    alert("Error al eliminar: " + e.message);
  }
}

function limpiar() {
  ["idEditar", "nombre", "precio", "stock", "categoria", "imagen"].forEach(i => document.getElementById(i).value = "");
  document.getElementById("titulo").textContent = "Agregar producto";
}

if (sessionStorage.getItem("admin") === "si") verPanel();
