import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaPhone,
  FaBars,
  FaTimes,
  FaSearch,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaHeart,
  FaBalanceScale,
  FaFileInvoice,
  FaMoon,
  FaSun
} from "react-icons/fa";
import api from "../services/api"; // Asegúrate de que la ruta sea correcta

export default function Navbar({
  darkMode,
  setDarkMode,
  favoritos = [],
  categorias = [],
  subcategorias = [],
  tipos = [],
  productos = [],
  toggleFavorito,
  esFavorito,
  isMobile
}) {

  const navigate = useNavigate();

  // ========== ESTADOS (sin cambios) ==========
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaHover, setCategoriaHover] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  
  // Estados para categorías, subcategorías y tipos
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(null);
  const [mostrarSubcategorias, setMostrarSubcategorias] = useState(false);
  const [mostrarTipos, setMostrarTipos] = useState(false);

  // 🆕 Estado local para tipos si no vienen por prop
  const [tiposLocal, setTiposLocal] = useState([]);

  // ========== EFECTO PARA CARGAR TIPOS SI NO VIENEN POR PROP ==========
  useEffect(() => {
    if (tipos && tipos.length > 0) {
      setTiposLocal(tipos);
    } else {
      const cargarTipos = async () => {
        try {
          const res = await api.get("/tipos");
          console.log("📦 Tipos cargados desde API:", res.data);
          setTiposLocal(res.data);
        } catch (error) {
          console.error("❌ Error cargando tipos:", error);
        }
      };
      cargarTipos();
    }
  }, [tipos]);

  // Usamos los tipos locales si no hay prop
  const tiposUsar = tipos && tipos.length > 0 ? tipos : tiposLocal;

  // Depuración (opcional)
  useEffect(() => {
    console.log("🔍 Tipos disponibles en el navbar:", tiposUsar);
  }, [tiposUsar]);

  // ========== REFERENCIAS (sin cambios) ==========
  const menuRef = useRef(null);
  const submenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navbarRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const tiposPanelRef = useRef(null);
  
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);
  let desktopMenuTimeout = null;

  // ========== EFECTOS (responsive, scroll, etc.) sin cambios ==========
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateNavbarHeight = () => {
    if (navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavbarHeight(height);
    }
  };

  useEffect(() => {
    updateNavbarHeight();
    const resizeObserver = new ResizeObserver(() => {
      updateNavbarHeight();
    });
    if (navbarRef.current) {
      resizeObserver.observe(navbarRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateNavbarHeight, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeout(updateNavbarHeight, 300);
  }, [isNavbarVisible]);

  useEffect(() => {
    setTimeout(updateNavbarHeight, 100);
  }, [isMobileView]);

  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        if (isMobileView) {
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsNavbarVisible(false);
            setMobileMenuOpen(false);
          } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
            setIsNavbarVisible(true);
          }
        } else {
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsNavbarVisible(false);
          } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
            setIsNavbarVisible(true);
          }
        }
        setLastScrollY(currentScrollY);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
    };
  }, [lastScrollY, isMobileView]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========== ESTILOS INYECTADOS (sin cambios) ==========
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes slideDown {
        from {
          transform: translateY(-10px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .mobile-hamburger-btn {
        background: rgba(255,255,255,0.15);
        border: none;
        color: #fff;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        flex-shrink: 0;
        position: relative;
        z-index: 10001;
        margin-left: auto;
        min-width: 36px;
      }

      .mobile-hamburger-btn:hover {
        background: rgba(255,255,255,0.25);
        transform: scale(1.05);
      }

      .mobile-hamburger-btn:active {
        transform: scale(0.95);
      }

      .mobile-search-input {
        width: 100%;
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.3);
        outline: none;
        background: rgba(255,255,255,0.92);
        color: #111827;
        transition: 0.3s;
        backdrop-filter: blur(10px);
      }

      .mobile-search-input:focus {
        border-color: #22c55e;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
      }

      .mobile-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #2d2d3f;
        border-radius: 0 0 16px 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        padding: 8px 0;
        max-height: calc(100vh - 80px);
        overflow-y: auto;
        animation: slideDown 0.3s ease;
        z-index: 10000;
        border-top: 2px solid rgba(255,255,255,0.1);
      }

      .mobile-dropdown-menu::-webkit-scrollbar {
        width: 3px;
      }

      .mobile-dropdown-menu::-webkit-scrollbar-track {
        background: transparent;
      }

      .mobile-dropdown-menu::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
      }

      .mobile-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-size: 14px;
        font-weight: 500;
      }

      .mobile-menu-item:hover {
        background: rgba(255,255,255,0.08);
      }

      .mobile-menu-item:active {
        background: rgba(255,255,255,0.15);
        transform: scale(0.98);
      }

      .mobile-submenu-item {
        padding: 8px 16px 8px 40px;
        color: #ccc;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
      }

      .mobile-submenu-item:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }

      .mobile-submenu-item:active {
        background: rgba(255,255,255,0.1);
      }

      .mobile-categoria-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-size: 14px;
        font-weight: 500;
      }

      .mobile-categoria-header:hover {
        background: rgba(255,255,255,0.08);
      }

      .mobile-divider {
        height: 1px;
        background: rgba(255,255,255,0.08);
        margin: 4px 16px;
      }

      .desktop-productos-btn {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #fff;
        font-size: clamp(15px, 1.1vw, 18px);
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        transition: 0.3s ease;
      }

      .desktop-productos-btn:hover {
        background: rgba(255,255,255,0.12);
      }

      .desktop-dropdown {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 0;
      }

      .mobile-youtube-icon {
        background: #ffffff !important;
        color: #FF0000 !important;
        border: 1px solid rgba(255,0,0,0.2) !important;
      }

      .mobile-youtube-icon:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 2px 10px rgba(255,0,0,0.3) !important;
      }

      @media (max-width: 768px) {
        .social-desktop {
          display: flex !important;
        }
        
        .nav-links {
          display: none !important;
        }
        
        .hamburger-btn {
          display: none !important;
        }

        .logo-container {
          display: flex !important;
          align-items: center;
          gap: 4px;
        }

        .desktop-search {
          display: none !important;
        }

        .mobile-search {
          display: flex !important;
          width: 100%;
        }

        .navbar-content {
          gap: 4px !important;
          padding: 6px 10px !important;
          position: relative !important;
          flex-direction: column !important;
          align-items: stretch !important;
        }

        .mobile-top-row {
          display: flex !important;
          align-items: center;
          gap: 4px;
          width: 100%;
          justify-content: space-between;
        }

        .mobile-logo {
          display: flex !important;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .mobile-logo img {
          width: 28px !important;
          height: 28px !important;
          object-fit: contain !important;
        }

        .mobile-logo-text {
          display: block !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #fff !important;
          white-space: nowrap !important;
          letter-spacing: 0.3px;
        }

        .mobile-social {
          display: flex !important;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .mobile-social a {
          width: 24px !important;
          height: 24px !important;
          font-size: 10px !important;
          border-radius: 6px !important;
        }

        .mobile-social a svg {
          width: 12px !important;
          height: 12px !important;
        }

        .search-wrapper-mobile {
          flex: 1 !important;
          min-width: 80px !important;
        }

        .mobile-hamburger-btn {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          border-radius: 8px !important;
        }
        
        .mobile-hamburger-btn svg {
          width: 16px !important;
          height: 16px !important;
        }
      }

      @media (min-width: 769px) {
        .hamburger-btn {
          display: none !important;
        }
        
        .social-desktop {
          display: flex !important;
        }
        
        .nav-links {
          display: flex !important;
        }

        .mobile-search {
          display: none !important;
        }

        .desktop-search {
          display: block !important;
        }

        .mobile-logo {
          display: none !important;
        }
        
        .mobile-logo-text {
          display: none !important;
        }
        
        .mobile-social {
          display: none !important;
        }

        .mobile-dropdown-menu {
          display: none !important;
        }
        
        .mobile-top-row {
          display: none !important;
        }
      }

      .navbar-spacer {
        display: none !important;
      }

      @media (min-width: 769px) {
        .navbar-spacer {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        tiposPanelRef.current &&
        !tiposPanelRef.current.contains(event.target)
      ) {
        setMenu(false);
        setCategoriaSeleccionada(null);
        setSubcategoriaSeleccionada(null);
        setMostrarSubcategorias(false);
        setMostrarTipos(false);
        if (closeTimeout) clearTimeout(closeTimeout);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeTimeout]);

  const productosFiltrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      (p.nombre || "").toLowerCase().includes(texto) ||
      (p.descripcion || "").toLowerCase().includes(texto) ||
      (p.categoria || "").toLowerCase().includes(texto) ||
      (p.subcategoria || "").toLowerCase().includes(texto) ||
      (p.sku || "").toString().toLowerCase().includes(texto)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef && !searchRef.current.contains(event.target)) {
        setMostrarResultados(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const obtenerImagen = (producto) => {
    if (producto.imagenes && producto.imagenes.trim() !== "") {
      return producto.imagenes.split(",")[0];
    }
    return producto.imagen;
  };

  // ========== COMPONENTE SOCIAL ICON (sin cambios) ==========
  const SocialIcon = ({ children, color, href, size = "normal", isYoutube = false }) => {
    const isMobileIcon = size === "small";
    
    if (isYoutube) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-youtube-icon"
          style={{
            width: isMobileIcon ? "24px" : "38px",
            height: isMobileIcon ? "24px" : "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: isMobileIcon ? "6px" : "8px",
            background: "#ffffff",
            color: "#FF0000",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.3s ease",
            fontSize: isMobileIcon ? "10px" : "16px",
            border: "1px solid rgba(255,0,0,0.2)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {children}
        </a>
      );
    }
    
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: isMobileIcon ? "24px" : "38px",
          height: isMobileIcon ? "24px" : "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: isMobileIcon ? "6px" : "8px",
          background: color,
          color: "#fff",
          cursor: "pointer",
          textDecoration: "none",
          transition: "all 0.3s ease",
          fontSize: isMobileIcon ? "10px" : "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {children}
      </a>
    );
  };

  // ========== FUNCIONES MANEJADORAS (sin cambios, solo se añade handleTipoClick y soporte para tipos) ==========
  const handleMenuClick = () => {
    if (menu) {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    } else {
      setMenu(true);
    }
  };

  const handleCategoriaClick = (catId) => {
    setCategoriaSeleccionada(catId);
    setSubcategoriaSeleccionada(null);
    setMostrarSubcategorias(true);
    setMostrarTipos(false);
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  const handleSubcategoriaHover = (subId) => {
    setSubcategoriaSeleccionada(subId);
    setMostrarTipos(true);
  };

  const handleMouseEnterProductos = () => {
    if (desktopMenuTimeout) {
      clearTimeout(desktopMenuTimeout);
      desktopMenuTimeout = null;
    }
    setMenu(true);
  };

  const handleMouseLeaveProductos = () => {
    desktopMenuTimeout = setTimeout(() => {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    }, 200);
  };

  const handleMouseEnterDropdown = () => {
    if (desktopMenuTimeout) {
      clearTimeout(desktopMenuTimeout);
      desktopMenuTimeout = null;
    }
    setMenu(true);
  };

  const handleMouseLeaveDropdown = () => {
    desktopMenuTimeout = setTimeout(() => {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    }, 200);
  };

  const handleMouseEnterSubmenu = () => {
    if (desktopMenuTimeout) {
      clearTimeout(desktopMenuTimeout);
      desktopMenuTimeout = null;
    }
    setMenu(true);
  };

  const handleMouseLeaveSubmenu = () => {
    desktopMenuTimeout = setTimeout(() => {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    }, 200);
  };

  const handleMouseEnterTipos = () => {
    if (desktopMenuTimeout) {
      clearTimeout(desktopMenuTimeout);
      desktopMenuTimeout = null;
    }
    setMenu(true);
  };

  const handleMouseLeaveTipos = () => {
    desktopMenuTimeout = setTimeout(() => {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    }, 200);
  };

  const handleSubcategoriaClick = (subNombre) => {
    navigate(`/subcategoria/${subNombre}`);
    setMenu(false);
    setCategoriaSeleccionada(null);
    setSubcategoriaSeleccionada(null);
    setMostrarSubcategorias(false);
    setMostrarTipos(false);
    setMobileMenuOpen(false);
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  const handleVerTodasClick = (catId) => {
    navigate(`/categoria-id/${catId}`);
    setMenu(false);
    setCategoriaSeleccionada(null);
    setSubcategoriaSeleccionada(null);
    setMostrarSubcategorias(false);
    setMostrarTipos(false);
    setMobileMenuOpen(false);
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  // 🆕 Navegación al hacer clic en un tipo
  const handleTipoClick = (tipoId) => {
    navigate(`/tipo/${tipoId}`);
    setMenu(false);
    setCategoriaSeleccionada(null);
    setSubcategoriaSeleccionada(null);
    setMostrarSubcategorias(false);
    setMostrarTipos(false);
    setMobileMenuOpen(false);
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setMenu(false);
    setCategoriaSeleccionada(null);
    setSubcategoriaSeleccionada(null);
    setMostrarSubcategorias(false);
    setMostrarTipos(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setMenu(false);
      setCategoriaSeleccionada(null);
      setSubcategoriaSeleccionada(null);
      setMostrarSubcategorias(false);
      setMostrarTipos(false);
    }
  };

  // Para móvil: al hacer clic en subcategoría se expanden los tipos
  const handleMobileSubcategoriaClick = (subId) => {
    setSubcategoriaSeleccionada(subId);
    setMostrarTipos(true);
  };

  // ========== RENDER (sin cambios en la estructura, solo se añade el panel de tipos) ==========
  return (
    <>
      <div 
        ref={navbarRef}
        style={{
          ...styles.navbar,
          transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isNavbarVisible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isNavbarVisible ? 'auto' : 'none',
          backgroundColor: darkMode ? '#1a1a2e' : '#5c5a6a',
          boxShadow: isNavbarVisible ? '0 2px 20px rgba(67,45,215,0.2)' : 'none'
        }}
        className="navbar-content"
      >

        {!isMobileView && (
          <>
            <div style={styles.topRow}>
              <div style={styles.logoContainer}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={styles.logo}
                />
                <h2 style={styles.logoText}>FRAY FLOORING</h2>
              </div>
              
              <div className="social-desktop" style={styles.socialDesktop}>
                <SocialIcon color="#1877F2" href="https://www.facebook.com/people/FRAY-Flooring/61587688868988/">
                  <FaFacebookF size={20} />
                </SocialIcon>
                <SocialIcon color="#E4405F" href="https://www.instagram.com/fray_flooring?igsh=b3pucDR1bjltMGQ2">
                  <FaInstagram size={20} />
                </SocialIcon>
                <SocialIcon color="#010101" href="https://www.tiktok.com/@fray_flooring6">
                  <FaTiktok size={20} />
                </SocialIcon>
                <SocialIcon color="#25D366" href="https://wa.me/525610026370">
                  <FaWhatsapp size={20} />
                </SocialIcon>
                <SocialIcon color="#FF0000" href="https://www.youtube.com/@FrayFlooring" isYoutube={true}>
                  <FaYoutube size={20} />
                </SocialIcon>
                <SocialIcon color="#38bdf8" href="tel:+525610026370">
                  <FaPhone size={20} />
                </SocialIcon>
              </div>
            </div>

            <div style={styles.navRow}>
              <div className="nav-links" style={styles.navLinks}>
                <span onClick={() => navigate("/")} style={styles.navLink}>
                  Inicio
                </span>
                <span onClick={() => navigate("/nosotros")} style={styles.navLink}>
                  Nosotros
                </span>
                <span onClick={() => navigate("/contacto")} style={styles.navLink}>
                  Contacto
                </span>

                <div 
                  ref={menuRef}
                  style={styles.menu}
                  onMouseEnter={handleMouseEnterProductos}
                  onMouseLeave={handleMouseLeaveProductos}
                >
                  <button 
                    className="desktop-productos-btn"
                    style={{
                      background: menu ? "rgba(255,255,255,0.15)" : "none",
                      borderRadius: menu ? "8px 8px 0 0" : "8px",
                    }}
                  >
                    Productos {menu ? "▲" : "▼"}
                  </button>
                  
                  {menu && (
                    <div 
                      ref={dropdownRef}
                      style={styles.dropdownOverlay}
                      onMouseEnter={handleMouseEnterDropdown}
                      onMouseLeave={handleMouseLeaveDropdown}
                    >
                      <div style={styles.dropdownContainer}>
                        {/* Panel 1: Categorías */}
                        <div 
                          style={styles.dropdown(darkMode)}
                          onMouseEnter={handleMouseEnterDropdown}
                          onMouseLeave={handleMouseLeaveDropdown}
                        >
                          <p 
                            onClick={() => { navigate("/productos?all=true"); setMenu(false); setCategoriaSeleccionada(null); setSubcategoriaSeleccionada(null); setMostrarSubcategorias(false); setMostrarTipos(false); }} 
                            style={styles.dropdownCategory(darkMode)}
                          >
                            🛍 Todas
                          </p>
                          {categorias.map(cat => (
                            <p 
                              key={cat.id} 
                              onClick={() => handleCategoriaClick(cat.id)}
                              style={{
                                ...styles.dropdownCategory(darkMode),
                                background: categoriaSeleccionada === cat.id ? 
                                  (darkMode ? "#1f2937" : "#e5e7eb") : 
                                  "transparent",
                                fontWeight: categoriaSeleccionada === cat.id ? "700" : "600",
                                borderLeft: categoriaSeleccionada === cat.id ? 
                                  "3px solid #22c55e" : 
                                  "3px solid transparent"
                              }}
                            >
                              {cat.nombre} {categoriaSeleccionada === cat.id ? "◀" : "→"}
                            </p>
                          ))}
                        </div>

                        {/* Panel 2: Subcategorías (si hay categoría seleccionada) */}
                        {categoriaSeleccionada !== null && mostrarSubcategorias && (
                          <div 
                            ref={submenuRef}
                            style={styles.submenu(darkMode)}
                            onMouseEnter={handleMouseEnterSubmenu}
                            onMouseLeave={handleMouseLeaveSubmenu}
                          >
                            <div style={{
                              padding: "10px 16px",
                              borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                              marginBottom: "6px"
                            }}>
                              <p style={{
                                margin: 0,
                                color: darkMode ? "#22c55e" : "#16a34a",
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                {categorias.find(c => c.id === categoriaSeleccionada)?.nombre || "Categoría"}
                              </p>
                            </div>
                            
                            {subcategorias
                              .filter(sub => Number(sub.categoria_id) === Number(categoriaSeleccionada))
                              .map(sub => (
                                <p 
                                  key={sub.id} 
                                  onClick={() => handleSubcategoriaClick(sub.nombre)}
                                  onMouseEnter={() => handleSubcategoriaHover(sub.id)}
                                  style={{
                                    ...styles.dropdownSubcategory(darkMode),
                                    background: subcategoriaSeleccionada === sub.id ? 
                                      (darkMode ? "#1f2937" : "#e5e7eb") : 
                                      "transparent",
                                    fontWeight: subcategoriaSeleccionada === sub.id ? "700" : "500",
                                    borderLeft: subcategoriaSeleccionada === sub.id ? 
                                      "3px solid #22c55e" : 
                                      "3px solid transparent"
                                  }}
                                >
                                  {sub.nombre} {subcategoriaSeleccionada === sub.id ? "◀" : ""}
                                </p>
                              ))}
                            
                            <div style={{
                              borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                              marginTop: "6px",
                              paddingTop: "6px"
                            }}>
                              <p 
                                onClick={() => handleVerTodasClick(categoriaSeleccionada)}
                                style={{
                                  ...styles.dropdownSubcategory(darkMode),
                                  color: "#22c55e",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  background: darkMode ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
                                  borderRadius: "6px",
                                  margin: "4px 8px"
                                }}
                              >
                                📂 Ver toda la categoría
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ============================================================ */}
                        {/* 🆕 Panel 3: Tipos (si hay subcategoría seleccionada) */}
                        {/* ============================================================ */}
                        {subcategoriaSeleccionada !== null && mostrarTipos && (
                          <div 
                            ref={tiposPanelRef}
                            style={styles.submenu(darkMode)}
                            onMouseEnter={handleMouseEnterTipos}
                            onMouseLeave={handleMouseLeaveTipos}
                          >
                            <div style={{
                              padding: "10px 16px",
                              borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                              marginBottom: "6px"
                            }}>
                              <p style={{
                                margin: 0,
                                color: darkMode ? "#22c55e" : "#16a34a",
                                fontWeight: "bold",
                                fontSize: "14px"
                              }}>
                                Tipos de {subcategorias.find(s => s.id === subcategoriaSeleccionada)?.nombre || "Subcategoría"}
                              </p>
                            </div>
                            
                            {tiposUsar
                              .filter(tipo => Number(tipo.subcategoria_id) === Number(subcategoriaSeleccionada))
                              .map(tipo => (
                                <p 
                                  key={tipo.id} 
                                  onClick={() => handleTipoClick(tipo.id)}
                                  style={styles.dropdownSubcategory(darkMode)}
                                >
                                  {tipo.nombre}
                                </p>
                              ))}
                            {tiposUsar.filter(t => Number(t.subcategoria_id) === Number(subcategoriaSeleccionada)).length === 0 && (
                              <p style={{
                                ...styles.dropdownSubcategory(darkMode),
                                color: darkMode ? "#6b7280" : "#9ca3af",
                                textAlign: "center",
                                padding: "10px 16px"
                              }}>
                                No hay tipos disponibles
                              </p>
                            )}
                            <div style={{
                              borderTop: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                              marginTop: "6px",
                              paddingTop: "6px"
                            }}>
                              <p 
                                onClick={() => {
                                  const sub = subcategorias.find(s => s.id === subcategoriaSeleccionada);
                                  if (sub) handleSubcategoriaClick(sub.nombre);
                                }}
                                style={{
                                  ...styles.dropdownSubcategory(darkMode),
                                  color: "#22c55e",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  background: darkMode ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
                                  borderRadius: "6px",
                                  margin: "4px 8px"
                                }}
                              >
                                📂 Ver toda la subcategoría
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span onClick={() => navigate("/#productos-nuevos")} style={styles.navLink}>
                  <span style={styles.nuevosBadge}>NUEVOS</span>
                </span>

                <span onClick={() => navigate("/favoritos")} style={styles.navLink}>
                  Favoritos ({favoritos.length})
                </span>

                <span onClick={() => navigate("/comparar")} style={styles.navLink}>
                  Comparador
                </span>

                <span onClick={() => navigate("/cotizador")} style={styles.navLink}>
                  Cotizador
                </span>
              </div>
            </div>

            <div className="desktop-search" style={styles.searchContainer}>
              <div ref={searchRef} style={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="🔍 Buscar productos..."
                  value={busqueda}
                  onFocus={() => setMostrarResultados(true)}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/productos?buscar=${encodeURIComponent(busqueda)}`);
                    }
                  }}
                  style={styles.search(darkMode)}
                />
                {busqueda.trim() !== "" && mostrarResultados && (
                  <div style={styles.searchDropdownOverlay}>
                    <div style={styles.searchDropdown(darkMode)}>
                      {productosFiltrados.slice(0, 8).map((p) => (
                        <div key={p.id} style={styles.searchItem(darkMode)} onClick={() => navigate(`/producto/${p.id}`)}>
                          <img src={obtenerImagen(p)} alt={p.nombre} style={styles.searchImage} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, color: darkMode ? "#fff" : "#111827" }}>{p.nombre}</h4>
                            <p style={{ margin: 0, color: darkMode ? "#94a3b8" : "#666" }}>${p.precio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isMobileView && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            padding: '2px 0',
            position: 'relative'
          }}>
            <div className="mobile-top-row" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <div className="mobile-logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain'
                  }}
                />
                <span className="mobile-logo-text" style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  letterSpacing: '0.3px'
                }}>
                  FRAY FLOORING
                </span>
              </div>

              <div className="mobile-social" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <SocialIcon color="#1877F2" href="https://www.facebook.com/people/FRAY-Flooring/61587688868988/" size="small">
                  <FaFacebookF />
                </SocialIcon>
                <SocialIcon color="#E4405F" href="https://www.instagram.com/fray_flooring?igsh=b3pucDR1bjltMGQ2" size="small">
                  <FaInstagram />
                </SocialIcon>
                <SocialIcon color="#010101" href="https://www.tiktok.com/@fray_flooring6" size="small">
                  <FaTiktok />
                </SocialIcon>
                <SocialIcon color="#25D366" href="https://wa.me/525610026370" size="small">
                  <FaWhatsapp />
                </SocialIcon>
                <SocialIcon 
                  color="#FF0000" 
                  href="https://www.youtube.com/@FrayFlooring" 
                  size="small"
                  isYoutube={true}
                >
                  <FaYoutube />
                </SocialIcon>
                <SocialIcon color="#38bdf8" href="tel:+525610026370" size="small">
                  <FaPhone />
                </SocialIcon>
              </div>

              <button 
                onClick={toggleMobileMenu}
                className="mobile-hamburger-btn"
                style={{
                  background: mobileMenuOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(5px)',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 10001,
                  minWidth: '32px'
                }}
              >
                <FaBars size={16} />
              </button>
            </div>

            <div ref={searchRef} style={{ 
              width: '100%',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                value={busqueda}
                onFocus={() => setMostrarResultados(true)}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/productos?buscar=${encodeURIComponent(busqueda)}`);
                  }
                }}
                className="mobile-search-input"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.92)',
                  color: '#111827',
                  transition: '0.3s',
                  backdropFilter: 'blur(10px)',
                  boxSizing: 'border-box'
                }}
              />
              {busqueda.trim() !== "" && mostrarResultados && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: '0',
                  right: '0',
                  background: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  zIndex: 100000,
                  padding: '4px 0'
                }}>
                  {productosFiltrados.slice(0, 8).map((p) => (
                    <div 
                      key={p.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderBottom: darkMode ? '1px solid #374151' : '1px solid #f3f4f6',
                        transition: '0.2s'
                      }}
                      onClick={() => navigate(`/producto/${p.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = darkMode ? '#374151' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <img 
                        src={obtenerImagen(p)} 
                        alt={p.nombre} 
                        style={{
                          width: '35px',
                          height: '35px',
                          objectFit: 'cover',
                          borderRadius: '6px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: darkMode ? '#fff' : '#111827', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {p.nombre}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          color: darkMode ? '#94a3b8' : '#666', 
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          ${p.precio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {mobileMenuOpen && (
              <div className="mobile-dropdown-menu" style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                marginTop: '3px',
                background: darkMode ? '#1f2937' : '#2d2d3f',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                padding: '6px 0',
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto',
                animation: 'slideDown 0.3s ease',
                zIndex: 10000,
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <button className="mobile-menu-item" onClick={() => handleNavigate("/")}>
                  <FaHome size={16} /> Inicio
                </button>

                <button className="mobile-menu-item" onClick={() => handleNavigate("/nosotros")}>
                  <FaInfoCircle size={16} /> Nosotros
                </button>

                <button className="mobile-menu-item" onClick={() => handleNavigate("/contacto")}>
                  <FaEnvelope size={16} /> Contacto
                </button>

                <div className="mobile-divider" />

                <button 
                  className="mobile-categoria-header" 
                  onClick={() => setMenu(!menu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📦 Productos
                  </span>
                  <span>{menu ? '▲' : '▼'}</span>
                </button>

                {menu && (
                  <div style={{ marginLeft: '8px' }}>
                    <button 
                      className="mobile-submenu-item" 
                      onClick={() => handleNavigate("/productos?all=true")}
                      style={{ fontWeight: '600', color: '#22c55e' }}
                    >
                      🛍 Todas
                    </button>
                    {categorias.map(cat => (
                      <div key={cat.id}>
                        <button 
                          className="mobile-submenu-item"
                          onClick={() => handleCategoriaClick(cat.id)}
                          style={{
                            fontWeight: categoriaSeleccionada === cat.id ? '600' : '400',
                            color: categoriaSeleccionada === cat.id ? '#fff' : '#ccc'
                          }}
                        >
                          {cat.nombre} {categoriaSeleccionada === cat.id ? '▼' : '►'}
                        </button>
                        {categoriaSeleccionada === cat.id && (
                          <div style={{ marginLeft: '16px' }}>
                            {subcategorias.filter(sub => Number(sub.categoria_id) === Number(cat.id)).map(sub => (
                              <div key={sub.id}>
                                <button 
                                  className="mobile-submenu-item"
                                  onClick={() => handleMobileSubcategoriaClick(sub.id)}
                                  style={{
                                    fontWeight: subcategoriaSeleccionada === sub.id ? '600' : '400',
                                    color: subcategoriaSeleccionada === sub.id ? '#fff' : '#ccc'
                                  }}
                                >
                                  • {sub.nombre} {subcategoriaSeleccionada === sub.id ? '▼' : '►'}
                                </button>
                                {subcategoriaSeleccionada === sub.id && (
                                  <div style={{ marginLeft: '16px' }}>
                                    {tiposUsar.filter(t => Number(t.subcategoria_id) === Number(sub.id)).map(tipo => (
                                      <button 
                                        key={tipo.id} 
                                        className="mobile-submenu-item"
                                        onClick={() => handleTipoClick(tipo.id)}
                                        style={{ fontSize: '12px', padding: '6px 16px 6px 40px' }}
                                      >
                                        • {tipo.nombre}
                                      </button>
                                    ))}
                                    {tiposUsar.filter(t => Number(t.subcategoria_id) === Number(sub.id)).length === 0 && (
                                      <div style={{ 
                                        fontSize: '11px', 
                                        color: '#6b7280', 
                                        padding: '4px 16px 4px 40px' 
                                      }}>
                                        No hay tipos disponibles
                                      </div>
                                    )}
                                    <button 
                                      className="mobile-submenu-item"
                                      onClick={() => handleSubcategoriaClick(sub.nombre)}
                                      style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '12px' }}
                                    >
                                      📂 Ver toda la subcategoría
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button 
                              className="mobile-submenu-item"
                              onClick={() => handleVerTodasClick(cat.id)}
                              style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              📂 Ver toda la categoría
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mobile-divider" />

                <button className="mobile-menu-item" onClick={() => handleNavigate("/#productos-nuevos")}>
                  <span style={{ 
                    background: '#22c55e',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'inline-block'
                  }}>✨ NUEVOS</span>
                </button>

                <button className="mobile-menu-item" onClick={() => handleNavigate("/favoritos")}>
                  <FaHeart size={16} /> Favoritos ({favoritos.length})
                </button>

                <button className="mobile-menu-item" onClick={() => handleNavigate("/comparar")}>
                  <FaBalanceScale size={16} /> Comparador
                </button>

                <button className="mobile-menu-item" onClick={() => handleNavigate("/cotizador")}>
                  <FaFileInvoice size={16} /> Cotizador
                </button>

                <div className="mobile-divider" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Espaciador */}
      <div 
        className="navbar-spacer"
        style={{ 
          height: isMobileView ? '0px' : `${navbarHeight}px`,
          display: isMobileView ? 'none' : 'block',
          flexShrink: 0,
          width: '100%',
          pointerEvents: 'none'
        }} 
      />
    </>
  );
}

// ========== ESTILOS (EXACTAMENTE IGUALES A LOS ORIGINALES) ==========
const styles = {
  navbar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    maxWidth: "100%",
    padding: "12px 20px",
    background: "#5c5a6a",
    color: "#fff",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5000,
    boxShadow: "0 2px 20px rgba(67,45,215,0.2)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    boxSizing: "border-box"
  },
  topRow: {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    boxSizing: "border-box"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logo: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.2))"
  },
  logoText: {
    margin: 0,
    fontSize: "clamp(18px, 2.2vw, 28px)",
    fontWeight: "900",
    letterSpacing: "1px",
    color: "#fff",
    lineHeight: "1"
  },
  socialDesktop: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  navRow: {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box"
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px"
  },
  navLink: {
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
    fontSize: "clamp(14px, 1vw, 16px)",
    transition: "0.3s ease",
    padding: "6px 14px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    ":hover": {
      background: "rgba(255,255,255,0.12)"
    }
  },
  searchContainer: {
    width: "100%",
    maxWidth: "500px",
    position: "relative"
  },
  searchWrapper: {
    position: "relative",
    width: "100%"
  },
  search: (darkMode) => ({
    width: "100%",
    padding: "10px 18px",
    borderRadius: "25px",
    border: darkMode ? "1px solid #334155" : "1px solid rgba(255,255,255,0.3)",
    outline: "none",
    fontSize: "14px",
    background: darkMode ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)",
    color: darkMode ? "#ffffff" : "#111827",
    transition: "0.3s",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)"
  }),
  searchDropdownOverlay: {
    position: "fixed",
    top: "auto",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 99999,
    pointerEvents: "none"
  },
  searchDropdown: (darkMode) => ({
    position: "absolute",
    top: "10px",
    width: "min(500px, 95%)",
    maxWidth: "95%",
    background: darkMode ? "#111827" : "#ffffff",
    border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
    borderRadius: "15px",
    maxHeight: "400px",
    overflowY: "auto",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    pointerEvents: "auto",
    zIndex: 100000
  }),
  searchItem: (darkMode) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    background: darkMode ? "#111827" : "#ffffff",
    borderBottom: darkMode ? "1px solid #1e293b" : "1px solid #f3f4f6",
    transition: "0.2s",
    ":hover": {
      background: darkMode ? "#1f2937" : "#f3f4f6"
    }
  }),
  searchImage: {
    width: "45px",
    height: "45px",
    objectFit: "cover",
    borderRadius: "8px"
  },
  nuevosBadge: {
    background: "#22c55e",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "999px",
    display: "inline-block"
  },
  menu: {
    position: "relative"
  },
  dropdownOverlay: {
    position: "fixed",
    top: "auto",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 99998,
    pointerEvents: "none"
  },
  dropdownContainer: {
    position: "absolute",
    top: "8px",
    display: "flex",
    gap: "4px",
    pointerEvents: "auto",
    backgroundColor: "transparent",
    minWidth: "600px",
    maxWidth: "900px",
    width: "auto"
  },
  dropdown: (darkMode) => ({
    background: darkMode ? "#111827" : "#ffffff",
    minWidth: "200px",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    padding: "6px 0",
    flex: 1
  }),
  submenu: (darkMode) => ({
    background: darkMode ? "#1f2937" : "#f9fafb",
    minWidth: "200px",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    padding: "6px 0",
    flex: 1
  }),
  dropdownCategory: (darkMode) => ({
    padding: "8px 16px",
    cursor: "pointer",
    color: darkMode ? "#fff" : "#111",
    fontWeight: "600",
    margin: 0,
    fontSize: "13px",
    transition: "0.2s",
    ":hover": {
      background: darkMode ? "#1f2937" : "#f3f4f6"
    }
  }),
  dropdownSubcategory: (darkMode) => ({
    padding: "6px 16px",
    cursor: "pointer",
    color: darkMode ? "#d1d5db" : "#374151",
    margin: 0,
    fontSize: "13px",
    transition: "0.2s",
    ":hover": {
      background: darkMode ? "#374151" : "#e5e7eb",
      color: darkMode ? "#fff" : "#111"
    }
  }),
  darkModeBtn: {
    background: "transparent",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "clamp(14px, 1vw, 16px)",
    padding: "6px 14px",
    borderRadius: "8px",
    transition: "0.3s",
    ":hover": {
      background: "rgba(255,255,255,0.12)"
    }
  }
};