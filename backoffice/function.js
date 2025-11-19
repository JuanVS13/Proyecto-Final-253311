const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

//Variable para editar
let proyectoEnEdicion = null;

//Esta funcion es para poder obtener el token guardado
function getToken() {
    return localStorage.getItem("authToken");
}


//Funcionamiento del Register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = {
            name: document.getElementById("name").value,
            email: document.getElementById("correo").value,
            itsonId: document.getElementById("itsonId").value,
            password: document.getElementById("contra").value
        };

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error al registrar.");
                return;
            }

            alert("Usuario registrado correctamente");
            window.location.href = "index.html";
        } catch (err) {
            alert("Error en el servidor");
        }
    });
}


//Funcionamiento del Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Login incorrecto");
                return;
            }

            //Se guarda el token
            localStorage.setItem("authToken", data.token);

            //Se guarda la informacion del usuario
            if (data.user) {
                localStorage.setItem("userId", data.user.id || "");
                localStorage.setItem("itsonId", data.user.itsonId || "");
            } else {
                console.warn("La API no devolvió 'user'. Respuesta:", data);
            }

            window.location.href = "index3.html";
        } catch (err) {
            console.error("ERROR LOGIN:", err);
            alert("Error en el servidor");
        }
    });
}


//Esta funcion es para poder proteger al home, si se regresa, pedira iniciar sesion
if (window.location.pathname.includes("index3.html")) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "index.html";
    }
}


//Funciones CRUD

//Funcion para poder cargar los proyectos, leer y mostrar
async function cargarProyectos() {
    const token = getToken();
    const lista = document.getElementById("listaProyectos");

    if (!lista) return;

    try {
        const res = await fetch(`${API_BASE}/projects`, {
            headers: { "auth-token": token }
        });

        const proyectos = await res.json();

        lista.innerHTML = "";

        //Si no se muestra ningun proyecto, se muestra la plantilla de ejemplo de proyecto
        if (!Array.isArray(proyectos) || proyectos.length === 0) {
            lista.innerHTML = `
                <div class="tarjeta">
                    <h3>Nombre del Proyecto</h3>
                    <p><strong>Descripción:</strong> Descripción del proyecto</p>
                    <p><strong>Tecnologías:</strong> Tecnologías del proyecto</p>
                    <a href="#" class="repo">Ver repositorio</a>
                    <img class="img-proyecto" src="" alt="Imagen del proyecto">

                    <div class="opciones">
                        <button class="btnEditar">Actualizar</button>
                        <button class="btnEliminar">Eliminar</button>
                    </div>
                </div>
            `;
            return;
        }

        //Si hay proyectos, se cargan los proyectos creados
        proyectos.forEach(p => {
            lista.innerHTML += `
                <div class="tarjeta">
                    <h3>${p.title}</h3>
                    <p><strong>Descripción:</strong> ${p.description}</p>
                    <p><strong>Tecnologías:</strong> ${p.technologies.join(", ")}</p>
                    <a href="${p.repository}" target="_blank" class="repo">Ver repositorio</a>

                    <img class="img-proyecto" src="${p.images && p.images[0] ? p.images[0] : ""}" alt="Imagen del proyecto">

                    <div class="opciones">
                        <button class="btnEditar" onclick="editarProyecto('${p._id}', '${p.title}', '${p.description}', '${p.technologies.join(", ")}', '${p.repository}', '${p.images?.[0] || ""}')">Actualizar</button>
                        <button class="btnEliminar" onclick="eliminarProyecto('${p._id}')">Eliminar</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        alert("Error al cargar proyectos");
    }
}

cargarProyectos();


//Funcion para poder editar los proyectos
async function editarProyecto(id, title, description, technologies, repository, image) {

    proyectoEnEdicion = id;

    document.getElementById("title").value = title;
    document.getElementById("description").value = description;
    document.getElementById("technologies").value = technologies;
    document.getElementById("repository").value = repository;
    document.getElementById("image").value = image;

    document.getElementById("btnAgregar").textContent = "Actualizar proyecto";
}


//Funcion para poder agregar proyectos y actualizarlos
async function createOrUpdateProject() {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    const projectData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        technologies: document.getElementById("technologies").value.split(",").map(t => t.trim()),
        repository: document.getElementById("repository").value,
        images: [document.getElementById("image").value]
    };

    //Si se estan editando se aplica el metodo PUT
    if (proyectoEnEdicion) {
        const res = await fetch(`${API_BASE}/projects/${proyectoEnEdicion}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "auth-token": token
            },
            body: JSON.stringify(projectData)
        });

        if (!res.ok) {
            alert("Error al actualizar el proyecto");
            return;
        }

        alert("Proyecto actualizado correctamente");

        proyectoEnEdicion = null;
        document.getElementById("btnAgregar").textContent = "Agregar proyecto";

        //Si se van a agregar se aplica el metodo POST
    } else {
        const res = await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": token
            },
            body: JSON.stringify(projectData)
        });

        if (!res.ok) {
            alert("Error al crear el proyecto");
            return;
        }

        alert("Proyecto agregado correctamente");
    }

    //se limpian los inputs del formulario despues de agregar y actualizar
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("technologies").value = "";
    document.getElementById("repository").value = "";
    document.getElementById("image").value = "";

    cargarProyectos();
}


//Hace funcionar al btnAgregar para poder agregar y actualizar proyectos
const btnAgregar = document.getElementById("btnAgregar");

if (btnAgregar) {
    btnAgregar.addEventListener("click", createOrUpdateProject);
}


//Funcion para poder eliminar proyectos
async function eliminarProyecto(id) {
    if (!confirm("¿Eliminar este proyecto?")) return;

    try {
        const res = await fetch(`${API_BASE}/projects/${id}`, {
            method: "DELETE",
            headers: { "auth-token": getToken() }
        });

        if (!res.ok) {
            alert("Error al eliminar");
            return;
        }

        alert("Proyecto eliminado");
        cargarProyectos();

    } catch (error) {
        alert("Error al conectar con la API");
    }
}


//Funcion para poder cerrar sesion, redirige al login y borra el token
const cerrarSesion = document.querySelector("nav a");

if (cerrarSesion) {
    cerrarSesion.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
    });
}