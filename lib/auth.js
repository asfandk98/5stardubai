import API from "./api";

export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const getUser = () => API.get("/user");
export const logoutUser = () => API.post("/logout");