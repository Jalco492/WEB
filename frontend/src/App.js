import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Admin from "./pages/Admin";
import Categoria from "./pages/Categoria";
import Subcategoria from "./pages/Subcategoria";
import Productos from "./pages/Productos";
import Buscar from "./pages/Buscar";
import Favoritos from "./pages/Favoritos";
import Footer from "./pages/Footer";
import Contacto from "./pages/Contacto";
import Nosotros from "./pages/Nosotros";
import Navbar from "./pages/Navbar";
import Comparar from "./pages/Comparar";
import Cotizador from "./pages/Cotizador";



function App() {
  return (
    <BrowserRouter>
      <Routes>

       

        <Route path="/" element={<Catalogo />} />

        <Route path="/producto/:id" element={<ProductoDetalle />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/categoria/:nombre" element={<Categoria />} />

        <Route path="/subcategoria/:nombre" element={<Subcategoria />} />

        <Route path="/categoria-id/:id" element={<Categoria />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/buscar/:texto" element={<Buscar />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/nosotros" element={<Nosotros />} />
         <Route path="/navbar" element={<Navbar />} />
         <Route path="/comparar" element={<Comparar />}/>
         <Route path="/cotizador"element={<Cotizador />}
/>
       


        
      </Routes>
    </BrowserRouter>
  );
}

export default App;