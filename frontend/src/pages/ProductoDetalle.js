import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [indice, setIndice] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [relacionados, setRelacionados] = useState([]);
  const [sugeridos, setSugeridos] = useState([]);
  const [imagenGuiaZoom, setImagenGuiaZoom] = useState(null);
  const [perimetro, setPerimetro] = useState("");

  // ❤️ FAVORITOS
  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem("favoritos");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [cliente, setCliente] = useState({
    nombre: "",
    correo: "",
    celular: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensajeEnviado, setMensajeEnviado] = useState("");

  //FICHA TECNICA
  const [fichaZoom, setFichaZoom] = useState(false);

  // 🟢 COTIZADOR
  const [mostrarCotizador, setMostrarCotizador] = useState(false);

  const [medidas, setMedidas] = useState([
    {
      largo: "",
      ancho: "",
    },
  ]);

  const [desperdicio, setDesperdicio] = useState(0);

  const cotizadorRef = useRef();
  const imagenPDFRef = useRef();

  const [productos, setProductos] = useState([]);

  // 🔥 CARGAR PRODUCTOS PARA EL NAVBAR
  useEffect(() => {
    api
      .get("/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.log(err));
  }, []);

  const agregarMedida = () => {
    if (medidas.length >= 5) return;

    setMedidas([
      ...medidas,
      {
        largo: "",
        ancho: "",
      },
    ]);
  };

  const eliminarMedida = (index) => {
    if (medidas.length === 1) return;

    setMedidas(medidas.filter((_, i) => i !== index));
  };

  const actualizarMedida = (index, campo, valor) => {
    const nuevas = [...medidas];

    nuevas[index][campo] = valor;

    setMedidas(nuevas);
  };

  const limpiarCampos = () => {
    setMedidas([
      {
        largo: "",
        ancho: "",
      },
    ]);
  };

  const [modoCotizacion, setModoCotizacion] = useState("todas");

  const [areaSeleccionada, setAreaSeleccionada] = useState(0);

  // 📂 CATEGORÍAS REALES
  const categorias = [
    ...new Map(
      productos
        .filter((p) => p.categoria && p.categoria_id)
        .map((p) => [
          p.categoria_id,
          {
            id: p.categoria_id,
            nombre: p.categoria,
          },
        ])
    ).values(),
  ];

  // 📁 SUBCATEGORÍAS REALES
  const subcategorias = [
    ...new Map(
      productos
        .filter((p) => p.subcategoria && p.categoria_id)
        .map((p) => [
          `${p.subcategoria}-${p.categoria_id}`,
          {
            id: `${p.subcategoria}-${p.categoria_id}`,
            nombre: p.subcategoria,
            categoria_id: p.categoria_id,
          },
        ])
    ).values(),
  ];

  // 💾 GUARDAR FAVORITOS
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  // 🟢 CARGAR PRODUCTO
  useEffect(() => {
    api.get(`/productos/${id}`).then((res) => {
      setProducto(res.data);
      setIndice(0);
    });
  }, [id]);

  useEffect(() => {
    if (!producto) return;

    api
      .get("/productos")
      .then((res) => {
        let idsSugeridos = [];

        try {
          idsSugeridos = producto.sugerencias ? JSON.parse(producto.sugerencias) : [];
        } catch {
          idsSugeridos = [];
        }

        const filtrados = res.data.filter(
          (p) =>
            p.categoria === producto.categoria &&
            p.id !== producto.id &&
            !idsSugeridos.includes(String(p.id))
        );

        setRelacionados(filtrados);
      })
      .catch((err) => console.log(err));
  }, [producto]);

  useEffect(() => {
    if (!producto) return;

    api
      .get("/productos")
      .then((res) => {
        let idsSugeridos = [];

        try {
          idsSugeridos = producto.sugerencias ? JSON.parse(producto.sugerencias) : [];
        } catch {
          idsSugeridos = [];
        }

        const lista = res.data.filter((p) => idsSugeridos.includes(String(p.id)));

        setSugeridos(lista);
      })
      .catch((err) => console.log(err));
  }, [producto]);

  // 🔵 PRODUCTOS RELACIONADOS
  useEffect(() => {
    if (!producto) return;

    api
      .get("/productos")
      .then((res) => {
        const filtrados = res.data.filter(
          (p) => p.categoria === producto.categoria && p.id !== producto.id
        );

        setRelacionados(filtrados);
      });
  }, [producto]);

  // 🟡 IMÁGENES
  const imagenes = producto?.imagenes
    ? producto.imagenes.split(",")
    : producto?.imagen
    ? [producto.imagen]
    : [];

  // 🔥 ZOOM
  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPos({ x, y });
  };

  // ❤️ FAVORITOS
  const toggleFavorito = (producto) => {
    const existe = favoritos.find((fav) => fav.id === producto.id);

    if (existe) {
      setFavoritos(favoritos.filter((f) => f.id !== producto.id));
    } else {
      setFavoritos([...favoritos, producto]);
    }
  };

  const esFavorito = (id) => {
    return favoritos.some((f) => f.id === id);
  };

  // 🖼 IMAGEN
  const obtenerImagen = (producto) => {
    if (producto.imagenes && producto.imagenes.trim() !== "") {
      return producto.imagenes.split(",")[0];
    }

    return producto.imagen;
  };

  const convertirImagenBase64 = async (url) => {
    try {
      const proxyUrl = `http://localhost:5000/proxy-image?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      return await new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const obtenerDetalleMedidas = () => {
    return medidas.map((item, index) => {
      if (producto?.tipoVenta === "unidad") {
        return {
          numero: index + 1,
          cantidad: Number(item.cantidad) || 0,
        };
      }

      if (producto?.tipoVenta === "tramo") {
        return {
          numero: index + 1,
          perimetro: Number(item.perimetro) || 0,
        };
      }

      const largo = Number(item.largo) || 0;
      const ancho = Number(item.ancho) || 0;

      return {
        numero: index + 1,
        largo,
        ancho,
        area: largo * ancho,
      };
    });
  };

  const generarPDF = async () => {
    try {
      setEnviando(true);

      const pdf = new jsPDF("p", "mm", "a4");

      const membrete1 = await convertirImagenBase64(
        window.location.origin + "/membreteuno.jpg"
      );

      const membrete2 = await convertirImagenBase64(
        window.location.origin + "/membretedos.jpg"
      );

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const ponerFondo = (pdf, img) => {
        if (!img) return;
        pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);
      };

      // =========================
      // 🔥 PRIMERA PÁGINA
      // =========================
      ponerFondo(pdf, membrete1);

      let y = 50;

      const numeroCotizacion = Math.floor(100000 + Math.random() * 900000);

      const fechaActual = new Date().toLocaleDateString("es-MX");

      pdf.setFontSize(10);
      pdf.setTextColor(80);

      pdf.text(`Fecha: ${fechaActual}`, pageWidth - 60, 35);
      pdf.text(`Cotización #${numeroCotizacion}`, pageWidth - 60, 42);

      pdf.setDrawColor(200);
      pdf.line(15, 55, pageWidth - 15, 55);

      y = 70;

      const imagenBase64 = await convertirImagenBase64(imagenes[indice]);

      if (imagenBase64) {
        pdf.addImage(imagenBase64, "JPEG", 15, y, 60, 60);
      }

      pdf.setFontSize(14);
      pdf.setTextColor(40);

      pdf.text(`Producto: ${producto.nombre}`, 85, y + 10);
      pdf.text(`Categoría: ${producto.categoria || "-"}`, 85, y + 20);
      pdf.text(`Subcategoría: ${producto.subcategoria || "-"}`, 85, y + 30);
      pdf.text(`SKU: ${producto.sku || "-"}`, 85, y + 40);

      pdf.setFontSize(20);
      pdf.setTextColor(22, 163, 74);
      pdf.text(`Total: $${total}`, 85, y + 55);

      y += 90;

      pdf.setFontSize(18);
      pdf.setTextColor(0);
      pdf.text("Resumen de Cotización", 15, y);

      y += 10;

      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(15, y, pageWidth - 30, 45, 3, 3, "F");

      pdf.setFontSize(11);
      pdf.setTextColor(60);

      pdf.text(
        `Modo de cotización: ${
          modoCotizacion === "todas" ? "Todas las áreas" : "Área seleccionada"
        }`,
        20,
        y + 8
      );

      pdf.text(`Área total: ${areaIngresada.toFixed(2)} m²`, 20, y + 18);

      pdf.text(`Desperdicio: ${desperdicio}%`, 20, y + 28);

      pdf.text(`Área final: ${areaConDesperdicio.toFixed(2)} m²`, 20, y + 38);

      y += 60;

      pdf.setFontSize(14);
      pdf.setTextColor(30);
      pdf.text("Detalle de Medidas", 15, y);

      y += 10;

      const detalleMedidas = obtenerDetalleMedidas();

      detalleMedidas.forEach((item) => {
        pdf.setFontSize(11);

        if (producto.tipoVenta === "unidad") {
          pdf.text(`Cantidad ${item.numero}: ${item.cantidad}`, 20, y);
        } else if (producto.tipoVenta === "tramo") {
          pdf.text(`Perímetro ${item.numero}: ${item.perimetro} m`, 20, y);
        } else {
          pdf.text(
            `Área ${item.numero}: ${item.largo} x ${item.ancho} = ${item.area.toFixed(
              2
            )} m²`,
            20,
            y
          );
        }

        y += 8;
      });

      let notaProducto = "";

      if (producto.tipoVenta === "rollo") {
        notaProducto =
          `Este producto se vende por rollo. ` +
          `Cada rollo mide ${formatMeters(producto.ancho)} m x ${formatMeters(
            producto.alto
          )} m y cubre ${coberturaPorUnidad.toFixed(2)} m². ` +
          `Para cubrir ${areaConDesperdicio.toFixed(
            2
          )} m² necesitas aproximadamente ${metrosLineales.toFixed(
            2
          )} metros lineales.`;
      } else if (producto.tipoVenta === "caja") {
        notaProducto =
          `Este producto se vende por caja. ` +
          `Cada caja contiene ${producto.piezasCaja} piezas y cubre ${coberturaPorUnidad.toFixed(
            2
          )} m². ` +
          `Para cubrir ${areaConDesperdicio.toFixed(
            2
          )} m² necesitas aproximadamente ${cantidadNecesaria} cajas.`;
      } else if (producto.tipoVenta === "pieza") {
        notaProducto =
          `Cada pieza cubre ${coberturaPorUnidad.toFixed(2)} m². ` +
          `Para cubrir ${areaConDesperdicio.toFixed(
            2
          )} m² necesitas aproximadamente ${cantidadNecesaria} piezas.`;
      } else if (producto.tipoVenta === "unidad") {
        notaProducto =
          `Se requieren aproximadamente ${cantidadNecesaria} unidades para este proyecto.`;
      } else if (producto.tipoVenta === "tramo") {
        notaProducto =
          `Para cubrir ${cantidadNecesaria.toFixed(
            2
          )} metros necesitas aproximadamente ${cantidadNecesaria.toFixed(
            2
          )} metros lineales.`;
      }

      const lineasNota = pdf.splitTextToSize(notaProducto, pageWidth - 45);

      const altoNota = lineasNota.length * 5 + 12;

      if (y + altoNota > pageHeight - 50) {
        pdf.addPage();
        ponerFondo(pdf, membrete2);
        y = 50;
      }

      pdf.setFillColor(255, 248, 200);

      pdf.roundedRect(15, y, pageWidth - 30, altoNota, 3, 3, "F");

      pdf.setFontSize(10);
      pdf.setTextColor(90);

      pdf.text(lineasNota, 20, y + 8);

      y += altoNota + 15;

      if (y > pageHeight - 90) {
        pdf.addPage();

        y = 20;
        if (membrete2) {
          ponerFondo(pdf, membrete2);
        }
      }

      pdf.setFontSize(14);

      pdf.setTextColor(30);

      pdf.text("Condiciones Comerciales", 15, y);

      y += 10;

      const condiciones = [
        "• Precios sujetos a cambios sin previo aviso.",
        "• Vigencia de la cotización: 15 días.",
        "• Material sujeto a disponibilidad.",
        "• No incluye instalación ni envío salvo indicación expresa.",
      ];

      pdf.setFontSize(10);

      pdf.setTextColor(90);

      condiciones.forEach((item) => {
        pdf.text(item, 20, y);

        y += 7;
      });

      y += 10;

      if (y > pageHeight - 80) {
        pdf.addPage();
        ponerFondo(pdf, membrete2);
        y = 50;
      }

      pdf.setFillColor(22, 163, 74);
      pdf.roundedRect(15, y, pageWidth - 30, 18, 3, 3, "F");

      pdf.setTextColor(255);
      pdf.setFontSize(18);

      pdf.text(`TOTAL ESTIMADO: $${total}`, 20, y + 12);

      y += 30;

      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text("Datos del Cliente", 15, y);

      y += 12;

      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, y, pageWidth - 30, 28, 3, 3, "F");

      pdf.setFontSize(11);
      pdf.setTextColor(0);

      pdf.text(`Nombre: ${cliente.nombre || "-"}`, 20, y + 8);
      pdf.text(`Correo: ${cliente.correo || "-"}`, 20, y + 16);
      pdf.text(`Celular: ${cliente.celular || "-"}`, 20, y + 24);

      y += 40;

      const pdfBase64 = pdf.output("datauristring");

      await api.post("/enviar-cotizacion", {
        nombre: cliente.nombre,
        correo: cliente.correo,
        celular: cliente.celular,
        producto: producto.nombre,
        total,
        pdf: pdfBase64,
      });

      setMensajeEnviado("La cotización fue enviada a tu correo");
    } catch (error) {
      console.log(error);
      alert("Error generando cotización");
    } finally {
      setEnviando(false);
    }
  };

  const cmToM = (cm) => {
    const metros = Number(cm) / 100;
    return metros;
  };

  const formatMeters = (cm) => {
    return (Number(cm) / 100).toFixed(2);
  };

  const areaIngresada =
    modoCotizacion === "todas"
      ? medidas.reduce((total, item) => {
          const largo = Number(item.largo) || 0;
          const ancho = Number(item.ancho) || 0;

          return total + largo * ancho;
        }, 0)
      : (Number(medidas[areaSeleccionada]?.largo) || 0) *
        (Number(medidas[areaSeleccionada]?.ancho) || 0);

  const areaConDesperdicio = areaIngresada * (1 + Number(desperdicio) / 100);

  const ancho = Number(producto?.ancho) || 0;

  const alto = Number(producto?.alto) || 0;

  const anchoM = (Number(producto?.ancho) || 0) / 100;
  const altoM = (Number(producto?.alto) || 0) / 100;

  const coberturaPorPieza = anchoM * altoM;

  const piezasCaja = Number(producto?.piezasCaja) || 1;

  const coberturaPorUnidad =
    producto?.tipoVenta === "caja" ? coberturaPorPieza * piezasCaja : coberturaPorPieza;

  let metrosLineales = 0;
  let equivalenciaRollos = 0;

  let equivalenciaMostrar = equivalenciaRollos;

  let cantidadNecesaria = 0;

  if (producto?.tipoVenta === "unidad") {
    cantidadNecesaria = medidas.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);
  } else if (producto?.tipoVenta === "tramo") {
    metrosLineales = medidas.reduce((total, item) => total + (Number(item.perimetro) || 0), 0);

    cantidadNecesaria = metrosLineales;
  } else if (producto?.tipoVenta === "rollo") {
    const anchoMaterial = Math.min(anchoM, altoM);

    const largoMaterial = Math.max(anchoM, altoM);

    metrosLineales = anchoMaterial > 0 ? areaConDesperdicio / anchoMaterial : 0;

    equivalenciaRollos = largoMaterial > 0 ? metrosLineales / largoMaterial : 0;

    cantidadNecesaria = metrosLineales;
  } else {
    cantidadNecesaria =
      coberturaPorUnidad > 0 ? Math.ceil(areaConDesperdicio / coberturaPorUnidad) : 0;
  }

  const precioFinal = Number(producto?.oferta ? producto?.precioOferta : producto?.precio) || 0;

  let total = 0;

  if (producto?.tipoVenta === "rollo") {
    total = areaConDesperdicio * precioFinal;
  } else if (producto?.tipoVenta === "tramo" || producto?.tipoVenta === "unidad") {
    total = cantidadNecesaria * precioFinal;
  } else {
    total = cantidadNecesaria * precioFinal;
  }

  total = total.toFixed(2);

  if (!producto) return <h2 style={{ padding: "20px" }}>Cargando...</h2>;

  const getStockLabel = (stock, tipo) => {
    if (stock <= 0) return `Agotado`;

    return `En stock`;
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return "#dc2626";
    if (stock <= 3) return "#f59e0b";
    return "#16a34a";
  };

  const plural = (stock, tipo) => {
    if (stock === 1) return tipo;

    if (tipo === "unidad") return "unidades";
    if (tipo === "pieza") return "piezas";
    if (tipo === "tramo") return "tramos";
    if (tipo === "caja") return "cajas";

    return tipo + "s";
  };

  return (
    <div className="producto-detalle-page">
      <Navbar
        productos={productos}
        categorias={categorias}
        subcategorias={subcategorias}
        favoritos={favoritos}
        toggleFavorito={toggleFavorito}
        esFavorito={esFavorito}
      />

      <div className="producto-detalle-container">
        {/* GALERÍA (columna izquierda) */}
        <div className="producto-detalle-gallery">
          <div className="badges-container">
            {(producto.rebaja === 1 || producto.rebaja === true) && (
              <span className="badge rebaja">🔥 REBAJA</span>
            )}

            {(producto.destacado === 1 || producto.destacado === true) && (
              <span className="badge destacado">⭐ DESTACADO</span>
            )}
          </div>

          <button
            className="fav-btn"
            onClick={() => toggleFavorito(producto)}
            style={{
              background: esFavorito(producto.id) ? "#dc2626" : "#fff",
              color: esFavorito(producto.id) ? "#fff" : "#111",
            }}
          >
            ❤️
          </button>

          <div
            className="main-image-container"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <img
              ref={imagenPDFRef}
              src={imagenes[indice]}
              alt={producto.nombre}
              className="main-image"
              style={{
                transform: zoom ? "scale(2)" : "scale(1)",
                transformOrigin: `${pos.x}% ${pos.y}%`,
                transition: "transform 0.1s",
              }}
            />
          </div>

          <div className="thumbs-container">
            {imagenes.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`miniatura-${i}`}
                className="thumb"
                onClick={() => setIndice(i)}
                style={{
                  border: i === indice ? "2px solid #111" : "1px solid #ddd",
                }}
              />
            ))}
          </div>

          {/* FICHA TÉCNICA (si existe) */}
          {producto.fichaTecnica && (
            <div className="box">
              <h3 className="box-title">Ficha técnica</h3>
              <img
                src={producto.fichaTecnica}
                alt="Ficha técnica"
                className="ficha-img"
                onClick={() => setFichaZoom(true)}
              />
            </div>
          )}
        </div>

        {/* INFORMACIÓN (columna derecha) */}
        <div className="producto-detalle-info">
          <h1 className="product-title">{producto.nombre}</h1>

          <div className="category-box">
            {producto.categoria && (
              <span className="category-tag">Categoría: {producto.categoria}</span>
            )}

            {producto.subcategoria && (
              <span className="subcategory-tag">Subcategoría: {producto.subcategoria}</span>
            )}
          </div>

          {producto.oferta === 1 || producto.oferta === true ? (
            <div>
              <span className="precio-anterior">${producto.precio}</span>
              <h2 className="precio-oferta">${producto.precioOferta}</h2>
            </div>
          ) : (
            <h2 className="precio-normal">${producto.precio}</h2>
          )}

          {producto.sku && (
            <p className="data-item">
              <strong>SKU:</strong> {producto.sku}
            </p>
          )}

          <div className="data-box">
            {producto.tipoVenta && (
              <p className="data-item">
                <strong>Venta por:</strong> {producto.tipoVenta}
              </p>
            )}

            {producto.presentacion ? (
              <p className="data-item">
                <strong>Presentación:</strong> {producto.presentacion}
              </p>
            ) : (
              (producto.ancho || producto.alto) && (
                <p className="data-item">
                  <strong>Medidas:</strong>{" "}
                  {producto.ancho ? `${(Number(producto.ancho) / 100).toFixed(2)} m` : "-"} x{" "}
                  {producto.alto ? `${(Number(producto.alto) / 100).toFixed(2)} m` : "-"}
                </p>
              )
            )}

            {producto.grueso && (
              <p className="data-item">
                <strong>Grosor:</strong> {producto.grueso} mm
              </p>
            )}

            {producto.tipoVenta === "caja" && (
              <p className="data-item">
                <strong>Piezas por caja:</strong> {producto.piezasCaja}
              </p>
            )}

            {coberturaPorUnidad > 0 && producto.tipoVenta === "caja" && (
              <p className="data-item">
                <strong>Cobertura por caja:</strong> {coberturaPorUnidad.toFixed(2)} m²
              </p>
            )}

            {producto.tipoVenta === "caja" && (
              <div className="caja-info">
                📦 Caja con <strong>{producto.piezasCaja}</strong> piezas
              </div>
            )}
          </div>

          <div
            className="stock-box"
            style={{ borderColor: getStockColor(producto.stock) }}
          >
            <span
              className="stock-dot"
              style={{ background: getStockColor(producto.stock) }}
            />
            <div>
              <p className="stock-title" style={{ color: getStockColor(producto.stock) }}>
                {producto.stock <= 3 && producto.stock > 0
                  ? `Solo quedan ${producto.stock} ${plural(producto.stock, producto.tipoVenta)}`
                  : producto.stock <= 0
                  ? "Agotado"
                  : "Stock disponible"}
              </p>
              <p className="stock-sub">
                {producto.stock} {plural(producto.stock, producto.tipoVenta)}
              </p>
            </div>
          </div>

          <div className="box">
            <h3 className="box-title">Descripción</h3>
            <p className="description">{producto.descripcion}</p>
          </div>

          {producto.especificaciones && (
            <div className="box">
              <h3 className="box-title">Especificaciones</h3>
              <p className="description" style={{ whiteSpace: "pre-wrap" }}>
                {producto.especificaciones}
              </p>
            </div>
          )}

          {producto.informacionAdicional && (
            <div className="box">
              <h3 className="box-title">Información adicional</h3>
              <p className="description" style={{ whiteSpace: "pre-wrap" }}>
                {producto.informacionAdicional}
              </p>
            </div>
          )}

          <button className="btn-cotizador" onClick={() => setMostrarCotizador(!mostrarCotizador)}>
            🧮 Cotizador
          </button>

          <button
            className="btn-agregar-cotizador"
            onClick={() => {
              const guardados = JSON.parse(localStorage.getItem("cotizador")) || [];
              const existe = guardados.find((p) => p.id === producto.id);
              if (!existe) {
                guardados.push(producto);
                localStorage.setItem("cotizador", JSON.stringify(guardados));
              }
            }}
          >
            ➕ Agregar al cotizador
          </button>

          {mostrarCotizador && (
            <div className="cotizador-box">
              {producto.tipoVenta !== "unidad" && producto.tipoVenta !== "tramo" && (
                <div className="guia-medicion">
                  <h3 className="guia-titulo">📏 ¿Cómo calcular los m²?</h3>
                  <div className="guia-grid">
                    <div className="guia-card">
                      <img
                        src="/areasplanas.png"
                        alt="Cómo medir piso"
                        className="guia-img"
                        onClick={() => setImagenGuiaZoom("/areasplanas.png")}
                      />
                      <h4>Áreas planas (Pisos)</h4>
                      <p>Da clic en la imagen para ampliar.</p>
                    </div>
                    <div className="guia-card">
                      <img
                        src="/paredes.png"
                        alt="Cómo medir muro"
                        className="guia-img"
                        onClick={() => setImagenGuiaZoom("/paredes.png")}
                      />
                      <h4>Muros (Paredes)</h4>
                      <p>Da clic en la imagen para ampliar.</p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="cotizador-title">Calcula cuánto necesitas</h3>

              {producto.tipoVenta !== "unidad" && producto.tipoVenta !== "tramo" && (
                <div className="selector-modo">
                  <label>
                    <input
                      type="radio"
                      checked={modoCotizacion === "todas"}
                      onChange={() => setModoCotizacion("todas")}
                    />
                    Cotizar todas las áreas
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={modoCotizacion === "una"}
                      onChange={() => setModoCotizacion("una")}
                    />
                    Cotizar una sola área
                  </label>
                  <div className="resumen-area">
                    {modoCotizacion === "todas"
                      ? `📐 Área total: ${areaIngresada.toFixed(2)} m²`
                      : `📐 Área seleccionada: ${areaIngresada.toFixed(2)} m²`}
                  </div>
                </div>
              )}

              <div className="medidas-container">
                {medidas.map((item, index) => (
                  <div key={index} className="medida-card">
                    <h4>
                      {producto.tipoVenta === "unidad"
                        ? `Unidad ${index + 1}`
                        : producto.tipoVenta === "tramo"
                        ? `Perímetro ${index + 1}`
                        : `Área ${index + 1}`}
                    </h4>

                    {modoCotizacion === "una" && producto.tipoVenta !== "unidad" && (
                      <label className="radio-label">
                        <input
                          type="radio"
                          checked={areaSeleccionada === index}
                          onChange={() => setAreaSeleccionada(index)}
                        />
                        Utilizar esta área
                      </label>
                    )}

                    {producto.tipoVenta === "unidad" ? (
                      <input
                        type="number"
                        placeholder="Cantidad de unidades"
                        value={item.cantidad || ""}
                        onChange={(e) =>
                          actualizarMedida(index, "cantidad", e.target.value)
                        }
                        className="input-field"
                      />
                    ) : producto.tipoVenta === "tramo" ? (
                      <input
                        type="number"
                        placeholder="Perímetro en metros"
                        value={item.perimetro || ""}
                        onChange={(e) =>
                          actualizarMedida(index, "perimetro", e.target.value)
                        }
                        className="input-field"
                      />
                    ) : (
                      <div className="medidas-grid">
                        <input
                          type="number"
                          placeholder="Largo (m)"
                          value={item.largo}
                          onChange={(e) =>
                            actualizarMedida(index, "largo", e.target.value)
                          }
                          className="input-field"
                        />
                        <input
                          type="number"
                          placeholder="Ancho (m)"
                          value={item.ancho}
                          onChange={(e) =>
                            actualizarMedida(index, "ancho", e.target.value)
                          }
                          className="input-field"
                        />
                      </div>
                    )}

                    <p className="resultado-medida">
                      {producto.tipoVenta === "unidad" ? (
                        <>Cantidad: {Number(item.cantidad || 0)}</>
                      ) : producto.tipoVenta === "tramo" ? (
                        <>Perímetro: {Number(item.perimetro || 0)} m</>
                      ) : (
                        <>
                          Área:{" "}
                          {(
                            (Number(item.largo) || 0) * (Number(item.ancho) || 0)
                          ).toFixed(2)}{" "}
                          m²
                        </>
                      )}
                    </p>

                    {producto.tipoVenta !== "unidad" && medidas.length > 1 && (
                      <button
                        className="btn-eliminar"
                        onClick={() => eliminarMedida(index)}
                      >
                        {producto.tipoVenta === "tramo"
                          ? "🗑 Eliminar perímetro"
                          : "🗑 Eliminar medida"}
                      </button>
                    )}
                  </div>
                ))}

                {producto.tipoVenta !== "unidad" && (
                  <div className="botones-medidas">
                    {medidas.length < 5 && (
                      <button className="btn-agregar" onClick={agregarMedida}>
                        {producto.tipoVenta === "unidad"
                          ? "➕ Agregar unidad"
                          : producto.tipoVenta === "tramo"
                          ? "➕ Agregar perímetro"
                          : "➕ Agregar medida"}
                      </button>
                    )}
                    <button className="btn-limpiar" onClick={limpiarCampos}>
                      🧹 Limpiar campos
                    </button>
                  </div>
                )}
              </div>

              {producto.tipoVenta !== "unidad" && producto.tipoVenta !== "tramo" && (
                <div className="desperdicio-box">
                  {[0, 10, 15, 20].map((p) => (
                    <button
                      key={p}
                      className={`des-btn ${desperdicio === p ? "active" : ""}`}
                      onClick={() => setDesperdicio(p)}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              )}

              {(producto.tipoVenta === "unidad" ||
                producto.tipoVenta === "tramo" ||
                areaIngresada > 0) && (
                <div className="resultado-cotizacion" ref={cotizadorRef}>
                  {producto.tipoVenta === "tramo" ? (
                    <p>
                      <strong>Perímetro total:</strong> {metrosLineales.toFixed(2)} m
                    </p>
                  ) : producto.tipoVenta !== "unidad" ? (
                    <>
                      <p>
                        <strong>Área ingresada:</strong> {areaIngresada.toFixed(2)} m²
                      </p>
                      <p>
                        <strong>Área con desperdicio:</strong>{" "}
                        {areaConDesperdicio.toFixed(2)} m²
                      </p>
                    </>
                  ) : null}

                  <p>
                    <strong>Necesitas:</strong>{" "}
                    {producto.tipoVenta === "unidad" ? (
                      <>
                        <strong>{cantidadNecesaria}</strong> unidades
                      </>
                    ) : producto.tipoVenta === "tramo" || producto.tipoVenta === "rollo" ? (
                      <>
                        <strong>{metrosLineales.toFixed(2)}</strong> metros lineales
                      </>
                    ) : (
                      <>
                        <strong>{cantidadNecesaria}</strong> {producto.tipoVenta}s
                      </>
                    )}
                  </p>

                  <p className="total-estimado">Total estimado: ${total.toLocaleString()}</p>

                  <div className="nota-producto">
                    ℹ️ Este producto se vende por <strong>{producto.tipoVenta}</strong>.
                    {producto.tipoVenta === "caja" && (
                      <>
                        {" "}
                        Cada caja contiene{" "}
                        <strong>{producto.piezasCaja} piezas</strong> y cubre{" "}
                        <strong>{coberturaPorUnidad.toFixed(2)} m²</strong>.
                        <br />
                        <br />
                        Para cubrir{" "}
                        <strong>{areaConDesperdicio.toFixed(2)} m²</strong> necesitas
                        aproximadamente <strong>{cantidadNecesaria} cajas</strong>.
                      </>
                    )}
                    {producto.tipoVenta === "pieza" && (
                      <>
                        {" "}
                        Cada pieza cubre{" "}
                        <strong>{coberturaPorUnidad.toFixed(2)} m²</strong>.
                        <br />
                        <br />
                        Para cubrir{" "}
                        <strong>{areaConDesperdicio.toFixed(2)} m²</strong> necesitas
                        aproximadamente <strong>{cantidadNecesaria} piezas</strong>.
                      </>
                    )}
                    {producto.tipoVenta === "rollo" && (
                      <>
                        {" "}
                        Cada rollo mide {(Number(producto.ancho) / 100).toFixed(2)} m x{" "}
                        {(Number(producto.alto) / 100).toFixed(2)} m y cubre{" "}
                        <strong>{coberturaPorUnidad.toFixed(2)} m²</strong>.
                        <br />
                        <br />
                        Para cubrir{" "}
                        <strong>{areaConDesperdicio.toFixed(2)} m²</strong> necesitas
                        aproximadamente{" "}
                        <strong>{metrosLineales.toFixed(2)} metros lineales</strong>.
                      </>
                    )}
                    {producto.tipoVenta === "tramo" && (
                      <>
                        {" "}
                        La cotización se realiza con base en la suma de los perímetros
                        capturados.
                        <br />
                        <br />
                        <strong>Perímetro total:</strong> {metrosLineales.toFixed(2)} m
                        <br />
                        <strong>Material requerido:</strong> {metrosLineales.toFixed(2)} metros
                        lineales.
                      </>
                    )}
                    {producto.tipoVenta === "unidad" && (
                      <>
                        {" "}
                        La cotización se realiza con base en la cantidad de unidades
                        capturadas.
                        <br />
                        <br />
                        <strong>Cantidad requerida:</strong> {cantidadNecesaria} unidades.
                      </>
                    )}
                  </div>

                  <div className="form-cliente">
                    <h3>Solicitar cotización</h3>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={cliente.nombre}
                      onChange={(e) =>
                        setCliente({ ...cliente, nombre: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      type="email"
                      placeholder="Correo"
                      value={cliente.correo}
                      onChange={(e) =>
                        setCliente({ ...cliente, correo: e.target.value })
                      }
                      className="input-field"
                    />
                    <input
                      type="text"
                      placeholder="Celular"
                      value={cliente.celular}
                      onChange={(e) =>
                        setCliente({ ...cliente, celular: e.target.value })
                      }
                      className="input-field"
                    />
                    <button
                      className="btn-enviar"
                      onClick={generarPDF}
                      disabled={enviando}
                    >
                      {enviando ? "Enviando..." : "Solicitar cotización"}
                    </button>
                    {mensajeEnviado && (
                      <p className="mensaje-exito">{mensajeEnviado}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* FIN producto-detalle-info */}

        {/* MODALES ZOOM */}
        {fichaZoom && (
          <div className="modal-overlay" onClick={() => setFichaZoom(false)}>
            <img src={producto.fichaTecnica} alt="Ficha técnica ampliada" className="modal-image" />
          </div>
        )}
        {imagenGuiaZoom && (
          <div className="modal-overlay" onClick={() => setImagenGuiaZoom(null)}>
            <img src={imagenGuiaZoom} alt="Imagen ampliada" className="modal-image" />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🟢 SECCIÓN DE PRODUCTOS RECOMENDADOS Y RELACIONADOS (FUERA DEL CONTAINER) */}
      {/* ======================================================== */}
      <div className="full-width-related-wrapper">
        {sugeridos.length > 0 && (
          <div className="full-width-related-section">
            <div className="sugeridos-banner">
              <div>
                <span className="sugeridos-label">PRODUCTOS RECOMENDADOS</span>
                <h2 className="sugeridos-title">
                  Para instalar este producto también necesitarás
                </h2>
                <p className="sugeridos-subtitle">
                  Estos complementos son utilizados frecuentemente junto con
                  <strong> {producto.nombre}</strong>
                </p>
              </div>
            </div>

            <div className="related-grid full-width-grid">
              {sugeridos.map((p) => (
                <div
                  key={p.id}
                  className="sugerido-card"
                  onClick={() => navigate(`/producto/${p.id}`)}
                >
                  <div className="sugerido-badge">Recomendado</div>
                  <button
                    className="fav-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(p);
                    }}
                    style={{
                      background: esFavorito(p.id) ? "#dc2626" : "#fff",
                      color: esFavorito(p.id) ? "#fff" : "#111",
                    }}
                  >
                    ❤️
                  </button>
                  <img
                    src={obtenerImagen(p)}
                    alt={p.nombre}
                    className="related-image"
                  />
                  <h4>{p.nombre}</h4>
                  <p className="related-sub">Ideal para instalación</p>
                  {p.oferta === 1 || p.oferta === true ? (
                    <div>
                      <span className="precio-ant">${p.precio}</span>
                      <p className="precio-of">${p.precioOferta}</p>
                    </div>
                  ) : (
                    <p className="related-price">${p.precio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {relacionados.length > 0 && (
          <div className="full-width-related-section">
            <h2 className="section-title">Productos relacionados</h2>
            <div className="related-grid full-width-grid">
              {relacionados.map((p) => (
                <div
                  key={p.id}
                  className="related-card"
                  onClick={() => navigate(`/producto/${p.id}`)}
                >
                  <button
                    className="fav-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(p);
                    }}
                    style={{
                      background: esFavorito(p.id) ? "#dc2626" : "#fff",
                      color: esFavorito(p.id) ? "#fff" : "#111",
                    }}
                  >
                    ❤️
                  </button>
                  <img
                    src={obtenerImagen(p)}
                    alt={p.nombre}
                    className="related-image"
                  />
                  <h4>{p.nombre}</h4>
                  <p className="related-price">${p.precio}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ============================================================
// ESTILOS CSS
// ============================================================
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    /* ----- PÁGINA ----- */
    .producto-detalle-page {
      background: #f3f4f6;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      overflow-x: hidden;
    }

    /* ----- CONTENEDOR PRINCIPAL ----- */
    .producto-detalle-container {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
      background: #fff;
      border-radius: 25px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    /* ----- GALERÍA (columna izquierda) ----- */
    .producto-detalle-gallery {
      flex: 1 1 100%;
      max-width: 100%;
      position: relative;
    }

    /* ----- INFORMACIÓN (columna derecha) ----- */
    .producto-detalle-info {
      flex: 1 1 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
      width: 100%;
    }

    /* ----- BADGES ----- */
    .badges-container {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .badge {
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: bold;
      color: #fff;
    }
    .rebaja { background: #dc2626; }
    .destacado { background: #111; }

    /* ----- FAVORITOS ----- */
    .fav-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      font-size: 22px;
      cursor: pointer;
      z-index: 30;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .fav-btn-small {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }

    /* ----- IMAGEN PRINCIPAL ----- */
    .main-image-container {
      width: 100%;
      max-width: 100%;
      height: 350px;
      overflow: hidden;
      border-radius: 20px;
      background: #fafafa;
      position: relative;
    }
    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    /* ----- THUMBNAILS ----- */
    .thumbs-container {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .thumb {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
    }

    /* ----- TÍTULOS Y PRECIOS ----- */
    .product-title {
      font-size: 32px;
      font-weight: 800;
      color: #111827;
      line-height: 1.1;
      letter-spacing: -1px;
    }
    .precio-normal {
      color: #16a34a;
      font-size: 40px;
      font-weight: 900;
      margin: 0;
    }
    .precio-oferta {
      color: #dc2626;
      font-size: 40px;
      font-weight: 900;
      margin-top: 5px;
    }
    .precio-anterior {
      text-decoration: line-through;
      color: #9ca3af;
      font-size: 22px;
      font-weight: 600;
    }

    /* ----- CAJA DE DATOS ----- */
    .data-box {
      background: linear-gradient(135deg,#ffffff,#f8fafc);
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    }
    .data-item {
      margin: 8px 0;
      font-size: 15px;
      color: #333;
    }
    .caja-info {
      background: #eff6ff;
      color: #1e3a8a;
      padding: 12px 15px;
      border-radius: 12px;
      font-weight: bold;
      width: fit-content;
    }

    /* ----- STOCK ----- */
    .stock-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 14px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      margin-top: 10px;
      width: 100%;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      box-sizing: border-box;
    }
    .stock-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    .stock-title {
      font-size: 16px;
      font-weight: 800;
      margin: 0;
    }
    .stock-sub {
      font-size: 13px;
      margin: 0;
      color: #6b7280;
      font-weight: 600;
    }

    /* ----- CAJAS DE TEXTO ----- */
    .box {
      background: #fafafa;
      border: 1px solid #eee;
      padding: 18px;
      border-radius: 15px;
    }
    .box-title {
      margin-bottom: 12px;
    }
    .description {
      color: #555;
      line-height: 1.9;
    }

    /* ----- BOTONES ----- */
    .btn-cotizador {
      background: #111;
      color: #fff;
      border: none;
      padding: 16px;
      border-radius: 14px;
      cursor: pointer;
      font-size: 17px;
      font-weight: bold;
    }
    .btn-agregar-cotizador {
      background: linear-gradient(135deg, #111, #1f2937);
      color: #fff;
      border: none;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      width: 100%;
      margin-top: 10px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
      transition: all 0.25s ease;
    }
    .btn-agregar-cotizador:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.25);
    }
    .btn-agregar-cotizador:active {
      transform: scale(0.97);
    }

    /* ----- COTIZADOR ----- */
    .cotizador-box {
      background: #fafafa;
      border: 1px solid #eee;
      padding: 20px;
      border-radius: 20px;
    }
    .cotizador-title {
      margin-bottom: 20px;
      color: #111;
    }

    /* ----- GUÍA DE MEDICIÓN ----- */
    .guia-medicion {
      margin-bottom: 25px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 20px;
    }
    .guia-titulo {
      text-align: center;
      margin-bottom: 20px;
      color: #111827;
      font-size: 20px;
      font-weight: 700;
    }
    .guia-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .guia-card {
      background: #f9fafb;
      border-radius: 16px;
      padding: 15px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    .guia-img {
      width: 100%;
      height: 180px;
      object-fit: contain;
      margin-bottom: 15px;
      cursor: zoom-in;
    }

    /* ----- SELECTOR MODO ----- */
    .selector-modo {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .resumen-area {
      background: #ecfdf5;
      border: 1px solid #16a34a;
      color: #166534;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      font-weight: 700;
      margin-bottom: 20px;
    }

    /* ----- MEDIDAS ----- */
    .medidas-container {
      margin-bottom: 20px;
    }
    .medida-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 15px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .medidas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .input-field {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      box-sizing: border-box;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .resultado-medida {
      font-weight: bold;
      color: #16a34a;
      margin: 10px 0;
    }
    .radio-label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
    }

    /* ----- BOTONES MEDIDAS ----- */
    .botones-medidas {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn-agregar {
      background: #16a34a;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      flex: 1;
    }
    .btn-limpiar {
      background: #f59e0b;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      flex: 1;
    }
    .btn-eliminar {
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 10px 15px;
      border-radius: 10px;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
    }

    /* ----- DESPERDICIO ----- */
    .desperdicio-box {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .des-btn {
      border: 1px solid #ddd;
      padding: 10px 15px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      flex: 1;
      min-width: 60px;
      background: #fff;
      color: #111;
    }
    .des-btn.active {
      background: #111;
      color: #fff;
    }

    /* ----- RESULTADO COTIZACIÓN ----- */
    .resultado-cotizacion {
      background: #fff;
      border-radius: 15px;
      padding: 20px;
      border: 1px solid #eee;
    }
    .total-estimado {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
    }
    .nota-producto {
      margin-top: 15px;
      background: #eff6ff;
      padding: 15px;
      border-radius: 12px;
      color: #1e3a8a;
      line-height: 1.7;
    }

    /* ----- FORMULARIO CLIENTE ----- */
    .form-cliente {
      margin-top: 25px;
      background: #fff;
      padding: 20px;
      border-radius: 15px;
      border: 1px solid #eee;
    }
    .btn-enviar {
      margin-top: 10px;
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
    }
    .mensaje-exito {
      margin-top: 15px;
      color: green;
      font-weight: bold;
    }

    /* ========================================================= */
    /* 🔥 SECCIÓN DE PRODUCTOS A ANCHO COMPLETO (FUERA DEL CONTAINER) */
    /* ========================================================= */
    .full-width-related-wrapper {
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
      padding: 0 20px;
      box-sizing: border-box;
      margin: 0 auto;
    }

    .full-width-related-section {
      max-width: 1400px;
      margin: 40px auto 0 auto;
      padding: 0 10px;
      box-sizing: border-box;
      width: 100%;
    }

    .full-width-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      width: 100%;
    }

    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 18px;
    }

    .related-card {
      background: #fff;
      border-radius: 22px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      position: relative;
      border: 1px solid #e5e7eb;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      transition: all .3s ease;
    }
    .related-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }
    .related-image {
      width: 100%;
      height: 130px;
      object-fit: cover;
      border-radius: 15px;
      margin-bottom: 10px;
    }
    .related-price {
      color: green;
      font-weight: bold;
      font-size: 16px;
    }

    /* ----- SUGERIDOS ----- */
    .sugerido-card {
      background: #fff;
      border-radius: 24px;
      padding: 12px;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 15px 35px rgba(0,0,0,0.08);
      transition: all .3s ease;
      text-align: center;
    }
    .sugerido-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 45px rgba(0,0,0,0.15);
    }
    .sugerido-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #111;
      color: #fff;
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 999px;
      font-weight: bold;
    }
    .related-sub {
      font-size: 13px;
      color: #666;
    }
    .precio-ant {
      text-decoration: line-through;
      color: #999;
    }
    .precio-of {
      color: #dc2626;
      font-weight: bold;
      font-size: 18px;
    }

    /* ----- SUGERIDOS BANNER (ancho completo) ----- */
    .sugeridos-banner {
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-left: 6px solid #111827;
      padding: 18px 24px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.05);
      width: 100%;
      box-sizing: border-box;
    }
    .sugeridos-label {
      display: inline-block;
      background: #111827;
      color: #fff;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 1.5px;
      padding: 6px 18px;
      border-radius: 999px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .sugeridos-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 8px 0 12px 0;
      line-height: 1.2;
    }
    .sugeridos-subtitle {
      font-size: 16px;
      color: #4b5563;
      margin: 0;
    }

    /* ----- FICHA TÉCNICA ----- */
    .ficha-img {
      width: 100%;
      max-width: 100%;
      border-radius: 12px;
      border: 1px solid #ddd;
      cursor: zoom-in;
    }

    /* ----- MODALES ZOOM ----- */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: zoom-out;
    }
    .modal-image {
      max-width: 90%;
      max-height: 90%;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    /* ----- CATEGORÍAS ----- */
    .category-box {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: -10px;
      margin-bottom: 5px;
    }
    .category-tag {
      background: #111827;
      color: #fff;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .subcategory-tag {
      background: #e5e7eb;
      color: #111;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }

    /* ========================================================= */
    /* 🔥 RESPONSIVE: TABLETS (≥768px) */
    /* ========================================================= */
    @media (min-width: 768px) {
      .producto-detalle-container {
        padding: 30px;
        gap: 35px;
      }
      .product-title {
        font-size: 38px;
      }
      .precio-normal {
        font-size: 46px;
      }
      .precio-oferta {
        font-size: 46px;
      }
      .main-image-container {
        height: 420px;
      }
      .thumb {
        width: 80px;
        height: 80px;
      }
      .full-width-grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 20px;
      }
      .related-image {
        height: 160px;
      }
      .guia-grid {
        grid-template-columns: 1fr 1fr;
      }
      .full-width-related-wrapper {
        padding: 0 30px;
      }
    }

    /* ========================================================= */
    /* 🔥 RESPONSIVE: ESCRITORIO (≥1024px) */
    /* ========================================================= */
    @media (min-width: 1024px) {
      .producto-detalle-container {
        flex-wrap: nowrap;
        gap: 50px;
        padding: 40px;
      }
      .producto-detalle-gallery {
        flex: 0 0 45%;
        max-width: 45%;
      }
      .producto-detalle-info {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .main-image-container {
        height: 550px;
      }
      .thumb {
        width: 85px;
        height: 85px;
      }
      .product-title {
        font-size: 48px;
      }
      .precio-normal {
        font-size: 58px;
      }
      .precio-oferta {
        font-size: 58px;
      }

      /* 👇 FILAS DE 5 COLUMNAS */
      .full-width-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 24px;
      }
      .related-image {
        height: 170px;
      }
      .related-card, .sugerido-card {
        padding: 14px;
      }
      .sugeridos-title {
        font-size: 26px;
      }
      .full-width-related-section {
        padding: 0;
      }
      .full-width-related-wrapper {
        padding: 0 40px;
      }
    }

    /* ========================================================= */
    /* 🔥 RESPONSIVE: PANTALLAS MUY GRANDES (≥1440px) */
    /* ========================================================= */
    @media (min-width: 1440px) {
      .producto-detalle-container {
        max-width: 1600px;
        padding: 50px 60px;
        gap: 70px;
      }
      .producto-detalle-gallery {
        flex: 0 0 42%;
        max-width: 42%;
      }
      .producto-detalle-info {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .main-image-container {
        height: 650px;
      }
      .thumb {
        width: 100px;
        height: 100px;
      }
      .product-title {
        font-size: 56px;
      }
      .precio-normal {
        font-size: 64px;
      }
      .precio-oferta {
        font-size: 64px;
      }
      .full-width-grid {
        gap: 30px;
      }
      .related-image {
        height: 200px;
      }
      .full-width-related-wrapper {
        padding: 0 60px;
      }
      .full-width-related-section {
        max-width: 1600px;
      }
    }

    /* ========================================================= */
    /* 🔥 ANIMACIÓN PULSO */
    /* ========================================================= */
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.6; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(styleSheet);
}