import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../services/api";

export default function Comparar() {
  const [comparador, setComparador] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  /* 🌙 DARK MODE */
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Control responsivo dinámico
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // 🔥 CARGAR PRODUCTOS DEL COMPARADOR
  useEffect(() => {
    const guardados = localStorage.getItem("comparador");
    if (guardados) {
      setComparador(JSON.parse(guardados));
    }
  }, []);

  useEffect(() => {
    if (comparador.length <= 1) return;

    const categoriaBase = comparador[0].categoria_id;
    const validos = comparador.filter(
      p => Number(p.categoria_id) === Number(categoriaBase)
    );

    if (validos.length !== comparador.length) {
      setComparador(validos);
      localStorage.setItem("comparador", JSON.stringify(validos));
      alert("Se eliminaron productos de categorías diferentes.");
    }
  }, [comparador]);

  // 🔥 CARGAR PRODUCTOS, CATEGORÍAS Y SUBCATEGORÍAS
  useEffect(() => {
    api.get("/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.log(err));

    api.get("/categorias")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.log(err));

    api.get("/subcategorias")
      .then((res) => setSubcategorias(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ❌ ELIMINAR
  const eliminarProducto = (id) => {
    const nuevos = comparador.filter(p => Number(p.id) !== Number(id));
    setComparador(nuevos);
    localStorage.setItem("comparador", JSON.stringify(nuevos));
  };

  // 🏷 FORMATEAR NOMBRES
  const formatearCampo = (campo) => {
    const nombres = {
      nombre: "Nombre",
      descripcion: "Descripción",
      precio: "Precio",
      precioOferta: "Precio Oferta",
      oferta: "Oferta",
      stock: "Stock",
      imagenes: "Imágenes",
      destacado: "Destacado",
      sku: "SKU",
      ancho: "Ancho",
      alto: "Alto",
      cobertura: "Cobertura",
      tipoVenta: "Tipo Venta",
      tipoCobertura: "Tipo Cobertura",
      especificaciones: "Especificaciones",
      informacionAdicional: "Información Adicional",
      piezasCaja: "Piezas por Caja"
    };
    return nombres[campo] || campo;
  };

  // 🧠 MEJOR PRODUCTO
  const mejorProducto = [...comparador].sort((a, b) => {
    const precioA = Number(a.precioOferta || a.precio);
    const precioB = Number(b.precioOferta || b.precio);
    const scoreA = Number(a.stock || 0) + Number(a.cobertura || 0) + (a.destacado ? 50 : 0) - precioA / 10;
    const scoreB = Number(b.stock || 0) + Number(b.cobertura || 0) + (b.destacado ? 50 : 0) - precioB / 10;
    return scoreB - scoreA;
  })[0];

  // 💲 MÁS BARATO
  const masBarato = [...comparador].sort((a, b) => {
    return Number(a.precioOferta || a.precio) - Number(b.precioOferta || b.precio);
  })[0];

  // 🏆 MAYOR COBERTURA
  const mayorCobertura = [...comparador].sort((a, b) => {
    return Number(b.cobertura || 0) - Number(a.cobertura || 0);
  })[0];

  return (
    <div style={styles.page(darkMode)}>
      {/* 🔥 NAVBAR */}
      <Navbar
        categorias={categorias}
        subcategorias={subcategorias}
        productos={productos}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoritos={comparador}
        esFavorito={(id) => comparador.some(p => p.id === id)}
        toggleFavorito={(producto) => {
          const existe = comparador.some(p => p.id === producto.id);
          let nuevos;
          if (existe) {
            nuevos = comparador.filter(p => p.id !== producto.id);
          } else {
            if (comparador.length > 0) {
              const categoriaActual = comparador[0].categoria_id;
              if (Number(producto.categoria_id) !== Number(categoriaActual)) {
                alert("Solo puedes comparar productos de la misma categoría.");
                return;
              }
            }
            nuevos = [...comparador, producto];
          }
          setComparador(nuevos);
          localStorage.setItem("comparador", JSON.stringify(nuevos));
        }}
      />

      <div style={styles.container}>
        <h1 style={styles.title(darkMode, isMobile)}>
          Comparador de productos
        </h1>

        {/* ⭐ MEJOR OPCIÓN */}
        {mejorProducto && (
          <div style={styles.bestBox(darkMode, isMobile)}>
            <div style={{ flex: 1 }}>
              <h2 style={styles.bestTitle(isMobile)}>
                ⭐ Mejor opción recomendada
              </h2>
              <p style={styles.bestText(darkMode, isMobile)}>
                <strong>
                  {mejorProducto.nombre}{" "}
                  {mejorProducto.descripcion ? `- ${mejorProducto.descripcion.slice(0, 80)}...` : ""}
                </strong>{" "}
                destaca por su relación calidad-precio, cobertura y disponibilidad.
              </p>
            </div>
            <img
              src={mejorProducto.imagenes ? mejorProducto.imagenes.split(",")[0] : ""}
              alt={mejorProducto.nombre}
              style={styles.bestImage(isMobile)}
            />
          </div>
        )}

        {/* 🧠 RECOMENDACIONES */}
        <div style={styles.smartGrid(isMobile)}>
          {masBarato && (
            <div style={styles.smartCard(darkMode)}>
              <h3 style={styles.smartTitle(isMobile)}>💲 Más económico</h3>
              <p style={styles.smartText(darkMode, isMobile)}>{masBarato.nombre}</p>
            </div>
          )}

          {mayorCobertura && (
            <div style={styles.smartCard(darkMode)}>
              <h3 style={styles.smartTitle(isMobile)}>🏆 Mayor cobertura</h3>
              <p style={styles.smartText(darkMode, isMobile)}>{mayorCobertura.nombre}</p>
            </div>
          )}
        </div>

        {comparador.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.empty(darkMode, isMobile)}>
              No hay productos para comparar
            </p>
            <button
              style={styles.addBtn}
              onClick={() => window.location.href = "/productos"}
            >
              ➕ Agregar productos
            </button>
          </div>
        ) : (
          /* CONTENEDOR FLUIDO DE TABLA CON SCROLL LATERAL */
          <div style={styles.tableWrapper}>
            <table style={styles.table(darkMode)}>
              <tbody>
                {Object.keys(comparador[0] || {})
                  .filter((key) => ![
                    "id", "created_at", "updated_at", "visible", 
                    "nuevo", "imagen", "rebaja", "fichaTecnica", "categoria_id", "subcategoria_id"
                  ].includes(key))
                  .filter((campo) => {
                    return comparador.some((p) => {
                      return (
                        p[campo] !== null &&
                        p[campo] !== "" &&
                        p[campo] !== undefined
                      );
                    });
                  })
                  .map((campo) => (
                    <tr key={campo} style={styles.rowBorder(darkMode)}>
                      <td style={styles.label(darkMode, isMobile)}>
                        {formatearCampo(campo)}
                      </td>

                      {comparador.map((p) => (
                        <td
                          key={p.id}
                          style={styles.cell(darkMode, isMobile)}
                        >
                          {/* 🖼 IMAGEN */}
                          {campo === "imagenes" ? (
                            <img
                              src={p.imagenes ? p.imagenes.split(",")[0] : ""}
                              alt={p.nombre}
                              style={styles.image(isMobile)}
                            />
                          )
                          // 💲 PRECIOS
                          : campo === "precio" || campo === "precioOferta" ? (
                            <span style={styles.price(isMobile)}>
                              ${p[campo]}
                            </span>
                          )
                          // 📏 MEDIDAS
                          : campo === "ancho" || campo === "alto" ? (
                            `${p[campo]} cm`
                          )
                          // ✅ BOOLEANOS
                          : campo === "oferta" || campo === "destacado" ? (
                            p[campo] === 1 || p[campo] === true ? "✅ Sí" : "❌ No"
                          )
                          // 📝 TEXTO LARGO
                          : campo === "descripcion" || campo === "especificaciones" || campo === "informacionAdicional" ? (
                            <div style={styles.longText(isMobile)}>
                              {p[campo]}
                            </div>
                          )
                          // ❌ VACÍO
                          : !p[campo] ? (
                            "-"
                          )
                          // ✅ NORMAL
                          : (
                            String(p[campo])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* ❌ FILA ELIMINAR */}
                <tr style={styles.rowBorder(darkMode)}>
                  <td style={styles.label(darkMode, isMobile)}>Acción</td>
                  {comparador.map((p) => (
                    <td key={p.id} style={styles.cell(darkMode, isMobile)}>
                      <button
                        style={styles.removeBtn(isMobile)}
                        onClick={() => eliminarProducto(p.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

const styles = {
  page: (darkMode) => ({
    minHeight: "100vh",
    background: darkMode ? "#0f172a" : "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily: "Arial, sans-serif"
  }),

  container: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    padding: "20px 12px",
    boxSizing: "border-box",
    flexGrow: 1
  },

  title: (darkMode, isMobile) => ({
    color: darkMode ? "#fff" : "#111",
    fontSize: isMobile ? "26px" : "42px",
    fontWeight: "bold",
    marginBottom: "25px",
    textAlign: "center"
  }),

  empty: (darkMode, isMobile) => ({
    color: darkMode ? "#cbd5e1" : "#555",
    textAlign: "center",
    fontSize: isMobile ? "16px" : "20px"
  }),

  tableWrapper: {
    overflowX: "auto",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    WebkitOverflowScrolling: "touch" // Scroll inercial suave en iOS
  },

  table: (darkMode) => ({
    width: "100%",
    borderCollapse: "collapse",
    background: darkMode ? "#1e293b" : "#fff"
  }),

  rowBorder: (darkMode) => ({
    borderBottom: darkMode ? "1px solid #334155" : "1px solid #e2e8f0"
  }),

  label: (darkMode, isMobile) => ({
    background: darkMode ? "#111827" : "#f8fafc",
    padding: isMobile ? "12px" : "18px",
    fontWeight: "bold",
    color: darkMode ? "#fff" : "#111",
    fontSize: isMobile ? "12px" : "14px",
    minWidth: isMobile ? "120px" : "18px",
    position: "sticky",
    left: 0,
    zIndex: 5
  }),

  cell: (darkMode, isMobile) => ({
    padding: isMobile ? "14px" : "20px",
    textAlign: "center",
    color: darkMode ? "#fff" : "#111",
    fontSize: isMobile ? "13px" : "15px",
    minWidth: isMobile ? "180px" : "240px"
  }),

  image: (isMobile) => ({
    width: isMobile ? "120px" : "160px",
    height: isMobile ? "120px" : "160px",
    objectFit: "cover",
    borderRadius: "12px"
  }),

  longText: (isMobile) => ({
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
    fontSize: isMobile ? "12px" : "13px",
    minWidth: isMobile ? "160px" : "220px",
    maxWidth: isMobile ? "160px" : "220px",
    wordBreak: "break-word",
    textAlign: "left",
    margin: "0 auto"
  }),

  price: (isMobile) => ({
    fontSize: isMobile ? "18px" : "22px",
    fontWeight: "bold",
    color: "#16a34a"
  }),

  removeBtn: (isMobile) => ({
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: isMobile ? "8px 14px" : "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: isMobile ? "12px" : "14px"
  }),

  bestBox: (darkMode, isMobile) => ({
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: "18px",
    padding: isMobile ? "16px" : "24px",
    marginBottom: "25px",
    display: "flex",
    // En mobile se ordena verticalmente (column), en desktop en fila (row)
    flexDirection: isMobile ? "column-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: isMobile ? "16px" : "24px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
  }),

  bestTitle: (isMobile) => ({
    fontSize: isMobile ? "18px" : "24px",
    margin: "0 0 10px 0",
    color: "#f59e0b",
    fontWeight: "bold"
  }),

  bestText: (darkMode, isMobile) => ({
    fontSize: isMobile ? "13px" : "15px",
    lineHeight: 1.6,
    margin: 0,
    color: darkMode ? "#e2e8f0" : "#475569"
  }),

  bestImage: (isMobile) => ({
    width: isMobile ? "110px" : "140px",
    height: isMobile ? "110px" : "140px",
    objectFit: "cover",
    borderRadius: "14px"
  }),

  smartGrid: (isMobile) => ({
    display: "grid",
    // 2 Columnas en desktop / tablet, 1 columna total en mobile vertical
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "30px"
  }),

  smartCard: (darkMode) => ({
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
  }),

  smartTitle: (isMobile) => ({
    fontSize: isMobile ? "16px" : "18px",
    margin: "0 0 6px 0",
    color: "#f59e0b",
    fontWeight: "bold"
  }),

  smartText: (darkMode, isMobile) => ({
    fontSize: isMobile ? "13px" : "14px",
    margin: 0,
    color: darkMode ? "#e2e8f0" : "#334155"
  }),

  emptyBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    marginTop: "40px"
  },

  addBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer"
  }
};