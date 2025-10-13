import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "../styles/global.scss";
import Home from "../pages/Home";
import Inventory from "../pages/Inventory";
import Shipping from "../pages/Shipping";
import Orders from "../pages/Orders";
import Products from "../pages/Products";

function Layout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { to: "/", label: "홈" },
    { to: "/inventory", label: "재고관리" },
    { to: "/shipping", label: "배송관리" },
    { to: "/orders", label: "주문조회" },
    { to: "/products", label: "상품관리" },
  ];
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__inner">
          <div style={{ fontWeight: 800 }}>JELNA ERP Admin</div>
          <nav className="app-nav">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{n.label}</NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">© {new Date().getFullYear()} JELNA</footer>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
