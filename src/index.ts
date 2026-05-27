import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface Env {
  puntoycoma_db: D1Database;
  JWT_SECRET: string;
  MEDIA: R2Bucket;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  activo?: number;
  creado_en?: string;
}

interface JwtPayload {
  id: number;
  email: string;
  rol: string;
}

// =========================
// CORS
// =========================

function corsHeaders() {

  return {
    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Methods":
      "GET, POST, PUT, DELETE, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type, Authorization"
  };
}

// =========================
// VALIDAR TOKEN
// =========================

function verificarToken(
  request: Request,
  env: Env
): JwtPayload | null {

  const authHeader =
    request.headers.get(
      "Authorization"
    );

  if (!authHeader) {
    return null;
  }

  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );

  try {

    const decoded =
      jwt.verify(
        token,
        env.JWT_SECRET
      ) as JwtPayload;

    return decoded;

  } catch {

    return null;
  }
}

export default {

  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {

    const url =
      new URL(request.url);

    // =========================
    // CORS
    // =========================

    if (
      request.method === "OPTIONS"
    ) {

      return new Response(
        null,
        {
          headers:
            corsHeaders()
        }
      );
    }

    // =========================
    // LOGIN
    // =========================

    if (
      request.method === "POST" &&
      url.pathname === "/login"
    ) {

      try {

        const body =
          await request.json();

        const {
          email,
          password
        } = body;

        if (
          !email ||
          !password
        ) {

          return Response.json({
            error:
              "Email y password requeridos"
          }, {
            status: 400,
            headers:
              corsHeaders()
          });
        }

        const usuario =
          await env
            .puntoycoma_db
            .prepare(`
              SELECT
                id,
                nombre,
                email,
                password_hash,
                rol
              FROM usuarios
              WHERE email = ?
              LIMIT 1
            `)
            .bind(email)
            .first<Usuario>();

        if (!usuario) {

          return Response.json({
            error:
              "Usuario no encontrado"
          }, {
            status: 401,
            headers:
              corsHeaders()
          });
        }

        const passwordCorrecto =
          await bcrypt.compare(
            password,
            usuario.password_hash
          );

        if (!passwordCorrecto) {

          return Response.json({
            error:
              "Password incorrecto"
          }, {
            status: 401,
            headers:
              corsHeaders()
          });
        }

        const token =
          jwt.sign(
            {
              id: usuario.id,
              email:
                usuario.email,
              rol:
                usuario.rol
            },
            env.JWT_SECRET,
            {
              expiresIn:
                "7d"
            }
          );

        return Response.json({
          success: true,
          token,

          usuario: {
            id: usuario.id,
            nombre:
              usuario.nombre,
            email:
              usuario.email,
            rol:
              usuario.rol
          }

        }, {
          headers:
            corsHeaders()
        });

      } catch (error) {

        return Response.json({
          error:
            "Error interno del servidor",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // MEDIA LIBRARY
    // =========================

    if (
      request.method === "GET" &&
      url.pathname === "/media"
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      try {

        const objects =
          await env.MEDIA.list();

        const archivos =
          objects.objects.map(
            (obj) => ({

              nombre:
                obj.key,

              url:
                `https://pub-442323e1509b4845800a54e39aecb107.r2.dev/${obj.key}`,

              tamaño:
                obj.size,

              subido_en:
                obj.uploaded
            })
          );

        return Response.json(
          archivos,
          {
            headers:
              corsHeaders()
          }
        );

      } catch (error) {

        return Response.json({
          error:
            "Error cargando media",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // PERFIL
    // =========================

    if (
      request.method === "GET" &&
      url.pathname === "/perfil"
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      return Response.json({
        success: true,
        usuario
      }, {
        headers:
          corsHeaders()
      });
    }

    // =========================
    // OBTENER USUARIOS
    // =========================

    if (
      request.method === "GET" &&
      url.pathname === "/usuarios"
    ) {

      const usuarios =
        await env
          .puntoycoma_db
          .prepare(`
            SELECT
              id,
              nombre,
              email,
              rol,
              activo,
              creado_en
            FROM usuarios
          `)
          .all();

      return Response.json(
        usuarios.results,
        {
          headers:
            corsHeaders()
        }
      );
    }

    // =========================
    // OBTENER ARTICULOS
    // =========================

    if (
      request.method === "GET" &&
      url.pathname === "/articulos"
    ) {

      const articulos =
        await env
          .puntoycoma_db
          .prepare(`
            SELECT *
            FROM articulos
            ORDER BY id DESC
          `)
          .all();

      return Response.json(
        articulos.results,
        {
          headers:
            corsHeaders()
        }
      );
    }

    // =========================
    // OBTENER ARTICULO
    // =========================

    if (
      request.method === "GET" &&
      url.pathname.startsWith(
        "/articulos/"
      )
    ) {

      try {

        const id =
          url.pathname
            .split("/")[2];

        const articulo =
          await env
            .puntoycoma_db
            .prepare(`
              SELECT *
              FROM articulos
              WHERE id = ?
              LIMIT 1
            `)
            .bind(id)
            .first();

        if (!articulo) {

          return Response.json({
            error:
              "Artículo no encontrado"
          }, {
            status: 404,
            headers:
              corsHeaders()
          });
        }

        return Response.json(
          articulo,
          {
            headers:
              corsHeaders()
          }
        );

      } catch (error) {

        return Response.json({
          error:
            "Error obteniendo artículo",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // CREAR ARTICULO
    // =========================

    if (
      request.method === "POST" &&
      url.pathname === "/articulos"
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      try {

        const body =
          await request.json();

        const {
          titulo,
          slug,
          descripcion,
          categoria,
          contenido,
          imagen,
          estado,

          seo_title,
          seo_description,
          seo_keywords
        } = body;

        if (
          !titulo ||
          !slug ||
          !categoria ||
          !contenido
        ) {

          return Response.json({
            error:
              "Faltan campos requeridos"
          }, {
            status: 400,
            headers:
              corsHeaders()
          });
        }

        const resultado =
          await env
            .puntoycoma_db
            .prepare(`
              INSERT INTO articulos (
                titulo,
                slug,
                descripcion,
                categoria,
                contenido,
                imagen,
                autor,
                estado,

                seo_title,
                seo_description,
                seo_keywords
              )
              VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
              )
            `)
            .bind(
              titulo,
              slug,
              descripcion || "",
              categoria,
              contenido,
              imagen || "",
              usuario.email,
              estado || "borrador",

              seo_title || "",
              seo_description || "",
              seo_keywords || ""
            )
            .run();

        return Response.json({
          success: true,

          articulo_id:
            resultado.meta
              .last_row_id

        }, {
          headers:
            corsHeaders()
        });

      } catch (error) {

        return Response.json({
          error:
            "Error creando artículo",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // EDITAR ARTICULO
    // =========================

    if (
      request.method === "PUT" &&
      url.pathname.startsWith(
        "/articulos/"
      )
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      try {

        const id =
          url.pathname
            .split("/")[2];

        const body =
          await request.json();

        const {
          titulo,
          slug,
          descripcion,
          categoria,
          contenido,
          imagen,
          estado,

          seo_title,
          seo_description,
          seo_keywords

        } = body;

        await env
          .puntoycoma_db
          .prepare(`
            UPDATE articulos
            SET
              titulo = ?,
              slug = ?,
              descripcion = ?,
              categoria = ?,
              contenido = ?,
              imagen = ?,
              estado = ?,

              seo_title = ?,
              seo_description = ?,
              seo_keywords = ?,

              actualizado_en =
                CURRENT_TIMESTAMP

            WHERE id = ?
          `)
          .bind(
            titulo,
            slug,
            descripcion || "",
            categoria,
            contenido,
            imagen || "",
            estado || "borrador",

            seo_title || "",
            seo_description || "",
            seo_keywords || "",

            id
          )
          .run();

        return Response.json({
          success: true,

          mensaje:
            "Artículo actualizado"

        }, {
          headers:
            corsHeaders()
        });

      } catch (error) {

        return Response.json({
          error:
            "Error actualizando artículo",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // ELIMINAR ARTICULO
    // =========================

    if (
      request.method === "DELETE" &&
      url.pathname.startsWith(
        "/articulos/"
      )
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      try {

        const id =
          url.pathname
            .split("/")[2];

        await env
          .puntoycoma_db
          .prepare(`
            DELETE FROM articulos
            WHERE id = ?
          `)
          .bind(id)
          .run();

        return Response.json({
          success: true,

          mensaje:
            "Artículo eliminado"

        }, {
          headers:
            corsHeaders()
        });

      } catch (error) {

        return Response.json({
          error:
            "Error eliminando artículo",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    // =========================
    // UPLOAD
    // =========================

    if (
      request.method === "POST" &&
      url.pathname === "/upload"
    ) {

      const usuario =
        verificarToken(
          request,
          env
        );

      if (!usuario) {

        return Response.json({
          error:
            "No autorizado"
        }, {
          status: 401,
          headers:
            corsHeaders()
        });
      }

      try {

        const formData =
          await request.formData();

        const archivo =
          formData.get("imagen");

        if (!archivo) {

          return Response.json({
            error:
              "Imagen requerida"
          }, {
            status: 400,
            headers:
              corsHeaders()
          });
        }

        if (
          !(archivo instanceof File)
        ) {

          return Response.json({
            error:
              "Archivo inválido"
          }, {
            status: 400,
            headers:
              corsHeaders()
          });
        }

        const nombreArchivo =
          `${Date.now()}-${archivo.name}`;

        await env.MEDIA.put(
          nombreArchivo,
          await archivo.arrayBuffer(),
          {
            httpMetadata: {
              contentType:
                archivo.type
            }
          }
        );

        const imageUrl =
          `https://pub-442323e1509b4845800a54e39aecb107.r2.dev/${nombreArchivo}`;

        return Response.json({
          success: true,
          url: imageUrl
        }, {
          headers:
            corsHeaders()
        });

      } catch (error) {

        return Response.json({
          error:
            "Error subiendo imagen",

          detalle:
            String(error)
        }, {
          status: 500,
          headers:
            corsHeaders()
        });
      }
    }

    return new Response(
      "Ruta no encontrada",
      {
        status: 404,
        headers:
          corsHeaders()
      }
    );
  },
};