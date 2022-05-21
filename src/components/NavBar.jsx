import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../context/AuthContextProvider";

export default function NavBar() {
  const { t } = useTranslation();
  const { auth } = useAuthContext();

  return (
    <nav className="navbar navbar-expand navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" title="Home" className="navbar-brand">
          <img src={logo} alt="logo" width="50" />
          Main
        </Link>
        <ul className="navbar-nav">
          {!auth?.isLoggedIn ? (
            <>
              <Link to="/signup" className="nav-link">
                {t("signUp")}
              </Link>
              <Link to="/login" className="nav-link">
                {t("login")}
              </Link>
            </>
          ) : (
            <Link to={`/user/${auth?.id}`} className="nav-link">
              My profile
            </Link>
          )}
        </ul>
      </div>
    </nav>
  );
}
