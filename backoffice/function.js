const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

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

if (window.location.pathname.includes("index3.html")) {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "index.html";
    }
}