import LanguageSelector from "./components/LanguageSelector";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import UserPage from "./Pages/UserPage";
import { Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import AccountActivationPage from "./Pages/AccountActivationPage";
import NavBar from "./components/NavBar";
import AuthContextProvider from "./context/AuthContextProvider";

function App() {
  return (
    <AuthContextProvider>
      <LanguageSelector />
      <NavBar />
      <div className="container pt-3">
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="/activate/:token" element={<AccountActivationPage />} />
        </Routes>
      </div>
    </AuthContextProvider>
  );
}

export default App;
