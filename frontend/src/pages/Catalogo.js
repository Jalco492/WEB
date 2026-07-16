import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

export default function Catalogo() {
  useEffect(() => {
    if (window.location.hash === "#productos-nuevos") {
      setTimeout(() => {
        document
          .getElementById("productos-nuevos")
          ?.scrollIntoView({
            behavior: "smooth"
          });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulseBtn {
        0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 rgba(255,255,255,0.2); }
        50% { transform: scale(1.08); opacity: 0.75; box-shadow: 0 0 30px rgba(255,255,255,0.9); }
        100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 rgba(255,255,255,0.2); }
      }
      
      /* Animación de parpadeo para "NUEVO" */
      @keyframes blinkNew {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      /* Animación de entrada para tarjetas nuevas */
      @keyframes slideInNew {
        0% { opacity: 0; transform: translateY(30px) scale(0.95); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      
      /* Animación de brillo para productos nuevos */
      @keyframes glowNew {
        0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
        50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.8), 0 0 50px rgba(16, 185, 129, 0.3); }
        100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
      }
      
      /* Animación flotante para tarjetas nuevas */
      @keyframes floatNew {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
        100% { transform: translateY(0px); }
      }
      
      #categoriasSlider::-webkit-scrollbar { display: none; }
      #ofertaSlider::-webkit-scrollbar { display: none; }
      #nuevoSlider::-webkit-scrollbar { display: none; }
      #destacadosSlider::-webkit-scrollbar { display: none; }
      #vendidasSlider::-webkit-scrollbar { display: none; }
      
      /* Estilos para imágenes responsivas */
      .slider-image {
        width: 100%;
        object-fit: contain;
        background: #f8f9fa;
        transition: transform 0.3s ease;
      }
      
      .slider-card:hover .slider-image {
        transform: scale(1.03);
      }
      
      /* Estilos para productos nuevos con animaciones */
      .nuevo-card {
        animation: slideInNew 0.6s ease forwards;
        border: 2px solid rgba(16, 185, 129, 0.3) !important;
        transition: all 0.3s ease !important;
      }
      
      .nuevo-card:hover {
        animation: floatNew 0.5s ease infinite !important;
        border-color: rgba(16, 185, 129, 0.8) !important;
        box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3) !important;
        transform: translateY(-5px) !important;
      }
      
      .nuevo-badge {
        animation: blinkNew 1.5s ease infinite;
        background: linear-gradient(135deg, #10b981, #059669) !important;
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        padding: 6px 14px !important;
        font-size: 13px !important;
        border-radius: 20px !important;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      
      .nuevo-card:hover .nuevo-badge {
        animation: none;
        transform: scale(1.1);
        box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
      }
      
      /* Efecto de brillo en hover */
      .nuevo-card::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #10b981, #34d399, #10b981);
        border-radius: 22px;
        opacity: 0;
        z-index: -1;
        transition: opacity 0.3s ease;
        background-size: 300% 300%;
        animation: gradientShift 3s ease infinite;
      }
      
      .nuevo-card:hover::before {
        opacity: 1;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* Texto "NUEVO" parpadeante en el título */
      .nuevo-titulo {
        display: inline-block;
        animation: blinkNew 1.2s ease infinite;
        background: linear-gradient(135deg, #10b981, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        position: relative;
      }
      
      .nuevo-titulo::after {
        content: '✨';
        display: inline-block;
        margin-left: 10px;
        animation: sparkle 1.5s ease infinite;
        -webkit-text-fill-color: initial;
      }
      
      @keyframes sparkle {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.3) rotate(180deg); }
      }
      
      /* Eliminar fondo gris del carrusel */
      .slider-container {
        background: transparent !important;
      }
      
      .slider-section {
        background: transparent !important;
      }
      
      @media (max-width: 768px) {
        .slider-container {
          padding: 0 5px !important;
        }
        .slider-card {
          min-width: 150px !important;
          max-width: 150px !important;
        }
        .slider-image {
          height: 150px !important;
        }
        .nuevo-badge {
          font-size: 11px !important;
          padding: 4px 10px !important;
        }
      }
      @media (max-width: 480px) {
        .slider-card {
          min-width: 130px !important;
          max-width: 130px !important;
        }
        .slider-image {
          height: 130px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [productos, setProductos] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [banners, setBanners] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriasDestacadas, setCategoriasDestacadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [heroActual, setHeroActual] = useState(0);

  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#productos-nuevos") {
      const section = document.getElementById("productos-nuevos");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const bannersHero = banners;

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [scrollDistance, setScrollDistance] = useState(280);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      updateScrollDistance();
    };
    
    const updateScrollDistance = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setScrollDistance(140);
      } else if (width < 768) {
        setScrollDistance(180);
      } else if (width < 1024) {
        setScrollDistance(260);
      } else {
        setScrollDistance(280);
      }
    };
    
    updateScrollDistance();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const productosNuevos = productos.filter(p => p.nuevo === 1 || p.nuevo === true);
  const productosOferta = productos.filter(p => p.oferta === 1 || p.oferta === true || p.rebaja === 1 || p.rebaja === true);

  const [fechaFinalOferta, setFechaFinalOferta] = useState(new Date("2026-12-31T23:59:59"));

  useEffect(() => {
    const guardada = localStorage.getItem("fechaOferta");
    if (guardada) {
      const fecha = new Date(guardada);
      if (!isNaN(fecha.getTime())) {
        setFechaFinalOferta(fecha);
      }
    }
  }, []);

  const [tiempoRestante, setTiempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    if (!fechaFinalOferta) return;
    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const distancia = fechaFinalOferta.getTime() - ahora;

      if (distancia < 0) {
        clearInterval(interval);
        return;
      }

      setTiempoRestante({
        dias: Math.floor(distancia / (1000 * 60 * 60 * 24)),
        horas: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((distancia % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fechaFinalOferta]);

  const [favoritos, setFavoritos] = useState(() => {
    const guardados = localStorage.getItem("favoritos");
    return guardados ? JSON.parse(guardados) : [];
  });

  useEffect(() => {
    api.get("/categorias-destacadas").then(res => setCategoriasDestacadas(res.data)).catch(err => console.log(err));
    api.get("/categorias").then(res => setCategorias(res.data)).catch(err => console.log(err));
    api.get("/subcategorias").then(res => setSubcategorias(res.data)).catch(err => console.log(err));
    api.get("/productos").then(res => setProductos(res.data)).catch(err => console.log(err));
    api.get("/banners").then(res => setBanners(res.data)).catch(err => console.log(err));
    api.get("/productos/destacados").then(res => setDestacados(res.data)).catch(err => console.log(err));
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    if (bannersHero.length === 0) return;
    const interval = setInterval(() => {
      setHeroActual(prev => (prev >= bannersHero.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const toggleFavorito = (producto) => {
    const existe = favoritos.find(fav => fav.id === producto.id);
    if (existe) {
      setFavoritos(favoritos.filter(f => f.id !== producto.id));
    } else {
      setFavoritos([...favoritos, producto]);
    }
  };

  const esFavorito = (id) => favoritos.some(f => f.id === id);

  const obtenerImagen = (producto) => {
    if (producto.imagenes && producto.imagenes.trim() !== "") {
      return producto.imagenes.split(",")[0];
    }
    return producto.imagen;
  };

  const clickBanner = (banner) => {
    if (banner.subcategoria) {
      navigate(`/subcategoria/${encodeURIComponent(banner.subcategoria)}`);
      return;
    }
    if (banner.categoria) {
      navigate(`/categoria-id/${banner.categoria_id}`);
    }
  };

  const scrollSlider = (sliderId, direction) => {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const cardWidth = isMobile ? 160 : 240;
    const gap = 15;
    const scrollAmount = (cardWidth + gap) * 2;
    
    const newScrollPosition = direction === 'left' 
      ? slider.scrollLeft - scrollAmount
      : slider.scrollLeft + scrollAmount;
    
    slider.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div style={styles.page(darkMode)}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoritos={favoritos}
        productos={productos}
        toggleFavorito={toggleFavorito}
        esFavorito={esFavorito}
        categorias={categorias}
        subcategorias={subcategorias}
      />

      {/* ================================================= */}
      {/* 🛍️ TODAS LAS CATEGORÍAS */}
      {/* ================================================= */}
      {categorias.length > 0 && (
        <div className="slider-section" style={{ ...styles.section(darkMode, isMobile), position: "relative", overflow: "visible" }}>
          <button 
            onClick={() => scrollSlider("categoriasSlider", "left")} 
            style={{ ...styles.arrowLeft(isMobile) }}
          >
            ❮
          </button>
          <button 
            onClick={() => scrollSlider("categoriasSlider", "right")} 
            style={{ ...styles.arrowRight(isMobile) }}
          >
            ❯
          </button>

          <h2 style={{ ...styles.sectionTitle(darkMode, isMobile), textAlign: "center" }}>
            Explora todos nuestros productos
          </h2>
          <p style={{ textAlign: "center", marginTop: "-15px", marginBottom: "25px", opacity: 0.7, fontSize: isMobile ? "14px" : "16px" }}>
            Encuentra rápidamente lo que necesitas
          </p>

          <div id="categoriasSlider" style={styles.sliderRow}>
            {categorias.map((cat) => {
              const productoCategoria = productos.find(p => p.categoria_id === cat.id || p.categoria === cat.nombre);
              return (
                <div
                  key={cat.id}
                  style={styles.categoriaCard(darkMode, isMobile)}
                  onClick={() => navigate(`/categoria-id/${cat.id}`)}
                >
                  <img
                    src={productoCategoria ? obtenerImagen(productoCategoria) : "https://via.placeholder.com/400"}
                    alt={cat.nombre}
                    style={styles.categoriaImage}
                  />
                  <div style={styles.categoriaOverlay}>
                    <h3 style={{ fontSize: isMobile ? "13px" : "18px", textAlign: "center" }}>{cat.nombre}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 🔥 HERO CARRUSEL */}
      {/* ================================================= */}
      {bannersHero.length > 0 && (
        <div style={styles.heroWrapper(isMobile)}>
          <div style={styles.heroMain} onClick={() => clickBanner(bannersHero[heroActual])}>
            <img 
              src={bannersHero[heroActual].imagen} 
              alt={bannersHero[heroActual].titulo || "Banner"} 
              style={styles.heroImage}
              loading="lazy"
            />
            <div style={styles.heroOverlay(isMobile)}>
              <h1 style={styles.heroTitle(isMobile)}>
                {bannersHero[heroActual].titulo}
              </h1>
              <p style={styles.heroDesc(isMobile)}>
                {bannersHero[heroActual].descripcion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 🔥 OFERTAS ESPECIALES */}
      {/* ================================================= */}
      {productosOferta.length > 0 && (
        <div className="slider-section" style={{ ...styles.ofertaSection(darkMode, isMobile), position: "relative", overflow: "visible" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={styles.sectionTitle(darkMode, isMobile)}>Ofertas especiales</h2>
            <p style={styles.ofertaSubtitle(isMobile)}>Aprovecha antes de que termine</p>
          </div>

          <button 
            onClick={() => scrollSlider("ofertaSlider", "left")} 
            style={{ ...styles.arrowLeft(isMobile) }}
          >
            ❮
          </button>
          <button 
            onClick={() => scrollSlider("ofertaSlider", "right")} 
            style={{ ...styles.arrowRight(isMobile) }}
          >
            ❯
          </button>

          <div id="ofertaSlider" style={styles.sliderRow}>
            {productosOferta.map(p => (
              <div key={p.id} className="slider-card" style={styles.sliderCard(darkMode, isMobile)} onClick={() => navigate(`/producto/${p.id}`)}>
                <div style={styles.ofertaBadge}>🔥 OFERTA</div>
                <img 
                  src={p.imagenes ? p.imagenes.split(",")[0] : "https://via.placeholder.com/300"} 
                  alt={p.nombre} 
                  className="slider-image"
                  style={styles.sliderImage}
                  loading="lazy"
                />
                <h3 style={{ fontSize: isMobile ? "14px" : "16px", margin: "8px 0" }}>{p.nombre}</h3>
                <p style={styles.oldPrice}>${p.precio}</p>
                <h2 style={styles.newPrice}>${p.precioOferta || p.precio}</h2>
              </div>
            ))}
          </div>

          {/* ⏰ TIMER */}
          <div style={styles.timerCenter}>
            <div style={styles.timerBox(isMobile)}>
              <div style={styles.timerItem}>
                <strong>{tiempoRestante.dias}</strong>
                <span>Días</span>
              </div>
              <div style={styles.timerItem}>
                <strong>{tiempoRestante.horas}</strong>
                <span>Horas</span>
              </div>
              <div style={styles.timerItem}>
                <strong>{tiempoRestante.minutos}</strong>
                <span>Min</span>
              </div>
              <div style={styles.timerItem}>
                <strong>{tiempoRestante.segundos}</strong>
                <span>Seg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 🆕 PRODUCTOS NUEVOS CON ANIMACIONES */}
      {/* ================================================= */}
      {productosNuevos.length > 0 && (
        <div id="productos-nuevos" className="slider-section" style={{ ...styles.nuevoSection(darkMode, isMobile), position: "relative", overflow: "visible" }}>
          <h2 style={{ ...styles.sectionTitle(darkMode, isMobile), textAlign: "center" }}>
            <span className="nuevo-titulo">✨ Productos Nuevos</span>
          </h2>
          <p style={{ textAlign: "center", marginTop: "-10px", marginBottom: "25px", opacity: 0.8, fontSize: isMobile ? "13px" : "15px" }}>
            ¡Lo último en tendencia!
          </p>

          <button 
            onClick={() => scrollSlider("nuevoSlider", "left")} 
            style={{ ...styles.arrowLeft(isMobile) }}
          >
            ❮
          </button>
          <button 
            onClick={() => scrollSlider("nuevoSlider", "right")} 
            style={{ ...styles.arrowRight(isMobile) }}
          >
            ❯
          </button>

          <div id="nuevoSlider" style={styles.sliderRow}>
            {productosNuevos.map((p, index) => (
              <div 
                key={p.id} 
                className="slider-card nuevo-card" 
                style={{ 
                  ...styles.nuevoCard(darkMode, isMobile),
                  animationDelay: `${index * 0.1}s`
                }} 
                onClick={() => navigate(`/producto/${p.id}`)}
              >
                <div className="nuevo-badge" style={styles.nuevoBadge}>🆕 NUEVO</div>
                <img 
                  src={p.imagenes ? p.imagenes.split(",")[0] : "https://via.placeholder.com/200"} 
                  alt={p.nombre} 
                  className="slider-image"
                  style={styles.sliderImage}
                  loading="lazy"
                />
                <h3 style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "700" }}>{p.nombre}</h3>
                <p style={{ fontSize: "12px", color: "#10b981", margin: "4px 0", fontWeight: "600" }}>
                  ⭐ Novedad
                </p>
                <h2 style={styles.price(isMobile)}>${p.precio}</h2>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 🔥 CATEGORÍAS MÁS VENDIDAS */}
      {/* ================================================= */}
      <div className="slider-section" style={{ ...styles.section(darkMode, isMobile), position: "relative", overflow: "visible" }}>
        <button 
          onClick={() => scrollSlider("vendidasSlider", "left")} 
          style={{ ...styles.arrowLeft(isMobile) }}
        >
          ❮
        </button>
        <button 
          onClick={() => scrollSlider("vendidasSlider", "right")} 
          style={{ ...styles.arrowRight(isMobile) }}
        >
          ❯
        </button>

        <h2 style={{ ...styles.sectionTitle(darkMode, isMobile), textAlign: "center" }}>
          Categorías más vendidas
        </h2>
        <div id="vendidasSlider" style={styles.sliderRow}>
          {[...categoriasDestacadas, ...categoriasDestacadas].map((p, index) => (
            <div key={index} className="slider-card" style={styles.sliderCard(darkMode, isMobile)} onClick={() => navigate(`/categoria-id/${p.categoria_id}`)}>
              <img 
                src={obtenerImagen(p)} 
                alt={p.nombre} 
                className="slider-image"
                style={styles.sliderImage}
                loading="lazy"
              />
              <h3 style={{ fontSize: isMobile ? "14px" : "16px" }}>{p.categoria}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* ⭐ PRODUCTOS DESTACADOS */}
      {/* ================================================= */}
      <div className="slider-section" style={{ ...styles.section(darkMode, isMobile), position: "relative", overflow: "visible" }}>
        <button 
          onClick={() => scrollSlider("destacadosSlider", "left")} 
          style={{ ...styles.arrowLeft(isMobile) }}
        >
          ❮
        </button>
        <button 
          onClick={() => scrollSlider("destacadosSlider", "right")} 
          style={{ ...styles.arrowRight(isMobile) }}
        >
          ❯
        </button>

        <h2 style={{ ...styles.sectionTitle(darkMode, isMobile), textAlign: "center" }}>
          Productos destacados
        </h2>

        <div id="destacadosSlider" style={styles.sliderRow}>
          {destacados.map((p, index) => (
            <div key={index} className="slider-card" style={styles.sliderCard(darkMode, isMobile)} onClick={() => navigate(`/producto/${p.id}`)}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorito(p);
                }}
                style={{
                  ...styles.favBtn,
                  background: esFavorito(p.id) ? "#dc2626" : "#fff",
                  color: esFavorito(p.id) ? "#fff" : "#111"
                }}
              >
                ❤️
              </button>
              <img 
                src={obtenerImagen(p)} 
                alt={p.nombre} 
                className="slider-image"
                style={styles.sliderImage}
                loading="lazy"
              />
              <h3 style={{ fontSize: isMobile ? "14px" : "16px" }}>{p.nombre}</h3>
              {!isMobile && <p style={styles.desc}>{p.descripcion}</p>}
              <h2 style={styles.price(isMobile)}>${p.precio}</h2>
            </div>
          ))}
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}

/* ================================================= */
/* 🎨 ESTILOS OPTIMIZADOS PARA IMÁGENES */
/* ================================================= */
const styles = {
  page: (darkMode) => ({
    background: darkMode ? "#0f172a" : "#f5f7fb",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
    color: darkMode ? "#fff" : "#111827",
    transition: "all 0.3s ease"
  }),

  heroWrapper: (isMobile) => ({
    padding: isMobile ? "10px" : "24px",
    width: "100%",
    boxSizing: "border-box"
  }),

  heroMain: {
    position: "relative",
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    cursor: "pointer",
    background: "#f8f9fa"
  },

  heroImage: {
    width: "100%",
    height: "auto",
    maxHeight: "450px",
    objectFit: "contain",
    display: "block",
    background: "#f8f9fa"
  },

  heroOverlay: (isMobile) => ({
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2))",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: isMobile ? "20px" : "40px"
  }),

  heroTitle: (isMobile) => ({
    fontSize: isMobile ? "22px" : "42px",
    fontWeight: "900",
    marginBottom: "8px",
    lineHeight: "1.2"
  }),

  heroDesc: (isMobile) => ({
    fontSize: isMobile ? "13px" : "18px",
    maxWidth: "600px",
    opacity: 0.9,
    display: isMobile ? "-webkit-box" : "block",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  }),

  section: (darkMode, isMobile) => ({
    margin: isMobile ? "15px 8px" : "40px 24px",
    background: "transparent",
    borderRadius: isMobile ? "16px" : "30px",
    padding: isMobile ? "15px" : "35px",
    boxSizing: "border-box",
    overflow: "visible",
    position: "relative"
  }),

  ofertaSection: (darkMode, isMobile) => ({
    margin: isMobile ? "15px 8px" : "40px 24px",
    background: darkMode ? "rgba(30, 41, 59, 0.5)" : "transparent",
    borderRadius: isMobile ? "16px" : "30px",
    padding: isMobile ? "15px" : "35px",
    boxSizing: "border-box",
    overflow: "visible",
    position: "relative"
  }),

  nuevoSection: (darkMode, isMobile) => ({
    margin: isMobile ? "15px 8px" : "40px 24px",
    background: "transparent",
    borderRadius: isMobile ? "16px" : "30px",
    padding: isMobile ? "15px" : "35px",
    boxSizing: "border-box",
    overflow: "visible",
    position: "relative"
  }),

  sectionTitle: (darkMode, isMobile) => ({
    fontSize: isMobile ? "20px" : "32px",
    marginBottom: isMobile ? "15px" : "28px",
    fontWeight: "800",
    color: darkMode ? "#fff" : "#111827"
  }),

  ofertaSubtitle: (isMobile) => ({
    fontSize: isMobile ? "13px" : "16px",
    color: "#ef4444",
    marginBottom: "20px",
    fontWeight: "600"
  }),

  sliderRow: {
    display: "flex",
    gap: "15px",
    overflowX: "auto",
    padding: "10px 25px",
    scrollBehavior: "smooth",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    margin: "0 -10px",
    paddingLeft: "20px",
    paddingRight: "20px"
  },

  sliderCard: (darkMode, isMobile) => ({
    minWidth: isMobile ? "155px" : "240px",
    maxWidth: isMobile ? "155px" : "240px",
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: isMobile ? "14px" : "22px",
    padding: isMobile ? "12px" : "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #eef2f7",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
    }
  }),

  nuevoCard: (darkMode, isMobile) => ({
    minWidth: isMobile ? "155px" : "240px",
    maxWidth: isMobile ? "155px" : "240px",
    background: darkMode ? "#1e293b" : "#fff",
    borderRadius: isMobile ? "14px" : "22px",
    padding: isMobile ? "12px" : "16px",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    border: "2px solid rgba(16, 185, 129, 0.3)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }),

  categoriaCard: (darkMode, isMobile) => ({
    minWidth: isMobile ? "110px" : "200px",
    maxWidth: isMobile ? "110px" : "200px",
    height: isMobile ? "110px" : "200px",
    borderRadius: isMobile ? "12px" : "20px",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    flexShrink: 0,
    transition: "transform 0.2s ease",
    ":hover": {
      transform: "scale(1.05)"
    }
  }),

  categoriaImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },

  categoriaOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 0, 0, 0.45)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px"
  },

  sliderImage: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "12px",
    marginBottom: "10px",
    background: "#f8f9fa",
    transition: "transform 0.3s ease",
    padding: "8px"
  },

  price: (isMobile) => ({
    color: "#432DD7",
    fontWeight: "800",
    fontSize: isMobile ? "18px" : "26px",
    margin: "6px 0 0 0"
  }),

  oldPrice: {
    color: "#9ca3af",
    textDecoration: "line-through",
    fontSize: "14px",
    margin: "0"
  },

  newPrice: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: "22px",
    margin: "0"
  },

  ofertaBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "#ef4444",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    zIndex: 10
  },

  nuevoBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    zIndex: 10,
    letterSpacing: "1px",
    textTransform: "uppercase",
    animation: "blinkNew 1.5s ease infinite",
    boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
  },

  favBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease"
  },

  desc: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "1.4",
    margin: "6px 0"
  },

  timerCenter: {
    display: "flex",
    justifyContent: "center",
    marginTop: "25px"
  },

  timerBox: (isMobile) => ({
    display: "flex",
    gap: isMobile ? "8px" : "15px",
    background: "#1e293b",
    padding: isMobile ? "10px 15px" : "15px 30px",
    borderRadius: "14px",
    color: "#fff"
  }),

  timerItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "45px",
    strong: { fontSize: "20px", fontWeight: "800" },
    span: { fontSize: "11px", opacity: 0.7 }
  },

  arrowLeft: (isMobile) => ({
    position: "absolute",
    left: isMobile ? "5px" : "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #ddd",
    width: isMobile ? "32px" : "44px",
    height: isMobile ? "32px" : "44px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "14px" : "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    zIndex: 10,
    transition: "all 0.2s ease",
    ":hover": {
      background: "#fff",
      transform: "translateY(-50%) scale(1.1)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    }
  }),

  arrowRight: (isMobile) => ({
    position: "absolute",
    right: isMobile ? "5px" : "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #ddd",
    width: isMobile ? "32px" : "44px",
    height: isMobile ? "32px" : "44px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "14px" : "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    zIndex: 10,
    transition: "all 0.2s ease",
    ":hover": {
      background: "#fff",
      transform: "translateY(-50%) scale(1.1)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
    }
  })
};