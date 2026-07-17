require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const multer = require("multer");
const path = require("path");
// Ya NO necesitas fs para crear carpetas locales
// const fs = require("fs");

// ========== NUEVO: Configuración de Cloudinary ==========
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'productos',            // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: (req, file) => {
      return Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    }
  }
});

const upload = multer({ storage });
// =========================================================

require("dotenv").config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Cargada" : "No cargada");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ========== ELIMINADA la ruta estática de uploads ==========
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== RUTAS DE SUBIDA CON CLOUDINARY ==========
app.post("/upload-productos", upload.array("imagenes", 20), async (req, res) => {
  // Cloudinary devuelve la URL en req.files[].path
  const imagenes = req.files.map(file => file.path);
  res.json(imagenes);
});

app.post("/upload-banner", upload.single("imagen"), (req, res) => {
  const imagen = req.file.path; // URL de Cloudinary
  res.json({ imagen });
});

/* ================================================= */
/* 🔵 OBTENER TODOS LOS PRODUCTOS */
/* ================================================= */

app.post("/enviar-cotizacion", async (req, res) => {
  try {
    const { nombre, correo, celular, producto, total, pdf } = req.body;

    // convertir base64 a buffer
    const pdfBuffer = Buffer.from(
      pdf.split("base64,")[1],
      "base64"
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Cotización",
      html: `
        <h2>Hola ${nombre}</h2>
        <p>Adjuntamos tu cotización.</p>
      `,
      attachments: [
        {
          filename: "cotizacion.pdf",
          content: pdfBuffer
        }
      ]
    });

    res.json({ ok: true });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

app.get("/productos", async (req, res) => {

  try {



    const sql = `
    
      SELECT 
        productos.*,
        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria,
        tipos.nombre AS tipo

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id

       LEFT JOIN tipos ON tipos.id = productos.tipo_id

      WHERE productos.visible = 1
    
    `;

    const [results] = await db.query(sql);

    res.json(results);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});


app.get("/admin/productos", async (req, res) => {

  try {

    const sql = `
    
      SELECT 
        productos.*,
        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id
    
    `;

    const [results] = await db.query(sql);

    res.json(results);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
/* ================================================= */
/* ⭐ PRODUCTOS DESTACADOS */
/* ================================================= */

app.get("/productos/destacados", async (req, res) => {

  try {

    const sql = `
    
      SELECT 
        productos.*,

        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id

      WHERE productos.destacado = 1
    
    `;

    const [result] = await db.query(sql);

    res.json(result);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});


/* ================================================= */
/* 🟡 PRODUCTOS POR CATEGORÍA ID */
/* ================================================= */

app.get("/productos/categoria-id/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const sql = `
    
      SELECT 
        productos.*,

        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id

      WHERE productos.categoria_id = ?
    
    `;

    const [result] = await db.query(sql, [id]);

    res.json(result);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});

/* ================================================= */
/* 🟡 PRODUCTOS POR CATEGORÍA */
/* ================================================= */

app.get("/productos/categoria/:nombre", async (req, res) => {

  try {

    const nombre = req.params.nombre;

    const sql = `
    
      SELECT 
        productos.*,

        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id

      WHERE LOWER(categorias.nombre) = LOWER(?)
    
    `;

    const [result] = await db.query(sql, [nombre]);

    res.json(result);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});
/* ================================================= */
/* 🔥 PRODUCTOS POR SUBCATEGORÍA */
/* ================================================= */

app.get("/productos/subcategoria/:nombre", async (req, res) => {

  try {

    const { nombre } = req.params;

    const sql = `

      SELECT 
        productos.*,
        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      INNER JOIN subcategorias
      ON productos.subcategoria_id = subcategorias.id

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      WHERE subcategorias.nombre = ?

    `;

    const [rows] = await db.query(sql, [nombre]);

    res.json(rows);

  } catch (error) {

    console.log(error);

    res.status(500).json(error);

  }

});
/* ================================================= */
/* 🟣 OBTENER PRODUCTO POR ID */
/* ================================================= */

app.get("/productos/:id", async (req, res) => {

  try {

    const id = req.params.id;

    const sql = `
    
      SELECT 
        productos.*,

        categorias.nombre AS categoria,
        subcategorias.nombre AS subcategoria

      FROM productos

      LEFT JOIN categorias
      ON categorias.id = productos.categoria_id

      LEFT JOIN subcategorias
      ON subcategorias.id = productos.subcategoria_id

      WHERE productos.id = ?
    
    `;

    const [result] = await db.query(sql, [id]);

    res.json(result[0]);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});



/* ================================================= */
/* 🛠 ADMIN PRODUCTOS */
/* ================================================= */

app.post("/productos", async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      precioOferta,
      oferta,
      rebaja,
      stock,
      imagenes,
      categoria_id,
      subcategoria_id,
      tipo_id,                 // ← NUEVO
      destacado,
      nuevo,
      sugerencias,
      fichaTecnica,
      sku,
      tipoProducto,
      presentacion,
      ancho,
      alto,
      grueso,
      cobertura,
      tipoVenta,
      piezasCaja,
      tipoCobertura,
      especificaciones,
      informacionAdicional
    } = req.body;

    const sql = `
      INSERT INTO productos (
        nombre, descripcion, precio, precioOferta, oferta, rebaja,
        stock, imagenes, categoria_id, subcategoria_id, tipo_id,
        destacado, nuevo, sugerencias, fichaTecnica, sku,
        tipoProducto, presentacion, ancho, alto, grueso,
        cobertura, piezasCaja, tipoVenta, tipoCobertura,
        especificaciones, informacionAdicional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nombre, descripcion, precio, precioOferta, oferta ? 1 : 0, rebaja ? 1 : 0,
      stock, imagenes, categoria_id, subcategoria_id, tipo_id,
      destacado ? 1 : 0, nuevo ? 1 : 0, JSON.stringify(sugerencias || []), fichaTecnica, sku,
      tipoProducto, presentacion, ancho, alto, grueso,
      cobertura, piezasCaja, tipoVenta, tipoCobertura,
      especificaciones, informacionAdicional
    ];

    const [result] = await db.query(sql, values);
    res.json({ mensaje: "Producto creado", id: result.insertId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

/* ================================================= */
/* ✏️ ACTUALIZAR PRODUCTO */
/* ================================================= */

app.put("/productos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nombre,
      descripcion,
      precio,
      precioOferta,
      oferta,
      rebaja,
      stock,
      imagenes,
      categoria_id,
      subcategoria_id,
      tipo_id,                 // ← NUEVO
      destacado,
      nuevo,
      sugerencias,
      fichaTecnica,
      sku,
      tipoProducto,
      presentacion,
      ancho,
      alto,
      grueso,
      cobertura,
      piezasCaja,
      tipoVenta,
      tipoCobertura,
      especificaciones,
      informacionAdicional
    } = req.body;

    const sql = `
      UPDATE productos SET
        nombre=?, descripcion=?, precio=?, precioOferta=?, oferta=?, rebaja=?,
        stock=?, imagenes=?, categoria_id=?, subcategoria_id=?, tipo_id=?,
        destacado=?, nuevo=?, sugerencias=?, fichaTecnica=?,
        sku=?, tipoProducto=?, presentacion=?, ancho=?, alto=?, grueso=?,
        cobertura=?, piezasCaja=?, tipoVenta=?, tipoCobertura=?,
        especificaciones=?, informacionAdicional=?
      WHERE id=?
    `;

    const values = [
      nombre, descripcion, precio, precioOferta, oferta ? 1 : 0, rebaja ? 1 : 0,
      stock, imagenes, categoria_id, subcategoria_id, tipo_id,
      destacado ? 1 : 0, nuevo ? 1 : 0, JSON.stringify(sugerencias || []), fichaTecnica,
      sku, tipoProducto, presentacion, ancho, alto, grueso,
      cobertura, piezasCaja, tipoVenta, tipoCobertura,
      especificaciones, informacionAdicional,
      id
    ];

    await db.query(sql, values);
    res.json({ mensaje: "Producto actualizado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

/* ================================================= */
/* 🔴 ELIMINAR PRODUCTO */
/* ================================================= */

app.delete("/productos/:id", async (req, res) => {

  try {

    const id = req.params.id;

    await db.query(
      "DELETE FROM productos WHERE id=?",
      [id]
    );

    res.json({
      message: "Producto eliminado"
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});

/* ================================================= */
/* 🔥 BANNERS */
/* ================================================= */


/* ================================================= */
/* ➕ CREAR BANNER */
/* ================================================= */

app.post("/banners", async (req, res) => {

  try {

    const {
      titulo,
      descripcion,
      imagen,
      categoria,
      subcategoria
    } = req.body;

    const sql = `
    
      INSERT INTO banners
      (
        titulo,
        descripcion,
        imagen,
        categoria,
        subcategoria
      )

      VALUES (?, ?, ?, ?, ?)
    
    `;

    const [result] = await db.query(sql, [

      titulo,
      descripcion,
      imagen,
      categoria,
      subcategoria

    ]);

    res.json({

      message: "Banner creado",
      id: result.insertId

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Error al crear banner"
    });

  }

});

app.get("/banners", async (req, res) => {

  try {

    const [result] = await db.query(
      "SELECT * FROM banners"
    );

    res.json(result);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});


app.delete("/banners/:id", async (req, res) => {

  try {

    await db.query(
      "DELETE FROM banners WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Banner eliminado"
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});

/* ================================================= */
/* 🔥 CATEGORÍAS DESTACADAS */
/* ================================================= */

app.get("/categorias-destacadas", async (req, res) => {

  try {

    const sql = `
    
      SELECT 
        categorias.id AS categoria_id,
        categorias.nombre AS categoria,

        MIN(productos.imagenes) AS imagenes

      FROM categorias

      LEFT JOIN productos
      ON productos.categoria_id = categorias.id

      WHERE categorias.destacada = 1

      GROUP BY categorias.id, categorias.nombre
    
    `;

    const [result] = await db.query(sql);

    res.json(result);

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});

/* ===================================== */
/* 📂 OBTENER CATEGORIAS */
/* ===================================== */

app.get("/categorias", async (req, res) => {

  try {

    const [results] = await db.query(
      "SELECT * FROM categorias"
    );

    res.json(results);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});

/* ===================================== */
/* ➕ CREAR CATEGORIA */
/* ===================================== */

app.post("/categorias", async (req, res) => {

  try {

    const { nombre } = req.body;

    const [result] = await db.query(
      "INSERT INTO categorias(nombre) VALUES(?)",
      [nombre]
    );

    res.json({
      id: result.insertId,
      nombre
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});

/* ===================================== */
/* 📂 OBTENER SUBCATEGORIAS */
/* ===================================== */

app.get("/subcategorias", async (req, res) => {

  try {

    const sql = `
    
      SELECT 
        subcategorias.*,
        categorias.nombre AS categoria

      FROM subcategorias

      LEFT JOIN categorias
      ON categorias.id = subcategorias.categoria_id
    
    `;

    const [results] = await db.query(sql);

    res.json(results);

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});

/* ===================================== */
/* ➕ CREAR SUBCATEGORIA */
/* ===================================== */

app.post("/subcategorias", async (req, res) => {

  try {

    const {
      nombre,
      categoria_id
    } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO subcategorias
      (nombre, categoria_id)

      VALUES(?, ?)
      `,
      [nombre, categoria_id]
    );

    res.json({
      id: result.insertId,
      nombre
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err);

  }

});



//ELIMINAR CATEGORIA 
app.delete("/categorias/:id", async (req, res) => {

  try {

    await db.query(
      "DELETE FROM categorias WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Categoría eliminada"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});



// ✏️ ACTUALIZAR CATEGORÍA
app.put("/categorias/:id", async (req, res) => {

  try {

    const {
      nombre,
      destacada
    } = req.body;

    // 🔥 SI VIENE NOMBRE
    if (nombre !== undefined) {

      await db.query(
        "UPDATE categorias SET nombre = ? WHERE id = ?",
        [nombre, req.params.id]
      );

    }

    // ⭐ SI VIENE DESTACADA
    if (destacada !== undefined) {

      await db.query(
        "UPDATE categorias SET destacada = ? WHERE id = ?",
        [destacada, req.params.id]
      );

    }

    res.json({
      message: "Categoría actualizada"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});
// ELIMINAR SUBCATEGORIA 

app.delete("/subcategorias/:id", async (req, res) => {

  try {

    await db.query(
      "DELETE FROM subcategorias WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Subcategoría eliminada"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});

// ACTUALIZAR SUBCATEGOREIA 
app.put("/subcategorias/:id", async (req, res) => {

  try {

    await db.query(
      "UPDATE subcategorias SET nombre = ? WHERE id = ?",
      [
        req.body.nombre,
        req.params.id
      ]
    );

    res.json({
      message: "Subcategoría actualizada"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});


app.put("/productos/:id/visible", async (req, res) => {

  const { id } = req.params;
  const { visible } = req.body;

  try {

    await db.query(
      "UPDATE productos SET visible = ? WHERE id = ?",
      [visible, id]
    );

    res.json({ ok: true });

  } catch (err) {

    console.log(err);
    res.status(500).json({ error: "Error" });

  }

});
/* ================================================= */

const axios = require("axios");

app.get("/proxy-image", async (req, res) => {

  try {

    const imageUrl = req.query.url;

    const response = await fetch(imageUrl);

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    res.set(
      "Content-Type",
      response.headers.get("content-type")
    );

    res.send(buffer);

  } catch (error) {

    console.log(error);

    res.status(500).send(
      "Error cargando imagen"
    );

  }

});
;


app.post("/contactos", async (req, res) => {

  try {

    const {
      nombre,
      correo,
      telefono,
      empresa,
      mensaje
    } = req.body;

    await db.query(
      `INSERT INTO contactos
      (nombre, correo, telefono, empresa, mensaje)
      VALUES (?, ?, ?, ?, ?)`,
      [
        nombre,
        correo,
        telefono,
        empresa,
        mensaje
      ]
    );

    res.json({
      success: true,
      mensaje: "Mensaje enviado"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al guardar"
    });

  }

});

app.get("/contactos", async (req, res) => {

  try {

    const [rows] = await db.query(
      "SELECT * FROM contactos ORDER BY id DESC"
    );

    res.json(rows);

  } catch (error) {

    console.log(error);
    res.status(500).json(error);

  }

});

app.delete("/contactos/:id", async (req, res) => {

  try {

    await db.query(
      "DELETE FROM contactos WHERE id = ?",
      [req.params.id]
    );

    res.json({
      mensaje: "Eliminado"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json(err);

  }

});


/* ===================================== */
/* 📂 OBTENER TODOS LOS TIPOS */
/* ===================================== */
app.get("/tipos", async (req, res) => {
  try {
    const sql = `
      SELECT 
        tipos.*,
        subcategorias.nombre AS subcategoria,
        categorias.nombre AS categoria,
        categorias.id AS categoria_id
      FROM tipos
      LEFT JOIN subcategorias ON subcategorias.id = tipos.subcategoria_id
      LEFT JOIN categorias ON categorias.id = subcategorias.categoria_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/* ===================================== */
/* ➕ CREAR TIPO */
/* ===================================== */
app.post("/tipos", async (req, res) => {
  try {
    const { nombre, subcategoria_id } = req.body;
    if (!nombre || !subcategoria_id) {
      return res.status(400).json({ error: "Faltan datos" });
    }
    const [result] = await db.query(
      "INSERT INTO tipos (nombre, subcategoria_id) VALUES (?, ?)",
      [nombre, subcategoria_id]
    );
    res.json({ id: result.insertId, nombre, subcategoria_id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al crear tipo" });
  }
});

/* ===================================== */
/* ✏️ ACTUALIZAR TIPO */
/* ===================================== */
app.put("/tipos/:id", async (req, res) => {
  try {
    const { nombre, subcategoria_id } = req.body;
    const { id } = req.params;
    await db.query(
      "UPDATE tipos SET nombre = ?, subcategoria_id = ? WHERE id = ?",
      [nombre, subcategoria_id, id]
    );
    res.json({ message: "Tipo actualizado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al actualizar tipo" });
  }
});

/* ===================================== */
/* 🗑 ELIMINAR TIPO */
/* ===================================== */
app.delete("/tipos/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM tipos WHERE id = ?", [req.params.id]);
    res.json({ message: "Tipo eliminado" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al eliminar tipo" });
  }
});

app.listen(5000, () => {
  console.log("Servidor en puerto 5000");
});
