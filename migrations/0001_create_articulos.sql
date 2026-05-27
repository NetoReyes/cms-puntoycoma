CREATE TABLE articulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,

    categoria TEXT NOT NULL,

    contenido TEXT NOT NULL,

    imagen TEXT,

    autor TEXT,

    estado TEXT NOT NULL DEFAULT 'draft',

    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);