import {} from "react";
import { Outlet } from "react-router-dom";

import "./dashboardStyles.scss";

import Header from "../../components/header/Header";
import { CartContextProvider } from "../../context/CartContextProvider";
import { CategoryContextProvider } from "../../context/categoryContextProvider";
import { AuthContextProvider } from "../../context/AuthContextProvider";

const Dashboard = () => {
  return (
    <>
      <AuthContextProvider>
        <CategoryContextProvider>
          <CartContextProvider>
            <main className="bg-main">
              <Header />
              <Outlet />
              <footer className="footer">
                <p className="footer-title">Online Academy</p>
                <span className="footer-subtitle">Carlos Trinidad &copy; {new Date().getFullYear()}</span>
              </footer>
            </main>
          </CartContextProvider>
        </CategoryContextProvider>
      </AuthContextProvider>
    </>
  );
};

export default Dashboard;
