import { useEffect, useState } from "react";

import Editor from "./Editor";

function App() {

  // =========================
  // LOGIN
  // =========================

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [usuario, setUsuario] =
    useState(null);

  // =========================
  // FORM ARTICULO
  // =========================

  const [titulo, setTitulo] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [contenido, setContenido] =
    useState("");

  const [imagen, setImagen] =
    useState("");

  const [estado, setEstado] =
    useState("borrador");

  // =========================
  // SEO
  // =========================

  const [seoTitle, setSeoTitle] =
    useState("");

  const [
    seoDescription,
    setSeoDescription
  ] = useState("");

  const [
    seoKeywords,
    setSeoKeywords
  ] = useState("");

  // =========================
  // EDIT MODE
  // =========================

  const [editandoId, setEditandoId] =
    useState(null);

  // =========================
  // ARTICULOS
  // =========================

  const [articulos, setArticulos] =
    useState([]);

  // =========================
  // AUTO SLUG
  // =========================

  function generarSlug(texto) {

    return texto
      .toLowerCase()

      .normalize("NFD")

      .replace(
        /[\u0300-\u036f]/g,
        ""
      )

      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )

      .trim()

      .replace(/\s+/g, "-");
  }

  async function cargarArticulos() {

    try {

      const response = await fetch(
        "http://127.0.0.1:8787/articulos"
      );

      const data =
        await response.json();

      setArticulos(data);

    } catch (error) {

      console.log(error);
    }
  }

  // =========================
  // LOGIN
  // =========================

  async function login() {

    try {

      const response = await fetch(
        "http://127.0.0.1:8787/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data =
        await response.json();

      if (data.token) {

        localStorage.setItem(
          "token",
          data.token
        );

        setToken(data.token);

        setUsuario(data.usuario);

        alert("Login correcto");

      } else {

        alert("Login incorrecto");
      }

    } catch (error) {

      console.log(error);
    }
  }

  // =========================
  // SUBIR IMAGEN
  // =========================

  async function subirImagen(event) {

    try {

      const archivo =
        event.target.files[0];

      if (!archivo) {
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "imagen",
        archivo
      );

      const response = await fetch(
        "http://127.0.0.1:8787/upload",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          body: formData
        }
      );

      const data =
        await response.json();

      if (data.success) {

        setImagen(data.url);

        alert("Imagen subida");
      }

    } catch (error) {

      console.log(error);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function logout() {

    localStorage.removeItem("token");

    setToken("");

    setUsuario(null);
  }

  // =========================
  // LIMPIAR FORM
  // =========================

  function limpiarFormulario() {

    setTitulo("");

    setSlug("");

    setDescripcion("");

    setCategoria("");

    setContenido("");

    setImagen("");

    setEstado("borrador");

    setSeoTitle("");

    setSeoDescription("");

    setSeoKeywords("");

    setEditandoId(null);
  }

  // =========================
  // CREAR O EDITAR
  // =========================

  async function guardarArticulo() {

    try {

      const url = editandoId
        ? `http://127.0.0.1:8787/articulos/${editandoId}`
        : "http://127.0.0.1:8787/articulos";

      const method = editandoId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            titulo,
            slug,
            descripcion,
            categoria,
            contenido,
            imagen,
            estado,

            seo_title:
              seoTitle,

            seo_description:
              seoDescription,

            seo_keywords:
              seoKeywords
          })
        }
      );

      const data =
        await response.json();

      if (data.success) {

        alert(
          editandoId
            ? "Artículo actualizado"
            : "Artículo creado"
        );

        limpiarFormulario();

        cargarArticulos();
      }

    } catch (error) {

      console.log(error);
    }
  }

  // =========================
  // EDITAR
  // =========================

  function editarArticulo(articulo) {

    setEditandoId(articulo.id);

    setTitulo(articulo.titulo);

    setSlug(articulo.slug);

    setDescripcion(
      articulo.descripcion
    );

    setCategoria(
      articulo.categoria
    );

    setContenido(
      articulo.contenido
    );

    setImagen(
      articulo.imagen || ""
    );

    setEstado(
      articulo.estado ||
      "borrador"
    );

    setSeoTitle(
      articulo.seo_title || ""
    );

    setSeoDescription(
      articulo.seo_description || ""
    );

    setSeoKeywords(
      articulo.seo_keywords || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // =========================
  // ELIMINAR
  // =========================

  async function eliminarArticulo(id) {

    const confirmar = confirm(
      "¿Eliminar artículo?"
    );

    if (!confirmar) {
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:8787/articulos/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (data.success) {

        alert("Artículo eliminado");

        cargarArticulos();
      }

    } catch (error) {

      console.log(error);
    }
  }

  // =========================
  // INIT
  // =========================

  useEffect(() => {

    cargarArticulos();

  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        maxWidth: "900px",
        margin: "0 auto"
      }}
    >

      <h1>CMS Punto y Coma</h1>

      {/* LOGIN */}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "40px"
        }}
      >

        <h2>Login</h2>

        {
          token ? (

            <div>

              <p>
                Sesión iniciada
              </p>

              <button onClick={logout}>
                Cerrar sesión
              </button>

            </div>

          ) : (

            <div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px"
                }}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px"
                }}
              />

              <button onClick={login}>
                Iniciar sesión
              </button>

            </div>
          )
        }

      </div>

      {
        token && (

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "40px"
            }}
          >

            <h2>
              {
                editandoId
                  ? "Editar artículo"
                  : "Crear artículo"
              }
            </h2>

            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => {

                const valor =
                  e.target.value;

                setTitulo(valor);

                if (!editandoId) {

                  setSlug(
                    generarSlug(valor)
                  );
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px"
              }}
            />

            <p
              style={{
                marginBottom: "5px",
                color: "#666",
                fontSize: "14px"
              }}
            >
              URL del artículo
            </p>

            <input
              type="text"
              placeholder="Slug"
              value={slug}
              onChange={(e) =>
                setSlug(
                  generarSlug(
                    e.target.value
                  )
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px"
              }}
            />

            <input
              type="text"
              placeholder="Categoría"
              value={categoria}
              onChange={(e) =>
                setCategoria(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px"
              }}
            />

            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px",
                height: "100px"
              }}
            />

            <h3>Imagen</h3>

            <input
              type="file"
              onChange={subirImagen}
              style={{
                marginBottom: "20px"
              }}
            />

            {
              imagen && (

                <img
                  src={imagen}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "20px"
                  }}
                />
              )
            }

            <h3>Estado</h3>

            <select
              value={estado}
              onChange={(e) =>
                setEstado(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "20px"
              }}
            >

              <option value="borrador">
                Borrador
              </option>

              <option value="publicado">
                Publicado
              </option>

            </select>

            <h3>
              SEO
            </h3>

            <div
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                background: "#fafafa"
              }}
            >

              <input
                type="text"
                placeholder="SEO Title"
                value={seoTitle}
                onChange={(e) =>
                  setSeoTitle(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "15px"
                }}
              />

              <textarea
                placeholder="SEO Description"
                value={seoDescription}
                onChange={(e) =>
                  setSeoDescription(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  height: "100px",
                  marginBottom: "15px"
                }}
              />

              <input
                type="text"
                placeholder="SEO Keywords"
                value={seoKeywords}
                onChange={(e) =>
                  setSeoKeywords(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px"
                }}
              />

            </div>

            <h3>
              Contenido
            </h3>

            <div
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "20px"
              }}
            >

              <Editor
                content={contenido}
                onChange={setContenido}
              />

            </div>

            <button
              onClick={guardarArticulo}
              style={{
                marginRight: "10px"
              }}
            >
              {
                editandoId
                  ? "Actualizar"
                  : "Crear artículo"
              }
            </button>

            {
              editandoId && (

                <button
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              )
            }

          </div>
        )
      }

      <h2>Artículos</h2>

      {
        articulos.map((articulo) => (

          <div
            key={articulo.id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "10px"
            }}
          >

            <h3>
              {articulo.titulo}
            </h3>

            <p>
              {articulo.descripcion}
            </p>

            <p>
              <strong>Estado:</strong>{" "}
              {articulo.estado}
            </p>

            {
              token && (

                <div
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <button
                    onClick={() =>
                      editarArticulo(articulo)
                    }
                    style={{
                      marginRight: "10px"
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() =>
                      eliminarArticulo(
                        articulo.id
                      )
                    }
                  >
                    Eliminar
                  </button>

                </div>
              )
            }

          </div>
        ))
      }

    </div>
  );
}

export default App;