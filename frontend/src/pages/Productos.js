import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Productos() {
  const [productos, setProductos] = useState([]);

  // 🌙 DARKMODE
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // ❤️ FAVORITOS
  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem("favoritos");
    return guardados ? JSON.parse(guardados) : [];
  });

  // 🔍 FILTROS
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [soloDestacados, setSoloDestacados] = useState(false);

  // 📂 FILTROS CATEGORÍAS
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState("");

  // 🔽 DROPDOWNS
  const [openOrden, setOpenOrden] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openSubcategoria, setOpenSubcategoria] = useState(false);

  const [timeoutCategoria, setTimeoutCategoria] = useState(null);
  const [timeoutSubcategoria, setTimeoutSubcategoria] = useState(null);
  const [timeoutOrden, setTimeoutOrden] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const navigate = useNavigate();

  // 📱 DETECTOR RESPONSIVO MEJORADO
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Determinar columnas del grid basado en el tamaño
  const getGridColumns = () => {
    if (isMobile) return "repeat(2, 1fr)";
    if (isTablet) return "repeat(3, 1fr)";
    if (windowWidth >= 1024 && windowWidth < 1280) return "repeat(4, 1fr)";
    if (windowWidth >= 1280 && windowWidth < 1536) return "repeat(5, 1fr)";
    return "repeat(6, 1fr)";
  };

  // 📄 ESTADOS PARA LA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const getProductosPorPagina = () => {
    if (isMobile) return 10;
    if (isTablet) return 15;
    return 20;
  };
  const productosPorPagina = getProductosPorPagina();

  // Regresar a la página 1 cada vez que cambie algún filtro o búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaFiltro, subcategoriaFiltro, soloOfertas, soloDestacados, orden]);

  // 🔥 CARGAR DATA
  useEffect(() => {
    api.get("/productos").then((res) => setProductos(res.data)).catch((err) => console.log(err));
    api.get("/categorias").then((res) => setCategorias(res.data)).catch((err) => console.log(err));
    api.get("/subcategorias").then((res) => setSubcategorias(res.data)).catch((err) => console.log(err));
  }, []);

  // 💾 GUARDAR DATA LOCAL
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const all = searchParams.get("all");
    if (all === "true") {
      setBusqueda("");
      setCategoriaFiltro("");
      setSubcategoriaFiltro("");
      setSoloOfertas(false);
      setSoloDestacados(false);
      setOrden("");
    }
  }, [searchParams]);

  useEffect(() => {
    const buscar = searchParams.get("buscar");
    if (buscar) setBusqueda(buscar);
  }, [searchParams]);

  // 🖼 OBTENER IMAGEN
  const obtenerImagen = (producto) => {
    if (producto.imagenes && producto.imagenes.trim() !== "") {
      return producto.imagenes.split(",")[0];
    }
    return producto.imagen;
  };

  // ❤️ TOGGLE FAVORITO
  const toggleFavorito = (producto) => {
    const productoCompleto = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: obtenerImagen(producto)
    };
    const existe = favoritos.find(fav => Number(fav.id) === Number(producto.id));

    if (existe) {
      setFavoritos(favoritos.filter(f => Number(f.id) !== Number(producto.id)));
    } else {
      setFavoritos([...favoritos, productoCompleto]);
    }
  };

  // ⚖️ COMPARADOR
  const [comparador, setComparador] = useState(() => {
    const guardados = localStorage.getItem("comparador");
    return guardados ? JSON.parse(guardados) : [];
  });

  useEffect(() => {
    localStorage.setItem("comparador", JSON.stringify(comparador));
  }, [comparador]);

  const toggleComparador = (producto) => {
    const productoCompleto = { ...producto, imagen: obtenerImagen(producto) };
    const existe = comparador.find(p => Number(p.id) === Number(producto.id));

    if (existe) {
      setComparador(comparador.filter(p => Number(p.id) !== Number(producto.id)));
    } else {
      if (comparador.length >= 3) {
        alert("Máximo 3 productos");
        return;
      }
      setComparador([...comparador, productoCompleto]);
    }
  };

  const esFavorito = (id) => favoritos.some(f => Number(f.id) === Number(id));
  const estaComparando = (id) => comparador.some(p => Number(p.id) === Number(id));

  // 🧮 COTIZADOR
  const agregarCotizador = (producto) => {
    const cotizador = JSON.parse(localStorage.getItem("cotizador")) || [];
    const existe = cotizador.find(p => Number(p.id) === Number(producto.id));
    if (existe) return;

    cotizador.push({ ...producto, imagen: obtenerImagen(producto) });
    localStorage.setItem("cotizador", JSON.stringify(cotizador));
    alert("Producto agregado al cotizador");
  };

  // 🔥 RESALTAR TEXTO
  const resaltarTexto = (texto) => {
    if (!busqueda.trim()) return texto;
    const regex = new RegExp(`(${busqueda})`, "gi");
    return texto?.split(regex).map((parte, index) => (
      parte.toLowerCase() === busqueda.toLowerCase() ? (
        <span key={index} style={styles.highlight(darkMode)}>{parte}</span>
      ) : parte
    ));
  };

  // 🔍 FILTRAR Y ORDENAR PRODUCTOS
  const productosFiltrados = [...productos]
    .filter(p => {
      const texto = busqueda.toLowerCase();
      return (
        (p.nombre || "").toLowerCase().includes(texto) ||
        (p.descripcion || "").toLowerCase().includes(texto) ||
        (p.categoria || "").toLowerCase().includes(texto) ||
        (p.subcategoria || "").toLowerCase().includes(texto) ||
        (p.sku || "").toLowerCase().includes(texto)
      );
    })
    .filter(p => categoriaFiltro ? p.categoria === categoriaFiltro : true)
    .filter(p => subcategoriaFiltro ? p.subcategoria === subcategoriaFiltro : true)
    .filter(p => soloOfertas ? (p.oferta === 1 || p.oferta === true) : true)
    .filter(p => soloDestacados ? (p.destacado === 1 || p.destacado === true) : true)
    .sort((a, b) => {
      if (orden === "az") return a.nombre.localeCompare(b.nombre);
      if (orden === "za") return b.nombre.localeCompare(a.nombre);
      if (orden === "precio-menor") return Number(a.precio) - Number(b.precio);
      if (orden === "precio-mayor") return Number(b.precio) - Number(a.precio);
      if (orden === "sku") return (a.sku || "").localeCompare(b.sku || "");
      return 0;
    });

  // 🧮 LÓGICA DE CORTE PARA PAGINACIÓN
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosPaginaActual = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDropdownToggle = (type) => {
    if (!isMobile) return;
    if (type === "cat") setOpenCategoria(!openCategoria);
    if (type === "sub") setOpenSubcategoria(!openSubcategoria);
    if (type === "ord") setOpenOrden(!openOrden);
  };

  // Mostrar menos páginas en móvil
  const getPaginasMostradas = () => {
    if (isMobile) {
      const paginas = [];
      if (totalPaginas <= 5) {
        for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
      } else {
        paginas.push(1);
        if (paginaActual > 3) paginas.push('...');
        const start = Math.max(2, paginaActual - 1);
        const end = Math.min(totalPaginas - 1, paginaActual + 1);
        for (let i = start; i <= end; i++) paginas.push(i);
        if (paginaActual < totalPaginas - 2) paginas.push('...');
        paginas.push(totalPaginas);
      }
      return paginas;
    }
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  };

  return (
    <div style={styles.page(darkMode)}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        productos={productos}
        favoritos={favoritos}
        toggleFavorito={toggleFavorito}
        esFavorito={esFavorito}
        categorias={categorias}
        subcategorias={subcategorias}
      />

      <div style={styles.container}>
        {/* 🔵 HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title(darkMode, isMobile)}>Todos los productos</h1>
          <p style={styles.subtitle(darkMode, isMobile)}>Explora nuestro catálogo completo</p>
        </div>

        {/* 🔍 FILTROS */}
        <div style={styles.filters(darkMode, isMobile, isTablet)}>
          {/* 🔎 BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.search(darkMode, isMobile)}
          />

          {/* 📂 CATEGORÍA */}
          <div
            style={styles.selectWrapper(isMobile)}
            onMouseEnter={() => {
              if (isMobile) return;
              if (timeoutCategoria) clearTimeout(timeoutCategoria);
              setOpenCategoria(true);
            }}
            onMouseLeave={() => {
              if (isMobile) return;
              const t = setTimeout(() => setOpenCategoria(false), 150);
              setTimeoutCategoria(t);
            }}
            onClick={() => handleDropdownToggle("cat")}
          >
            <div style={styles.fakeSelect(darkMode, isMobile)}>
              <span style={styles.selectText(isMobile)}>
                {categoriaFiltro || "📂 Todas las categorías"}
              </span>
              <span style={styles.selectArrow}>⌄</span>
            </div>

            {openCategoria && (
              <div style={styles.customDropdown(darkMode, isMobile)}>
                <div
                  style={styles.dropdownItem(darkMode, isMobile)}
                  onClick={() => {
                    setCategoriaFiltro("");
                    setSubcategoriaFiltro("");
                    setOpenCategoria(false);
                  }}
                >
                  📂 Todas las categorías
                </div>
                {[...new Set(productos.map(p => p.categoria))].filter(Boolean).map((cat, i) => (
                  <div
                    key={i}
                    style={styles.dropdownItem(darkMode, isMobile)}
                    onClick={() => {
                      setCategoriaFiltro(cat);
                      setSubcategoriaFiltro("");
                      setOpenCategoria(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📁 SUBCATEGORÍA */}
          <div
            style={styles.selectWrapper(isMobile)}
            onMouseEnter={() => {
              if (isMobile) return;
              if (timeoutSubcategoria) clearTimeout(timeoutSubcategoria);
              setOpenSubcategoria(true);
            }}
            onMouseLeave={() => {
              if (isMobile) return;
              const t = setTimeout(() => setOpenSubcategoria(false), 150);
              setTimeoutSubcategoria(t);
            }}
            onClick={() => handleDropdownToggle("sub")}
          >
            <div style={styles.fakeSelect(darkMode, isMobile)}>
              <span style={styles.selectText(isMobile)}>
                {subcategoriaFiltro || "📁 Todas las subcategorías"}
              </span>
              <span style={styles.selectArrow}>⌄</span>
            </div>

            {openSubcategoria && (
              <div style={styles.customDropdown(darkMode, isMobile)}>
                <div
                  style={styles.dropdownItem(darkMode, isMobile)}
                  onClick={() => {
                    setSubcategoriaFiltro("");
                    setOpenSubcategoria(false);
                  }}
                >
                  📁 Todas las subcategorías
                </div>
                {[...new Set(productos.filter(p => categoriaFiltro ? p.categoria === categoriaFiltro : true).map(p => p.subcategoria))].filter(Boolean).map((sub, i) => (
                  <div
                    key={i}
                    style={styles.dropdownItem(darkMode, isMobile)}
                    onClick={() => {
                      setSubcategoriaFiltro(sub);
                      setOpenSubcategoria(false);
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🔤 ORDEN */}
          <div
            style={styles.selectWrapper(isMobile)}
            onMouseEnter={() => {
              if (isMobile) return;
              if (timeoutOrden) clearTimeout(timeoutOrden);
              setOpenOrden(true);
            }}
            onMouseLeave={() => {
              if (isMobile) return;
              const t = setTimeout(() => setOpenOrden(false), 150);
              setTimeoutOrden(t);
            }}
            onClick={() => handleDropdownToggle("ord")}
          >
            <div style={styles.fakeSelect(darkMode, isMobile)}>
              <span style={styles.selectText(isMobile)}>
                {orden === "az" ? "🔤 A-Z" :
                 orden === "za" ? "🔤 Z-A" :
                 orden === "precio-menor" ? "💲 Menor precio" :
                 orden === "precio-mayor" ? "💲 Mayor precio" :
                 orden === "sku" ? "🏷 SKU" : "🔤 Ordenar"}
              </span>
              <span style={styles.selectArrow}>⌄</span>
            </div>

            {openOrden && (
              <div style={styles.customDropdown(darkMode, isMobile)}>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden(""); setOpenOrden(false); }}>🔤 Ordenar por</div>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden("az"); setOpenOrden(false); }}>🔤 A-Z</div>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden("za"); setOpenOrden(false); }}>🔤 Z-A</div>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden("precio-menor"); setOpenOrden(false); }}>💲 Menor precio</div>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden("precio-mayor"); setOpenOrden(false); }}>💲 Mayor precio</div>
                <div style={styles.dropdownItem(darkMode, isMobile)} onClick={() => { setOrden("sku"); setOpenOrden(false); }}>🏷 SKU</div>
              </div>
            )}
          </div>

          <div style={styles.checkboxGroup(isMobile)}>
            <label style={styles.checkbox(darkMode, isMobile)}>
              <input type="checkbox" checked={soloOfertas} onChange={() => setSoloOfertas(!soloOfertas)} style={styles.inputCheck} />
              <span style={isMobile ? { fontSize: '12px' } : {}}>Ofertas</span>
            </label>

            <label style={styles.checkbox(darkMode, isMobile)}>
              <input type="checkbox" checked={soloDestacados} onChange={() => setSoloDestacados(!soloDestacados)} style={styles.inputCheck} />
              <span style={isMobile ? { fontSize: '12px' } : {}}>Destacados</span>
            </label>
          </div>
        </div>

        {/* 🔢 RESULTADOS */}
        <p style={styles.results(darkMode, isMobile)}>{productosFiltrados.length} productos encontrados</p>

        {/* 🟢 GRID DINÁMICO */}
        <div style={styles.grid(getGridColumns(), isMobile)}>
          {productosPaginaActual.map(p => (
            <div
              key={p.id}
              onClick={() => {
                const desdeCotizador = localStorage.getItem("seleccionandoCotizador");
                if (desdeCotizador === "true") {
                  agregarCotizador(p);
                  navigate("/cotizador");
                  return;
                }
                navigate(`/producto/${p.id}`);
              }}
              style={styles.card(darkMode, isMobile)}
              onMouseEnter={(e) => { if (!isMobile) e.currentTarget.style.transform = "translateY(-8px)"; }}
              onMouseLeave={(e) => { if (!isMobile) e.currentTarget.style.transform = "translateY(0px)"; }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorito(p); }}
                style={{
                  ...styles.favBtn(isMobile),
                  background: esFavorito(p.id) ? "#dc2626" : (darkMode ? "#1e293b" : "#fff"),
                  color: esFavorito(p.id) ? "#fff" : (darkMode ? "#fff" : "#111")
                }}
              >
                ❤️
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); toggleComparador(p); }}
                style={{
                  ...styles.compareBtn(isMobile),
                  background: estaComparando(p.id) ? "#2563eb" : (darkMode ? "#1e293b" : "#fff"),
                  color: estaComparando(p.id) ? "#fff" : (darkMode ? "#fff" : "#111")
                }}
              >
                ⚖️
              </button>

              <div style={styles.imageContainer(isMobile)}>
                <img src={obtenerImagen(p)} alt={p.nombre} style={styles.image} />
              </div>

              <div style={styles.info(isMobile)}>
                <h3 style={styles.name(darkMode, isMobile)}>{resaltarTexto(p.nombre)}</h3>
                <p style={styles.desc(darkMode, isMobile)}>
                  {resaltarTexto(p.descripcion?.slice(0, isMobile ? 30 : 50) || "Sin descripción")}
                  {p.descripcion?.length > (isMobile ? 30 : 50) && "..."}
                </p>

                <div style={styles.tags}>
                  {p.categoria && <span style={styles.tag(isMobile)}>📂 {p.categoria.slice(0, isMobile ? 8 : 10)}</span>}
                  {p.subcategoria && <span style={styles.tag2(isMobile)}>📁 {p.subcategoria.slice(0, isMobile ? 8 : 10)}</span>}
                </div>

                <div style={styles.bottom}>
                  {(p.oferta === 1 || p.oferta === true) ? (
                    <div>
                      <span style={styles.oldPrice(isMobile)}>${p.precio}</span>
                      <div style={styles.offerPrice(isMobile)}>${p.precioOferta}</div>
                    </div>
                  ) : (
                    <span style={styles.price(isMobile)}>${p.precio}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🔢 BOTONES DE PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div style={styles.paginationContainer(isMobile)}>
            <button
              disabled={paginaActual === 1}
              onClick={() => cambiarPagina(paginaActual - 1)}
              style={styles.pageButton(paginaActual === 1, false, darkMode, isMobile)}
            >
              «
            </button>

            {getPaginasMostradas().map((num, index) => (
              num === '...' ? (
                <span key={`ellipsis-${index}`} style={styles.ellipsis(darkMode)}>…</span>
              ) : (
                <button
                  key={num}
                  onClick={() => cambiarPagina(num)}
                  style={styles.pageButton(false, num === paginaActual, darkMode, isMobile)}
                >
                  {num}
                </button>
              )
            ))}

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => cambiarPagina(paginaActual + 1)}
              style={styles.pageButton(paginaActual === totalPaginas, false, darkMode, isMobile)}
            >
              »
            </button>
          </div>
        )}

        {/* ⚖️ BARRA DE COMPARACIÓN FLOTANTE */}
        {comparador.length > 0 && (
          <div style={styles.compareBar(darkMode, isMobile)}>
            <div style={styles.compareItems(isMobile)}>
              {comparador.map((p) => (
                <div key={p.id} style={styles.compareItem(darkMode)}>
                  <img src={p.imagen} alt={p.nombre} style={styles.compareImage(isMobile)} />
                  {!isMobile && <span style={{ fontSize: "14px", fontWeight: "600" }}>{p.nombre.slice(0, 12)}...</span>}
                </div>
              ))}
            </div>
            <button style={styles.compareAction(isMobile)} onClick={() => navigate("/comparar")}>
              {isMobile ? `⚖️ ${comparador.length}` : `Comparar (${comparador.length})`}
            </button>
          </div>
        )}
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

/* ================================================= */
/* 🎨 OBJETO DE ESTILOS MEJORADO PARA RESPONSIVE    */
/* ================================================= */
const styles = {
  page: (darkMode) => ({
    background: darkMode ? "#0f172a" : "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflowX: "hidden"
  }),

  container: {
    padding: "clamp(15px, 3vw, 40px) clamp(10px, 2vw, 25px)",
    maxWidth: "1850px",
    margin: "0 auto",
    boxSizing: "border-box"
  },

  header: {
    textAlign: "center",
    marginBottom: "clamp(20px, 4vw, 30px)"
  },

  title: (darkMode, isMobile) => ({
    fontSize: isMobile ? "clamp(20px, 5vw, 28px)" : "clamp(32px, 4vw, 46px)",
    fontWeight: "800",
    color: darkMode ? "#fff" : "#111",
    margin: "0 0 clamp(5px, 1vw, 10px) 0"
  }),

  subtitle: (darkMode, isMobile) => ({
    color: darkMode ? "#cbd5e1" : "#666",
    fontSize: isMobile ? "clamp(12px, 2.5vw, 14px)" : "clamp(16px, 1.5vw, 18px)",
    margin: 0
  }),

  filters: (darkMode, isMobile, isTablet) => ({
    background: darkMode ? "#1e293b" : "#fff",
    padding: isMobile ? "clamp(12px, 2vw, 15px)" : "clamp(20px, 2.5vw, 25px)",
    borderRadius: isMobile ? "16px" : "20px",
    display: "flex",
    flexDirection: isMobile ? "column" : (isTablet ? "row" : "row"),
    flexWrap: isMobile ? "nowrap" : "wrap",
    gap: isMobile ? "10px" : "clamp(15px, 2vw, 20px)",
    alignItems: "stretch",
    marginBottom: "clamp(20px, 3vw, 30px)",
    boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.04)"
  }),

  search: (darkMode, isMobile) => ({
    flex: isMobile ? "none" : "1 1 300px",
    minWidth: isMobile ? "100%" : "clamp(200px, 20vw, 300px)",
    padding: "clamp(12px, 1.5vw, 16px)",
    borderRadius: "12px",
    border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
    outline: "none",
    fontSize: isMobile ? "clamp(13px, 2.5vw, 14px)" : "clamp(15px, 1.2vw, 17px)",
    background: darkMode ? "#0f172a" : "#fff",
    color: darkMode ? "#fff" : "#111",
    width: isMobile ? "100%" : "auto"
  }),

  selectWrapper: (isMobile) => ({
    position: "relative",
    flex: isMobile ? "none" : "1",
    minWidth: isMobile ? "100%" : "clamp(150px, 15vw, 230px)",
    width: isMobile ? "100%" : "auto"
  }),

  fakeSelect: (darkMode, isMobile) => ({
    background: darkMode ? "#0f172a" : "#fff",
    color: darkMode ? "#fff" : "#111",
    borderRadius: "12px",
    padding: "clamp(12px, 1.5vw, 16px)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "600",
    fontSize: isMobile ? "clamp(12px, 2.5vw, 13px)" : "clamp(14px, 1.1vw, 16px)",
    border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
    gap: "8px"
  }),

  selectText: (isMobile) => ({
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: isMobile ? "calc(100% - 20px)" : "100%"
  }),

  selectArrow: {
    flexShrink: 0,
    marginLeft: "4px"
  },

  customDropdown: (darkMode, isMobile) => ({
    position: "absolute",
    top: isMobile ? "calc(100% + 4px)" : "calc(100% + 8px)",
    left: 0,
    width: "100%",
    minWidth: "max-content",
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 12px 35px rgba(0,0,0,0.2)",
    zIndex: 110,
    maxHeight: "clamp(200px, 30vh, 280px)",
    overflowY: "auto"
  }),

  dropdownItem: (darkMode, isMobile) => ({
    padding: isMobile ? "clamp(10px, 1.5vw, 12px) clamp(14px, 2vw, 18px)" : "14px 18px",
    cursor: "pointer",
    fontSize: isMobile ? "clamp(12px, 2.5vw, 13px)" : "clamp(14px, 1.1vw, 16px)",
    borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f1f1",
    color: darkMode ? "#fff" : "#111",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }),

  checkboxGroup: (isMobile) => ({
    display: "flex",
    gap: isMobile ? "15px" : "20px",
    justifyContent: isMobile ? "center" : "flex-start",
    alignItems: "center",
    padding: isMobile ? "clamp(4px, 0.5vw, 5px) 0" : "0 10px",
    flexWrap: "wrap"
  }),

  checkbox: (darkMode, isMobile) => ({
    display: "flex",
    alignItems: "center",
    gap: "clamp(4px, 0.5vw, 8px)",
    fontWeight: "600",
    fontSize: isMobile ? "clamp(12px, 2.5vw, 13px)" : "clamp(14px, 1.1vw, 16px)",
    cursor: "pointer",
    color: darkMode ? "#fff" : "#111"
  }),

  inputCheck: {
    width: "clamp(16px, 1.5vw, 18px)",
    height: "clamp(16px, 1.5vw, 18px)",
    flexShrink: 0
  },

  results: (darkMode, isMobile) => ({
    marginBottom: "clamp(15px, 2vw, 20px)",
    fontWeight: "700",
    fontSize: isMobile ? "clamp(13px, 2.5vw, 14px)" : "clamp(16px, 1.2vw, 18px)",
    color: darkMode ? "#cbd5e1" : "#555"
  }),

  grid: (columns, isMobile) => ({
    display: "grid",
    gridTemplateColumns: columns,
    gap: isMobile ? "clamp(8px, 1.5vw, 10px)" : "clamp(15px, 2vw, 20px)"
  }),

  card: (darkMode, isMobile) => ({
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: isMobile ? "clamp(12px, 1.5vw, 16px)" : "20px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxShadow: darkMode ? "0 8px 20px rgba(0,0,0,0.3)" : "0 8px 20px rgba(0,0,0,0.04)",
    height: "100%",
    minHeight: isMobile ? "280px" : "350px"
  }),

  favBtn: (isMobile) => ({
    position: "absolute",
    top: isMobile ? "clamp(6px, 1vw, 8px)" : "12px",
    right: isMobile ? "clamp(6px, 1vw, 8px)" : "12px",
    width: isMobile ? "clamp(28px, 4vw, 32px)" : "38px",
    height: isMobile ? "clamp(28px, 4vw, 32px)" : "38px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "clamp(11px, 2vw, 13px)" : "16px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 0,
    lineHeight: 1
  }),

  compareBtn: (isMobile) => ({
    position: "absolute",
    top: isMobile ? "clamp(38px, 6vw, 44px)" : "56px",
    right: isMobile ? "clamp(6px, 1vw, 8px)" : "12px",
    width: isMobile ? "clamp(28px, 4vw, 32px)" : "38px",
    height: isMobile ? "clamp(28px, 4vw, 32px)" : "38px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "clamp(11px, 2vw, 13px)" : "16px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 0,
    lineHeight: 1
  }),

  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "clamp(120px, 20vw, 140px)" : "clamp(150px, 15vw, 175px)",
    overflow: "hidden",
    flexShrink: 0
  }),

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  info: (isMobile) => ({
    padding: isMobile ? "clamp(8px, 1.5vw, 10px)" : "clamp(14px, 1.5vw, 18px)",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: isMobile ? "4px" : "8px"
  }),

  name: (darkMode, isMobile) => ({
    fontSize: isMobile ? "clamp(12px, 2.5vw, 14px)" : "clamp(16px, 1.3vw, 18px)",
    fontWeight: "700",
    margin: 0,
    color: darkMode ? "#fff" : "#111",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.3"
  }),

  desc: (darkMode, isMobile) => ({
    fontSize: isMobile ? "clamp(11px, 2vw, 12px)" : "clamp(13px, 1vw, 15px)",
    color: darkMode ? "#cbd5e1" : "#666",
    margin: 0,
    display: isMobile ? "none" : "block",
    lineHeight: "1.4",
    flexGrow: 1
  }),

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(4px, 0.5vw, 6px)",
    marginTop: "auto",
    paddingTop: "4px"
  },

  tag: (isMobile) => ({
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "clamp(2px, 0.3vw, 4px) clamp(6px, 1vw, 8px)",
    borderRadius: "6px",
    fontSize: isMobile ? "clamp(9px, 1.8vw, 10px)" : "clamp(10px, 0.8vw, 12px)",
    fontWeight: "700",
    whiteSpace: "nowrap"
  }),

  tag2: (isMobile) => ({
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "clamp(2px, 0.3vw, 4px) clamp(6px, 1vw, 8px)",
    borderRadius: "6px",
    fontSize: isMobile ? "clamp(9px, 1.8vw, 10px)" : "clamp(10px, 0.8vw, 12px)",
    fontWeight: "700",
    whiteSpace: "nowrap"
  }),

  bottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "4px"
  },

  price: (isMobile) => ({
    fontSize: isMobile ? "clamp(14px, 3vw, 16px)" : "clamp(20px, 1.8vw, 24px)",
    fontWeight: "800",
    color: "#16a34a"
  }),

  oldPrice: (isMobile) => ({
    textDecoration: "line-through",
    color: "#9ca3af",
    fontSize: isMobile ? "clamp(10px, 2vw, 11px)" : "clamp(12px, 1vw, 14px)"
  }),

  offerPrice: (isMobile) => ({
    color: "#dc2626",
    fontSize: isMobile ? "clamp(14px, 3vw, 16px)" : "clamp(20px, 1.8vw, 24px)",
    fontWeight: "800"
  }),

  highlight: (darkMode) => ({
    background: darkMode ? "#fff" : "#111",
    color: darkMode ? "#111" : "#fff",
    padding: "1px 4px",
    borderRadius: "4px",
    fontWeight: "700"
  }),

  paginationContainer: (isMobile) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: isMobile ? "clamp(4px, 1vw, 6px)" : "10px",
    marginTop: "clamp(30px, 4vw, 45px)",
    marginBottom: "clamp(15px, 2vw, 20px)",
    flexWrap: "wrap"
  }),

  pageButton: (deshabilitado, activo, darkMode, isMobile) => ({
    padding: isMobile ? "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 14px)" : "12px 20px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "700",
    fontSize: isMobile ? "clamp(12px, 2.5vw, 13px)" : "clamp(14px, 1vw, 16px)",
    cursor: deshabilitado ? "not-allowed" : "pointer",
    opacity: deshabilitado ? 0.4 : 1,
    background: activo 
      ? "#2563eb" 
      : (darkMode ? "#1e293b" : "#fff"),
    color: activo 
      ? "#fff" 
      : (darkMode ? "#fff" : "#334155"),
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "background 0.2s ease, transform 0.1s ease",
    minWidth: isMobile ? "clamp(32px, 5vw, 40px)" : "auto"
  }),

  ellipsis: (darkMode) => ({
    color: darkMode ? "#cbd5e1" : "#666",
    fontSize: "18px",
    fontWeight: "600",
    padding: "0 4px"
  }),

  compareBar: (darkMode, isMobile) => ({
    position: "fixed",
    bottom: isMobile ? "clamp(8px, 1.5vw, 10px)" : "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: darkMode ? "#1e293b" : "#fff",
    padding: isMobile ? "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 14px)" : "16px 24px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? "clamp(8px, 1.5vw, 10px)" : "25px",
    width: isMobile ? "clamp(280px, 90vw, 400px)" : "auto",
    maxWidth: "95%",
    zIndex: 999,
    boxShadow: "0 10px 35px rgba(0,0,0,0.25)"
  }),

  compareItems: (isMobile) => ({
    display: "flex",
    gap: isMobile ? "clamp(4px, 1vw, 6px)" : "12px",
    overflowX: "auto",
    flex: 1
  }),

  compareItem: (darkMode) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: darkMode ? "#fff" : "#111",
    flexShrink: 0
  }),

  compareImage: (isMobile) => ({
    width: isMobile ? "clamp(30px, 5vw, 38px)" : "48px",
    height: isMobile ? "clamp(30px, 5vw, 38px)" : "48px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ccc",
    flexShrink: 0
  }),

  compareAction: (isMobile) => ({
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: isMobile ? "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 14px)" : "14px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: isMobile ? "clamp(11px, 2vw, 13px)" : "clamp(14px, 1vw, 16px)",
    whiteSpace: "nowrap",
    flexShrink: 0
  })
};