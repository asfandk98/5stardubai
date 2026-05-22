// lib/wishlist.js

import API from "./api";

export const getWishlist = async () => {
  const res = await API.get("/wishlist");
  return res.data; // ✅ return only array
};

export const addToWishlist = async (hotel_id) => {
  const res = await API.post("/wishlist", { hotel_id });
  return res.data;
};

export const removeFromWishlist = async (hotel_id) => {
  const res = await API.delete(`/wishlist/${hotel_id}`);
  return res.data;
};