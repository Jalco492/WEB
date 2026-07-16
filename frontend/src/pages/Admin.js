import { useEffect, useState } from "react";
import api from "../services/api";

export default function Admin() {
  // 🟢 PRODUCTOS
  const [productos, setProductos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [contactos, setContactos] = useState([]);
  
  // 🔵 BANNERS
  const [banners, setBanners] = useState([]);
  
  // 🟣 EDITANDO
  const [editando, setEditando] = useState(null);
  
  // 📂 CATEGORÍAS
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  
  // 🆕 TIPOS
  const [tipos, setTipos] = useState([]);
  
  // ➕ NUEVA CATEGORÍA
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  
  // ➕ NUEVO TIPO
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [subcategoriaSeleccionadaParaTipo, setSubcategoriaSeleccionadaParaTipo] = useState("");
  
  // ✏️ EDITAR CATEGORÍA
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [nombreCategoriaEditada, setNombreCategoriaEditada] = useState("");
  
  // ✏️ EDITAR SUBCATEGORÍA
  const [editandoSubcategoria, setEditandoSubcategoria] = useState(null);
  const [nombreSubcategoriaEditada, setNombreSubcategoriaEditada] = useState("");
  
  // ✏️ EDITAR TIPO
  const [editandoTipo, setEditandoTipo] = useState(null);
  const [nombreTipoEditado, setNombreTipoEditado] = useState("");
  const [subcategoriaParaTipoEditado, setSubcategoriaParaTipoEditado] = useState("");
  
  const [cargandoToggle, setCargandoToggle] = useState(false);
  const [detalleCotizacion, setDetalleCotizacion] = useState([]);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [archivosImagenes, setArchivosImagenes] = useState([]);
  const [fechaOferta, setFechaOferta] = useState("");
  
  const handleImagenes = (e) => {
    setArchivosImagenes(Array.from(e.target.files));
  };
  
  const [archivoFicha, setArchivoFicha] = useState(null);
  const handleFichaTecnica = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoFicha(file);
    setForm({
      ...form,
      fichaTecnica: URL.createObjectURL(file)
    });
  };
  
  // 🟢 FORM PRODUCTOS
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precioOferta: "",
    oferta: false,
    rebaja: false,
    stock: "",
    imagenes: "",
    categoria_id: "",
    subcategoria_id: "",
    tipo_id: "", // NUEVO campo
    destacado: false,
    nuevo: false,
    fichaTecnica: "",
    sku: "",
    tipoProducto: "normal",
    presentacion: "",
    ancho: "",
    alto: "",
    grueso: "",
    cobertura: "",
    tipoVenta: "pieza",
    tipoCobertura: "m2",
    piezasCaja: "",
    especificaciones: "",
    informacionAdicional: "",
    variante: ""
  });
  
  // 🟡 FORM BANNERS
  const [bannerForm, setBannerForm] = useState({
    titulo: "",
    descripcion: "",
    imagen: "",
    categoria: "",
    subcategoria: ""
  });
  
  const [archivoBanner, setArchivoBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState("");
  
  useEffect(() => {
    cargar();
    cargarBanners();
    cargarCategorias();
    cargarSubcategorias();
    cargarTipos();
    cargarContactos();
  }, []);
  
  // CARAGAR CONTACTOS
  const cargarContactos = () => {
    api.get("/contactos")
      .then(res => setContactos(res.data))
      .catch(err => console.log(err));
  };
  
  const eliminarContacto = (id) => {
    if (!window.confirm("¿Eliminar mensaje?")) return;
    api.delete(`/contactos/${id}`)
      .then(() => cargarContactos())
      .catch(console.log);
  };
  
  // 🟢 CARGAR PRODUCTOS
  const cargar = () => {
    api.get("/admin/productos")
      .then(res => setProductos(res.data));
  };
  
  // 🔵 CARGAR BANNERS
  const cargarBanners = () => {
    api.get("/banners")
      .then(res => setBanners(res.data));
  };
  
  // 📂 CARGAR CATEGORÍAS
  const cargarCategorias = () => {
    api.get("/categorias")
      .then(res => setCategorias(res.data));
  };
  
  // 📂 CARGAR SUBCATEGORÍAS
  const cargarSubcategorias = () => {
    api.get("/subcategorias")
      .then(res => setSubcategorias(res.data));
  };
  
  // 🆕 CARGAR TIPOS
  const cargarTipos = () => {
    api.get("/tipos")
      .then(res => setTipos(res.data))
      .catch(err => console.log(err));
  };
  
  // 🟣 HANDLE PRODUCTOS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  // 🟡 HANDLE BANNERS
  const handleBannerChange = (e) => {
    setBannerForm({
      ...bannerForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleBannerImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivoBanner(file);
    setPreviewBanner(URL.createObjectURL(file));
  };
  
  // ➕ CREAR CATEGORÍA
  const crearCategoria = () => {
    if (!nuevaCategoria) return alert("Escribe una categoría");
    api.post("/categorias", { nombre: nuevaCategoria })
      .then(() => {
        cargarCategorias();
        setNuevaCategoria("");
        alert("✅ Categoría creada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al crear categoría");
      });
  };
  
  // ➕ CREAR SUBCATEGORÍA
  const crearSubcategoria = () => {
    if (!nuevaSubcategoria || !categoriaSeleccionada) return alert("Completa los datos");
    api.post("/subcategorias", {
      nombre: nuevaSubcategoria,
      categoria_id: categoriaSeleccionada
    })
      .then(() => {
        cargarSubcategorias();
        setNuevaSubcategoria("");
        alert("✅ Subcategoría creada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al crear subcategoría");
      });
  };
  
  // ➕ CREAR TIPO
  const crearTipo = () => {
    if (!nuevoTipo || !subcategoriaSeleccionadaParaTipo) return alert("Completa los datos");
    api.post("/tipos", {
      nombre: nuevoTipo,
      subcategoria_id: subcategoriaSeleccionadaParaTipo
    })
      .then(() => {
        cargarTipos();
        setNuevoTipo("");
        setSubcategoriaSeleccionadaParaTipo("");
        alert("✅ Tipo creado");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al crear tipo");
      });
  };
  
  // 🗑 ELIMINAR CATEGORÍA
  const eliminarCategoria = (id) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    api.delete(`/categorias/${id}`)
      .then(() => {
        cargarCategorias();
        alert("✅ Categoría eliminada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al eliminar categoría");
      });
  };
  
  // 🗑 ELIMINAR SUBCATEGORÍA
  const eliminarSubcategoria = (id) => {
    if (!window.confirm("¿Eliminar subcategoría?")) return;
    api.delete(`/subcategorias/${id}`)
      .then(() => {
        cargarSubcategorias();
        alert("✅ Subcategoría eliminada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al eliminar subcategoría");
      });
  };
  
  // 🗑 ELIMINAR TIPO
  const eliminarTipo = (id) => {
    if (!window.confirm("¿Eliminar tipo?")) return;
    api.delete(`/tipos/${id}`)
      .then(() => {
        cargarTipos();
        alert("✅ Tipo eliminado");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al eliminar tipo");
      });
  };
  
  // ✏️ ACTUALIZAR CATEGORÍA
  const actualizarCategoria = (id) => {
    api.put(`/categorias/${id}`, { nombre: nombreCategoriaEditada })
      .then(() => {
        cargarCategorias();
        setEditandoCategoria(null);
        setNombreCategoriaEditada("");
        alert("✅ Categoría actualizada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al actualizar categoría");
      });
  };
  
  // ✏️ ACTUALIZAR SUBCATEGORÍA
  const actualizarSubcategoria = (id) => {
    api.put(`/subcategorias/${id}`, { nombre: nombreSubcategoriaEditada })
      .then(() => {
        cargarSubcategorias();
        setEditandoSubcategoria(null);
        setNombreSubcategoriaEditada("");
        alert("✅ Subcategoría actualizada");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al actualizar subcategoría");
      });
  };
  
  // ✏️ ACTUALIZAR TIPO
  const actualizarTipo = (id) => {
    if (!nombreTipoEditado || !subcategoriaParaTipoEditado) return alert("Completa los datos");
    api.put(`/tipos/${id}`, {
      nombre: nombreTipoEditado,
      subcategoria_id: subcategoriaParaTipoEditado
    })
      .then(() => {
        cargarTipos();
        setEditandoTipo(null);
        setNombreTipoEditado("");
        setSubcategoriaParaTipoEditado("");
        alert("✅ Tipo actualizado");
      })
      .catch(err => {
        console.log(err);
        alert("❌ Error al actualizar tipo");
      });
  };
  
  const toggleCategoriaDestacada = (cat) => {
    api.put(`/categorias/${cat.id}`, {
      destacada: cat.destacada === 1 || cat.destacada === true ? 0 : 1
    })
      .then(() => cargarCategorias())
      .catch(err => {
        console.log(err);
        alert("Error al actualizar categoría");
      });
  };
  
  // 🟢 CREAR PRODUCTO
  const crearProducto = async () => {
    try {
      let imagenesGuardadas = "";
      if (archivosImagenes.length > 0) {
        const formData = new FormData();
        archivosImagenes.forEach(imagen => formData.append("imagenes", imagen));
        const uploadRes = await api.post("/upload-productos", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imagenesGuardadas = uploadRes.data.join(",");
      }
      await api.post("/productos", {
        ...form,
        imagenes: imagenesGuardadas,
        sugerencias
      });
      cargar();
      limpiar();
      setArchivosImagenes([]);
      setSugerencias([]);
      alert("✅ Producto creado");
    } catch (err) {
      console.log(err);
      alert("❌ Error al crear producto");
    }
  };
  
  // EDITAR PRODUCTO
  const editar = (p) => {
    setForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precio: p.precio || "",
      precioOferta: p.precioOferta || "",
      oferta: p.oferta === 1 || p.oferta === true,
      rebaja: p.rebaja === 1 || p.rebaja === true,
      stock: p.stock || "",
      imagenes: p.imagenes || "",
      categoria_id: p.categoria_id || "",
      subcategoria_id: p.subcategoria_id || "",
      tipo_id: p.tipo_id || "",
      destacado: p.destacado === 1 || p.destacado === true,
      fichaTecnica: p.fichaTecnica || "",
      especificaciones: p.especificaciones || "",
      informacionAdicional: p.informacionAdicional || "",
      sku: p.sku || "",
      tipoProducto: p.tipoProducto || "normal",
      presentacion: p.presentacion || "",
      ancho: p.ancho || "",
      alto: p.alto || "",
      grueso: p.grueso || "",
      cobertura: p.cobertura || "",
      tipoVenta: p.tipoVenta || "pieza",
      piezasCaja: p.piezasCaja || "",
      tipoCobertura: p.tipoCobertura || "m2",
      variante: p.variante || ""
    });
    setSugerencias(p.sugerencias ? JSON.parse(p.sugerencias) : []);
    setEditando(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // 🟣 ACTUALIZAR PRODUCTO
  const actualizarProducto = async () => {
    try {
      let imagenesGuardadas = form.imagenes;
      if (archivosImagenes.length > 0) {
        const formData = new FormData();
        archivosImagenes.forEach(imagen => formData.append("imagenes", imagen));
        const uploadRes = await api.post("/upload-productos", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imagenesGuardadas = uploadRes.data.join(",");
      }
      await api.put(`/productos/${editando}`, {
        ...form,
        imagenes: imagenesGuardadas,
        sugerencias
      });
      cargar();
      limpiar();
      setArchivosImagenes([]);
      setSugerencias([]);
      setEditando(null);
      alert("✅ Producto actualizado");
    } catch (err) {
      console.log(err);
      alert("❌ Error al actualizar");
    }
  };
  
  // 🔴 ELIMINAR PRODUCTO
  const eliminar = (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    api.delete(`/productos/${id}`).then(() => cargar());
  };
  
  // 🟢 CREAR BANNER
  const crearBanner = async () => {
    try {
      let imagenBanner = "";
      if (archivoBanner) {
        const formData = new FormData();
        formData.append("imagen", archivoBanner);
        const uploadRes = await api.post("/upload-banner", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imagenBanner = uploadRes.data.imagen;
      }
      await api.post("/banners", {
        ...bannerForm,
        imagen: imagenBanner
      });
      cargarBanners();
      setBannerForm({ titulo: "", descripcion: "", imagen: "", categoria: "", subcategoria: "" });
      setArchivoBanner(null);
      setPreviewBanner("");
      alert("✅ Banner creado");
    } catch (err) {
      console.log(err);
      alert("❌ Error creando banner");
    }
  };
  
  // 🔴 ELIMINAR BANNER
  const eliminarBanner = (id) => {
    api.delete(`/banners/${id}`).then(() => cargarBanners());
  };
  
  // 🧹 LIMPIAR
  const limpiar = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      precioOferta: "",
      oferta: false,
      rebaja: false,
      stock: "",
      imagenes: "",
      categoria_id: "",
      subcategoria_id: "",
      tipo_id: "",
      destacado: false,
      fichaTecnica: "",
      sku: "",
      tipoProducto: "normal",
      presentacion: "",
      ancho: "",
      alto: "",
      grueso: "",
      cobertura: "",
      tipoVenta: "pieza",
      tipoCobertura: "m2",
      piezasCaja: "",
      especificaciones: "",
      informacionAdicional: "",
      variante: ""
    });
    setSugerencias([]);
  };
  
  const toggleVisibleProducto = (producto) => {
    api.put(`/productos/${producto.id}/visible`, {
      visible: producto.visible === 1 || producto.visible === true ? 0 : 1
    })
      .then(() => cargar())
      .catch(err => {
        console.log(err);
        alert("Error al cambiar visibilidad");
      });
  };
  
  return (
    <div className="admin-container">
      {/* HEADER */}
      <header className="admin-header">
        <div className="header-content">
          <h1>🟣 Panel Admin</h1>
          <p className="header-subtitle">Gestiona tu tienda desde un solo lugar</p>
        </div>
      </header>

      {/* 📊 ESTADÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <span className="stat-number">{productos.length}</span>
          <span className="stat-label">Productos</span>
        </div>
        <div className="stat-card stat-purple">
          <span className="stat-number">{categorias.length}</span>
          <span className="stat-label">Categorías</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-number">{subcategorias.length}</span>
          <span className="stat-label">Subcategorías</span>
        </div>
        <div className="stat-card stat-indigo">
          <span className="stat-number">{tipos.length}</span>
          <span className="stat-label">Tipos</span>
        </div>
        <div className="stat-card stat-orange">
          <span className="stat-number">{banners.length}</span>
          <span className="stat-label">Banners</span>
        </div>
        <div className="stat-card stat-red">
          <span className="stat-number">{contactos.length}</span>
          <span className="stat-label">Mensajes</span>
        </div>
      </div>

      {/* TOP FORMS */}
      <div className="top-forms">
        <section className="section-card">
          <h2>📂 Crear categoría</h2>
          <div className="form-group">
            <input
              placeholder="Nombre categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="form-input"
            />
            <button className="btn-primary" onClick={crearCategoria}>
              Crear categoría
            </button>
          </div>
        </section>

        <section className="section-card">
          <h2>📁 Crear subcategoría</h2>
          <div className="form-group">
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="form-input"
            >
              <option value="">Selecciona categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <input
              placeholder="Nombre subcategoría"
              value={nuevaSubcategoria}
              onChange={(e) => setNuevaSubcategoria(e.target.value)}
              className="form-input"
            />
            <button className="btn-primary" onClick={crearSubcategoria}>
              Crear subcategoría
            </button>
          </div>
        </section>

        <section className="section-card">
          <h2>🏷️ Crear Tipo</h2>
          <div className="form-group">
            <select
              value={subcategoriaSeleccionadaParaTipo}
              onChange={(e) => setSubcategoriaSeleccionadaParaTipo(e.target.value)}
              className="form-input"
            >
              <option value="">Selecciona subcategoría</option>
              {subcategorias.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.nombre} ({categorias.find(c => c.id === sub.categoria_id)?.nombre})
                </option>
              ))}
            </select>
            <input
              placeholder="Nombre del Tipo (ej: A, B, C, Premium)"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="form-input"
            />
            <button className="btn-primary" onClick={crearTipo}>
              Crear Tipo
            </button>
          </div>
        </section>
      </div>

      {/* CATEGORÍAS */}
      <section className="section-card">
        <h2>📂 Categorías</h2>
        {categorias.map(cat => (
          <div key={cat.id} className="category-item">
            <div className="category-name">
              {editandoCategoria === cat.id ? (
                <input
                  value={nombreCategoriaEditada}
                  onChange={(e) => setNombreCategoriaEditada(e.target.value)}
                  className="form-input"
                />
              ) : (
                <strong>{cat.nombre}</strong>
              )}
            </div>
            <div className="category-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={cat.destacada === 1 || cat.destacada === true}
                  onChange={() => toggleCategoriaDestacada(cat)}
                />
                Destacada
              </label>
              {editandoCategoria === cat.id ? (
                <button className="btn-edit" onClick={() => actualizarCategoria(cat.id)}>
                  💾 Guardar
                </button>
              ) : (
                <button className="btn-edit" onClick={() => {
                  setEditandoCategoria(cat.id);
                  setNombreCategoriaEditada(cat.nombre);
                }}>
                  ✏️ Editar
                </button>
              )}
              <button className="btn-delete" onClick={() => eliminarCategoria(cat.id)}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* SUBCATEGORÍAS */}
      <section className="section-card">
        <h2>📁 Subcategorías</h2>
        {subcategorias.map(sub => (
          <div key={sub.id} className="category-item">
            <div className="category-name">
              {editandoSubcategoria === sub.id ? (
                <input
                  value={nombreSubcategoriaEditada}
                  onChange={(e) => setNombreSubcategoriaEditada(e.target.value)}
                  className="form-input"
                />
              ) : (
                <div>
                  <strong>{sub.nombre}</strong>
                  <p className="text-muted">
                    {categorias.find(c => c.id === sub.categoria_id)?.nombre}
                  </p>
                </div>
              )}
            </div>
            <div className="category-actions">
              {editandoSubcategoria === sub.id ? (
                <button className="btn-edit" onClick={() => actualizarSubcategoria(sub.id)}>
                  💾 Guardar
                </button>
              ) : (
                <button className="btn-edit" onClick={() => {
                  setEditandoSubcategoria(sub.id);
                  setNombreSubcategoriaEditada(sub.nombre);
                }}>
                  ✏️ Editar
                </button>
              )}
              <button className="btn-delete" onClick={() => eliminarSubcategoria(sub.id)}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* TIPOS */}
      <section className="section-card">
        <h2>🏷️ Tipos</h2>
        {tipos.map(tipo => (
          <div key={tipo.id} className="category-item">
            <div className="category-name">
              {editandoTipo === tipo.id ? (
                <div>
                  <input
                    value={nombreTipoEditado}
                    onChange={(e) => setNombreTipoEditado(e.target.value)}
                    className="form-input"
                    placeholder="Nombre del tipo"
                  />
                  <select
                    value={subcategoriaParaTipoEditado}
                    onChange={(e) => setSubcategoriaParaTipoEditado(e.target.value)}
                    className="form-input"
                    style={{ marginTop: '8px' }}
                  >
                    <option value="">Selecciona subcategoría</option>
                    {subcategorias.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nombre} ({categorias.find(c => c.id === sub.categoria_id)?.nombre})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <strong>{tipo.nombre}</strong>
                  <p className="text-muted">
                    {subcategorias.find(s => s.id === tipo.subcategoria_id)?.nombre} - 
                    {categorias.find(c => c.id === subcategorias.find(s => s.id === tipo.subcategoria_id)?.categoria_id)?.nombre}
                  </p>
                </div>
              )}
            </div>
            <div className="category-actions">
              {editandoTipo === tipo.id ? (
                <button className="btn-edit" onClick={() => actualizarTipo(tipo.id)}>
                  💾 Guardar
                </button>
              ) : (
                <button className="btn-edit" onClick={() => {
                  setEditandoTipo(tipo.id);
                  setNombreTipoEditado(tipo.nombre);
                  setSubcategoriaParaTipoEditado(tipo.subcategoria_id);
                }}>
                  ✏️ Editar
                </button>
              )}
              <button className="btn-delete" onClick={() => eliminarTipo(tipo.id)}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))}
        {tipos.length === 0 && (
          <p className="empty-state">No hay tipos creados</p>
        )}
      </section>

      {/* 🟢 FORM PRODUCTOS */}
      <section className="section-card">
        <h2>{editando ? "✏️ Editar producto" : "➕ Crear producto"}</h2>
        <div className="form-grid">
          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="form-input"
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="form-textarea"
          />
          <input
            name="precio"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            className="form-input"
          />
          <input
            name="precioOferta"
            placeholder="Precio oferta"
            value={form.precioOferta}
            onChange={handleChange}
            className="form-input"
          />
          <input
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="form-input"
          />
          <input
            name="sku"
            placeholder="SKU del producto"
            value={form.sku}
            onChange={handleChange}
            className="form-input"
          />
          
          <select
            name="tipoProducto"
            value={form.tipoProducto}
            onChange={handleChange}
            className="form-input"
          >
            <option value="normal">Producto normal</option>
            <option value="pegamento">Pegamento</option>
          </select>

          {form.tipoProducto !== "pegamento" && (
            <div className="input-group">
              <input
                name="ancho"
                placeholder="Ancho (cm)"
                value={form.ancho}
                onChange={handleChange}
                className="form-input"
              />
              <input
                name="alto"
                placeholder="Alto (cm)"
                value={form.alto}
                onChange={handleChange}
                className="form-input"
              />
              <input
                name="grueso"
                placeholder="Grueso (cm)"
                value={form.grueso}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          )}

          {form.tipoProducto === "pegamento" && (
            <div>
              <label className="form-label">🧴 Presentación</label>
              <select
                name="presentacion"
                value={form.presentacion}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Selecciona presentación</option>
                <option value="250ml">250 ml</option>
                <option value="500ml">500 ml</option>
                <option value="1L">1 Litro</option>
                <option value="3.6L">3.6 Litros</option>
                <option value="4L">4 Litros</option>
                <option value="19L">19 Litros</option>
              </select>
            </div>
          )}

          <select
            name="tipoVenta"
            value={form.tipoVenta}
            onChange={handleChange}
            className="form-input"
          >
            <option value="pieza">Pieza</option>
            <option value="caja">Caja</option>
            <option value="rollo">Rollo</option>
            <option value="tramo">Tramo</option>
            <option value="unidad">Unidad</option>
          </select>

          {form.tipoVenta === "caja" && (
            <input
              name="piezasCaja"
              placeholder="¿Cuántas piezas trae la caja?"
              value={form.piezasCaja}
              onChange={handleChange}
              className="form-input"
            />
          )}

          <div className="input-group">
            <input
              name="cobertura"
              placeholder="Cobertura"
              value={form.cobertura}
              onChange={handleChange}
              className="form-input"
            />
            <select
              name="tipoCobertura"
              value={form.tipoCobertura}
              onChange={handleChange}
              className="form-input"
            >
              <option value="m2">m²</option>
              <option value="ml">Lineal (ml)</option>
            </select>
          </div>

          <select
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Selecciona categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <select
            name="subcategoria_id"
            value={form.subcategoria_id}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Selecciona subcategoría</option>
            {subcategorias
              .filter(sub => String(sub.categoria_id) === String(form.categoria_id))
              .map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
          </select>

          <select
            name="tipo_id"
            value={form.tipo_id}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Selecciona Tipo</option>
            {tipos
              .filter(tipo => String(tipo.subcategoria_id) === String(form.subcategoria_id))
              .map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
          </select>

          <input
            name="variante"
            placeholder="Variante (opcional)"
            value={form.variante}
            onChange={handleChange}
            className="form-input"
          />

          <div className="form-group">
            <label className="form-label">Productos sugeridos</label>
            <select
              multiple
              value={sugerencias}
              onChange={(e) =>
                setSugerencias([...e.target.selectedOptions].map(option => option.value))
              }
              className="form-multiselect"
            >
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagenes}
            className="form-input"
          />

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFichaTecnica}
            className="form-input"
          />

          {form.fichaTecnica && (
            <div>
              <p className="form-label">Vista previa ficha técnica</p>
              <img src={form.fichaTecnica} alt="Ficha" className="preview-image" />
            </div>
          )}

          <textarea
            name="especificaciones"
            placeholder="Especificaciones"
            value={form.especificaciones}
            onChange={handleChange}
            className="form-textarea"
          />

          <textarea
            name="informacionAdicional"
            placeholder="Información adicional"
            value={form.informacionAdicional}
            onChange={handleChange}
            className="form-textarea"
          />

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="destacado"
                checked={form.destacado}
                onChange={handleChange}
              />
              Producto destacado
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="oferta"
                checked={form.oferta}
                onChange={handleChange}
              />
              Producto en oferta
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rebaja"
                checked={form.rebaja}
                onChange={handleChange}
              />
              Producto en rebaja
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="nuevo"
                checked={form.nuevo}
                onChange={handleChange}
              />
              Producto nuevo
            </label>
          </div>

          {form.imagenes && (
            <div className="image-grid">
              {form.imagenes.split(",").map((img, i) => (
                <img key={i} src={img.trim()} alt="" className="preview-thumb" />
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={editando ? actualizarProducto : crearProducto}>
            {editando ? "Actualizar producto" : "Crear producto"}
          </button>
        </div>
      </section>

      {/* ⏰ TIMER */}
      <section className="section-card timer-section">
        <h2>⏰ Configurar tiempo de ofertas</h2>
        <p>Selecciona la fecha y hora de finalización</p>
        <input
          type="datetime-local"
          onChange={(e) => setFechaOferta(e.target.value)}
          className="form-input"
        />
        <button
          className="btn-timer"
          onClick={() => {
            if (!fechaOferta) return;
            const fecha = new Date(fechaOferta);
            if (isNaN(fecha.getTime())) return;
            localStorage.setItem("fechaOferta", fecha.toISOString());
            alert("Tiempo guardado");
          }}
        >
          💾 Guardar configuración
        </button>
      </section>

      {/* 🔵 LISTA PRODUCTOS */}
      <section className="section-card">
        <h2>📦 Lista productos</h2>
        {productos.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-info">
              <img
                src={p.imagenes ? p.imagenes.split(",")[0] : "https://via.placeholder.com/120"}
                alt={p.nombre}
                className="product-image"
                onError={(e) => e.target.src = "https://via.placeholder.com/120"}
              />
              <div className="product-details">
                <h3>{p.nombre}</h3>
                <p>🔖 SKU: {p.sku}</p>
                {p.variante && <p className="text-muted">🔖 Variante: {p.variante}</p>}
                {p.tipo_id && tipos.find(t => t.id === p.tipo_id) && (
                  <p>🏷️ Tipo: {tipos.find(t => t.id === p.tipo_id)?.nombre}</p>
                )}
                <div className="status-badge">
                  {p.visible === 0 || p.visible === false ? (
                    <span className="badge-hidden">🚫 Oculto</span>
                  ) : (
                    <span className="badge-visible">👁 Visible</span>
                  )}
                </div>
                {p.tipoProducto === "pegamento" ? (
                  <p>🧴 Presentación: {p.presentacion}</p>
                ) : (
                  <p>📏 {p.ancho}cm x {p.grueso}cm x {p.alto}cm</p>
                )}
                <p>📦 Cobertura: {p.cobertura} {p.tipoCobertura}</p>
                <p>🚚 Venta: {p.tipoVenta}</p>
                <p>💲 {p.precio}</p>
                <p>📂 Categoría: {p.categoria || "Sin categoría"}</p>
                <p>📁 Subcategoría: {p.subcategoria || "Sin subcategoría"}</p>
                {(p.oferta === 1 || p.oferta === true) && (
                  <p className="text-oferta">🔥 Oferta: ${p.precioOferta}</p>
                )}
                {(p.rebaja === 1 || p.rebaja === true) && (
                  <span className="badge-rebaja">🏷 Rebaja</span>
                )}
                <p>📦 Stock: {p.stock}</p>
                {p.fichaTecnica && <p className="text-success">📄 Tiene ficha técnica</p>}
                {(p.destacado === 1 || p.destacado === true) && (
                  <span className="badge-destacado">⭐ Destacado</span>
                )}
              </div>
            </div>

            {/* PRODUCTOS SUGERIDOS */}
            {p.sugerencias && JSON.parse(p.sugerencias).length > 0 && (
              <div className="sugerencias-container">
                <strong>Recomendado para este producto</strong>
                <div className="sugerencias-list">
                  {JSON.parse(p.sugerencias).map((id) => {
                    const prod = productos.find(x => x.id === Number(id));
                    if (!prod) return null;
                    return (
                      <div key={id} className="sugerencia-card">
                        <img
                          src={prod.imagenes ? prod.imagenes.split(",")[0] : "https://via.placeholder.com/80"}
                          alt={prod.nombre}
                          className="sugerencia-image"
                        />
                        <p className="sugerencia-name">{prod.nombre}</p>
                        <p className="sugerencia-price">${prod.precio}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="product-actions">
              <button className="btn-visibility" onClick={() => toggleVisibleProducto(p)}>
                {p.visible ? "👁 Visible" : "🚫 Oculto"}
              </button>
              <button className="btn-edit" onClick={() => editar(p)}>✏️ Editar</button>
              <button className="btn-delete" onClick={() => eliminar(p.id)}>🗑 Eliminar</button>
            </div>
          </div>
        ))}
      </section>

      {/* 📩 CONTACTOS */}
      <section className="section-card">
        <h2>📩 Mensajes de Contacto</h2>
        {contactos.length === 0 ? (
          <div className="empty-state">No hay mensajes recibidos</div>
        ) : (
          contactos.map(contacto => (
            <div key={contacto.id} className="contact-card">
              <div className="contact-header">
                <div className="contact-header-info">
                  <h3>👤 {contacto.nombre}</h3>
                  <span className="contact-date">
                    {new Date(contacto.fecha).toLocaleString("es-MX")}
                  </span>
                </div>
                <button className="btn-delete" onClick={() => eliminarContacto(contacto.id)}>
                  🗑 Eliminar
                </button>
              </div>
              <div className="contact-grid">
                <div className="info-box">
                  <strong>📧 Correo</strong>
                  <p className="info-box-text">{contacto.correo}</p>
                </div>
                <div className="info-box">
                  <strong>📱 Teléfono</strong>
                  <p className="info-box-text">{contacto.telefono}</p>
                </div>
                {contacto.empresa && (
                  <div className="info-box">
                    <strong>🏢 Empresa</strong>
                    <p className="info-box-text">{contacto.empresa}</p>
                  </div>
                )}
              </div>
              <div className="message-box">
                <strong>💬 Mensaje</strong>
                <p className="message-text">{contacto.mensaje}</p>
              </div>
            </div>
          ))
        )}
      </section>

      {/* 🟡 FORM BANNERS */}
      <section className="section-card">
        <h2>🔥 Banner promociones</h2>
        <div className="form-grid">
          <input
            name="titulo"
            placeholder="Título"
            value={bannerForm.titulo}
            onChange={handleBannerChange}
            className="form-input"
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={bannerForm.descripcion}
            onChange={handleBannerChange}
            className="form-textarea"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImagen}
            className="form-input"
          />
          <select
            name="categoria"
            value={bannerForm.categoria}
            onChange={handleBannerChange}
            className="form-input"
          >
            <option value="">Selecciona categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
          <select
            name="subcategoria"
            value={bannerForm.subcategoria}
            onChange={handleBannerChange}
            className="form-input"
          >
            <option value="">Selecciona subcategoría</option>
            {subcategorias
              .filter(sub => {
                const categoria = categorias.find(cat => cat.nombre === bannerForm.categoria);
                return String(sub.categoria_id) === String(categoria?.id);
              })
              .map(sub => (
                <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
              ))}
          </select>
          {previewBanner && (
            <img src={previewBanner} alt="Preview" className="banner-preview" />
          )}
          <button className="btn-primary" onClick={crearBanner}>
            Crear banner
          </button>
        </div>
      </section>

      {/* 🔥 LISTA BANNERS */}
      <section className="section-card">
        <h2>🖼 Lista banners</h2>
        {banners.map(b => (
          <div key={b.id} className="banner-card">
            <img src={b.imagen} alt={b.titulo} className="banner-image" />
            <div className="banner-info">
              <h3>{b.titulo}</h3>
              <p>{b.descripcion}</p>
              {b.categoria && <p className="banner-category">📂 Categoría: {b.categoria}</p>}
              {b.subcategoria && <p className="banner-category">📁 Subcategoría: {b.subcategoria}</p>}
            </div>
            <button className="btn-delete" onClick={() => eliminarBanner(b.id)}>
              🗑 Eliminar
            </button>
          </div>
        ))}
      </section>

      {/* ESTILOS (CSS inyectado) */}
      <style jsx>{`
        /* RESET & BASE */
        * {
          box-sizing: border-box;
        }

        .admin-container {
          min-height: 100vh;
          background: #f0f2f8;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          overflow-x: hidden;
        }

        @media (min-width: 768px) {
          .admin-container {
            padding: 24px 32px;
          }
        }

        /* HEADER */
        .admin-header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 20px;
          padding: 24px 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);
        }

        @media (min-width: 768px) {
          .admin-header {
            padding: 32px 40px;
            border-radius: 24px;
            margin-bottom: 30px;
          }
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header h1 {
          color: #fff;
          font-size: 24px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          margin: 6px 0 0 0;
        }

        @media (min-width: 480px) {
          .admin-header h1 {
            font-size: 28px;
          }
          .header-subtitle {
            font-size: 16px;
          }
        }

        @media (min-width: 768px) {
          .admin-header h1 {
            font-size: 36px;
          }
          .header-subtitle {
            font-size: 18px;
          }
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (min-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
        }

        .stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 12px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        @media (min-width: 480px) {
          .stat-card {
            padding: 20px 16px;
            border-radius: 20px;
          }
        }

        .stat-number {
          font-size: 20px;
          font-weight: 900;
          display: block;
          color: #1f2937;
        }

        .stat-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (min-width: 480px) {
          .stat-number {
            font-size: 26px;
          }
          .stat-label {
            font-size: 12px;
          }
        }

        @media (min-width: 768px) {
          .stat-number {
            font-size: 32px;
          }
          .stat-label {
            font-size: 14px;
          }
        }

        .stat-blue .stat-number { color: #3b82f6; }
        .stat-purple .stat-number { color: #7c3aed; }
        .stat-green .stat-number { color: #10b981; }
        .stat-indigo .stat-number { color: #4f46e5; }
        .stat-orange .stat-number { color: #f59e0b; }
        .stat-red .stat-number { color: #ef4444; }

        /* TOP FORMS */
        .top-forms {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .top-forms {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 30px;
          }
        }

        /* SECTION CARDS */
        .section-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          width: 100%;
        }

        @media (min-width: 768px) {
          .section-card {
            padding: 28px 32px;
            border-radius: 24px;
            margin-bottom: 30px;
          }
        }

        .section-card h2 {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          margin-top: 0;
          margin-bottom: 16px;
        }

        @media (min-width: 768px) {
          .section-card h2 {
            font-size: 22px;
            margin-bottom: 20px;
          }
        }

        /* FORM ELEMENTS */
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }

        .form-input,
        .form-textarea {
          padding: 12px 14px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s ease;
          background: #fafbfc;
          width: 100%;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #7c3aed;
          background: #fff;
        }

        @media (min-width: 768px) {
          .form-input,
          .form-textarea {
            padding: 14px 16px;
            font-size: 15px;
          }
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .form-multiselect {
          width: 100%;
          min-height: 120px;
          padding: 10px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: #fafbfc;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
          display: block;
          font-size: 14px;
        }

        .input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (min-width: 768px) {
          .input-group {
            gap: 14px;
          }
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 8px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          font-size: 14px;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* BUTTONS */
        .btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }

        @media (min-width: 768px) {
          .btn-primary {
            padding: 16px 28px;
            font-size: 16px;
            width: auto;
          }
        }

        .btn-edit {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
          white-space: nowrap;
        }

        .btn-edit:hover {
          transform: scale(1.03);
        }

        @media (min-width: 768px) {
          .btn-edit {
            padding: 10px 18px;
            font-size: 13px;
          }
        }

        .btn-delete {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
          white-space: nowrap;
        }

        .btn-delete:hover {
          transform: scale(1.03);
        }

        @media (min-width: 768px) {
          .btn-delete {
            padding: 10px 18px;
            font-size: 13px;
          }
        }

        .btn-visibility {
          background: #6b7280;
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
          white-space: nowrap;
        }

        .btn-visibility:hover {
          transform: scale(1.03);
        }

        @media (min-width: 768px) {
          .btn-visibility {
            padding: 10px 18px;
            font-size: 13px;
          }
        }

        .btn-timer {
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff;
          border: none;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
          margin-top: 12px;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
          transition: transform 0.2s ease;
        }

        .btn-timer:hover {
          transform: translateY(-2px);
        }

        @media (min-width: 768px) {
          .btn-timer {
            padding: 16px 28px;
            font-size: 16px;
            width: auto;
          }
        }

        /* CATEGORY ITEMS */
        .category-item {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #ffffff, #fafbfc);
          border: 1px solid #e5e7eb;
          gap: 10px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .category-item {
            padding: 16px 20px;
            border-radius: 18px;
            margin-bottom: 12px;
            gap: 16px;
          }
        }

        .category-name {
          flex: 1;
          min-width: 120px;
        }

        .category-name .form-input {
          padding: 8px 12px;
          font-size: 13px;
        }

        .category-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .text-muted {
          color: #6b7280;
          font-size: 12px;
          margin: 4px 0 0 0;
        }

        @media (min-width: 768px) {
          .text-muted {
            font-size: 13px;
          }
        }

        /* PRODUCT CARDS */
        .product-card {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 16px;
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          gap: 12px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .product-card {
            padding: 20px 24px;
            border-radius: 20px;
            margin-bottom: 20px;
            gap: 16px;
          }
        }

        .product-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          flex: 1;
          width: 100%;
        }

        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #eef2ff;
          flex-shrink: 0;
        }

        @media (min-width: 480px) {
          .product-image {
            width: 100px;
            height: 100px;
          }
        }

        @media (min-width: 768px) {
          .product-image {
            width: 120px;
            height: 120px;
            border-radius: 16px;
            border-width: 3px;
          }
        }

        .product-details {
          flex: 1;
          min-width: 160px;
        }

        .product-details h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
        }

        @media (min-width: 768px) {
          .product-details h3 {
            font-size: 18px;
          }
        }

        .product-details p {
          margin: 3px 0;
          font-size: 13px;
          color: #374151;
          word-break: break-word;
        }

        @media (min-width: 768px) {
          .product-details p {
            font-size: 14px;
          }
        }

        .product-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          width: 100%;
        }

        @media (min-width: 480px) {
          .product-actions {
            width: auto;
            gap: 10px;
          }
        }

        .product-actions button {
          flex: 1;
          min-width: 70px;
          text-align: center;
          font-size: 11px;
          padding: 8px 12px;
        }

        @media (min-width: 480px) {
          .product-actions button {
            flex: none;
            font-size: 12px;
            padding: 8px 14px;
          }
        }

        @media (min-width: 768px) {
          .product-actions button {
            font-size: 13px;
            padding: 10px 18px;
          }
        }

        /* BADGES */
        .badge-visible,
        .badge-hidden,
        .badge-rebaja,
        .badge-destacado {
          padding: 3px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
        }

        @media (min-width: 768px) {
          .badge-visible,
          .badge-hidden,
          .badge-rebaja,
          .badge-destacado {
            padding: 4px 12px;
            font-size: 12px;
          }
        }

        .badge-visible { background: #16a34a; color: #fff; }
        .badge-hidden { background: #1f2937; color: #fff; }
        .badge-rebaja { background: #dc2626; color: #fff; }
        .badge-destacado { background: #111827; color: #fff; }

        .status-badge { margin: 4px 0; }

        .text-oferta {
          color: #dc2626;
          font-weight: 700;
          font-size: 13px !important;
        }

        .text-success {
          color: #16a34a;
          font-weight: 600;
          font-size: 13px !important;
        }

        /* SUGERENCIAS */
        .sugerencias-container {
          margin-top: 12px;
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #eef2ff, #ffffff);
          border: 1px solid #c7d2fe;
          width: 100%;
        }

        @media (min-width: 768px) {
          .sugerencias-container {
            padding: 16px;
            border-radius: 16px;
            margin-top: 16px;
          }
        }

        .sugerencias-container strong {
          color: #3730a3;
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .sugerencias-list {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .sugerencia-card {
          min-width: 110px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .sugerencia-card:hover {
          transform: scale(1.03);
        }

        @media (min-width: 480px) {
          .sugerencia-card {
            min-width: 130px;
            padding: 12px;
          }
        }

        .sugerencia-image {
          width: 100%;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
        }

        @media (min-width: 480px) {
          .sugerencia-image {
            height: 70px;
          }
        }

        .sugerencia-name {
          font-weight: 600;
          font-size: 12px;
          margin: 6px 0 3px 0;
          color: #111827;
        }

        .sugerencia-price {
          font-weight: 700;
          color: #16a34a;
          font-size: 13px;
          margin: 0;
        }

        /* PREVIEWS */
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
          gap: 8px;
          margin: 10px 0;
        }

        @media (min-width: 768px) {
          .image-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
          }
        }

        .preview-thumb {
          width: 100%;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        @media (min-width: 768px) {
          .preview-thumb {
            height: 100px;
            border-radius: 10px;
          }
        }

        .preview-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 10px;
          border: 1px solid #ddd;
          margin-top: 8px;
        }

        @media (min-width: 768px) {
          .preview-image {
            max-height: 300px;
            border-radius: 12px;
            margin-top: 10px;
          }
        }

        .banner-preview {
          max-width: 100%;
          max-height: 150px;
          object-fit: cover;
          border-radius: 12px;
        }

        @media (min-width: 768px) {
          .banner-preview {
            max-height: 200px;
          }
        }

        /* BANNER CARDS */
        .banner-card {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          margin-bottom: 14px;
          background: #fafbfc;
          width: 100%;
        }

        @media (min-width: 768px) {
          .banner-card {
            padding: 16px 20px;
            border-radius: 16px;
            margin-bottom: 16px;
            gap: 20px;
          }
        }

        .banner-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          flex-shrink: 0;
        }

        @media (min-width: 480px) {
          .banner-image {
            width: 140px;
            height: 90px;
          }
        }

        @media (min-width: 768px) {
          .banner-image {
            width: 180px;
            height: 100px;
            border-radius: 12px;
          }
        }

        .banner-info {
          flex: 1;
          min-width: 120px;
        }

        .banner-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .banner-info p {
          margin: 4px 0;
          font-size: 13px;
          color: #4b5563;
          word-break: break-word;
        }

        .banner-category {
          color: #2563eb;
          font-weight: 600;
          font-size: 13px !important;
        }

        /* CONTACTOS */
        .contact-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          width: 100%;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .contact-card {
            padding: 20px 24px;
            border-radius: 20px;
            margin-bottom: 20px;
          }
        }

        .contact-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          gap: 10px;
          width: 100%;
        }

        .contact-header-info {
          flex: 1;
          min-width: 150px;
        }

        .contact-header h3 {
          margin: 0;
          font-size: 17px;
          word-break: break-word;
        }

        @media (min-width: 768px) {
          .contact-header h3 {
            font-size: 20px;
          }
        }

        .contact-date {
          color: #6b7280;
          font-size: 12px;
          display: block;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        @media (min-width: 768px) {
          .contact-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }
        }

        .info-box {
          background: #fafbfc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 12px;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .info-box {
            padding: 14px 16px;
            border-radius: 14px;
          }
        }

        .info-box strong {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        @media (min-width: 768px) {
          .info-box strong {
            font-size: 12px;
            margin-bottom: 4px;
          }
        }

        .info-box-text {
          margin: 0;
          font-weight: 500;
          font-size: 13px;
          word-break: break-word;
        }

        .message-box {
          background: linear-gradient(135deg, #eef2ff, #ffffff);
          border: 1px solid #c7d2fe;
          padding: 14px 16px;
          border-radius: 14px;
          line-height: 1.6;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .message-box {
            padding: 18px 20px;
            border-radius: 16px;
            line-height: 1.7;
          }
        }

        .message-box strong {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .message-text {
          margin: 0;
          font-size: 14px;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .empty-state {
          background: #fff;
          padding: 30px 20px;
          border-radius: 16px;
          text-align: center;
          color: #6b7280;
          border: 2px dashed #d1d5db;
          font-size: 14px;
        }

        @media (min-width: 768px) {
          .empty-state {
            padding: 40px;
            font-size: 16px;
          }
        }

        /* TIMER */
        .timer-section {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: #fff;
          border: none;
        }

        .timer-section h2 {
          color: #fff;
        }

        .timer-section p {
          opacity: 0.7;
          margin-bottom: 14px;
          font-size: 14px;
        }

        .timer-section .form-input {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }

        .timer-section .form-input:focus {
          background: rgba(255,255,255,0.15);
          border-color: #f97316;
        }

        .timer-section .form-input::placeholder {
          color: rgba(255,255,255,0.5);
        }

        /* RESPONSIVE EXTRA */
        @media (max-width: 360px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .stat-card {
            padding: 12px 8px;
          }
          .stat-number {
            font-size: 18px;
          }
          .stat-label {
            font-size: 10px;
          }
          .product-image {
            width: 60px;
            height: 60px;
          }
          .sugerencia-card {
            min-width: 90px;
          }
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Asegurar que nada se desborde */
        .section-card * {
          max-width: 100%;
        }

        .form-input,
        .form-textarea,
        .form-multiselect {
          max-width: 100%;
        }

        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}