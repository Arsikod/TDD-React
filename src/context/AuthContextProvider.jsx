import { useEffect, useState } from "react";
import { contextFactory } from "./helpers/contextFactory";
import storage from "../state/storage";

const [useAuthContext, AuthContext] = contextFactory();
export { useAuthContext };

export default function AuthContextProvider({ children }) {
  const [auth, setAuth] = useState(storage.getItem("auth"));

  const values = {
    auth,
    setAuth,
  };

  useEffect(() => {
    storage.setItem("auth", auth);
  }, [JSON.stringify(auth)]);

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
}
