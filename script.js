const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

//Declaracion para poder obtener los proyectos publicos mediante la id de Itson 
const ITSON_ID = localStorage.getItem("itsonId") || "253311";

//Funcion para obtener los proyectos y desplegarlos
async function cargarProyectosPublicos() {

    const contenedor = document.getElementById("contenedorProyectos");

    try {
        const res = await fetch(`${API_BASE}/publicProjects/${ITSON_ID}`);

        if (!res.ok)
            throw new Error("No se pudieron obtener proyectos");

        const proyectos = await res.json();

        contenedor.innerHTML = "";

        //Esta parte es como se van a agregar los proyectos del backoffice al Portafolio
        proyectos.forEach(p => {
            contenedor.innerHTML += `
                <div class="proyecto">
                    <img src="${p.images?.[0] || ''}">
                    <h3>${p.title}</h3>
                    <p>${p.description}</p>
                    <div class="tec-proyecto">
                        ${p.technologies.map(t => `<span>${t}</span>`).join("")}
                    </div>
                    <a href="${p.repository}" target="_blank">Ver repositorio</a>
                </div>
            `;
        });

    } catch (error) {
        contenedor.innerHTML = "<p style='color:white;'>No se pudieron cargar los proyectos</p>";
    }
}

//Se cargan los proyectos
cargarProyectosPublicos();