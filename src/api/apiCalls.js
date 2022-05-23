import axios from "axios";
import i18n from "../locale/i18next";
import storage from "../state/storage";

axios.interceptors.request.use((request) => {
  request.headers["Accept-Language"] = i18n.language;
  const auth = storage.getItem("auth");
  if (auth?.header) {
    request.headers["Authorization"] = auth.header;
  }

  return request;
});

export const signUp = (body) => {
  return axios.post("/api/1.0/users", body);
};

export const activate = (token) => {
  return axios.post("/api/1.0/users/token/" + token);
};

export const loadUsers = (page) => {
  return axios.get("/api/1.0/users", { params: { page, size: 3 } });
};

export const getUserById = (id) => {
  return axios.get(`/api/1.0/users/${id}`);
};

export const logIn = (body) => {
  return axios.post("/api/1.0/auth", body);
};

export const updateUser = (id, body, header) => {
  return axios.put(`/api/1.0/users/${id}`, body);
};

export const logout = () => {
  return axios.post("/api/1.0/logout");
};
