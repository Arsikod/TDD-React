import React from "react";
import { contextFactory } from "./helpers/contextFactory";

const [useAuthContext, AuthContext] = contextFactory();
export { useAuthContext };

export default function AuthContextProvider({ children, value }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
