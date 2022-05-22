import { useState } from "react";
import { contextFactory } from "./helpers/contextFactory";

const [useAuthContext, AuthContext] = contextFactory();
export { useAuthContext };

export default function AuthContextProvider({ children }) {
  const [auth, setAuth] = useState({ isLoggedIn: false, id: "" });

  const values = { auth, setAuth };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
