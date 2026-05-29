import { createSlice } from "@reduxjs/toolkit";
import { StoreProduct } from "../../type";

interface NextState {
  productData: StoreProduct[];
  favoriteData: StoreProduct[];
  allProducts: StoreProduct[];
  userInfo: null | string;
}

const initialState: NextState = {
  productData: [],
  favoriteData: [],
  allProducts: [],
  userInfo: null,
};

const cartItemKey = (item: any) =>
  String(item?.cartKey ?? `${item?._id ?? ""}:${item?.variantId ?? ""}`);

const payloadKey = (payload: any) =>
  typeof payload === "object" && payload !== null
    ? String(payload.cartKey ?? `${payload._id ?? ""}:${payload.variantId ?? ""}`)
    : String(payload);

export const nextSlice = createSlice({
  name: "next",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const nextKey = payloadKey(action.payload);
      const existingProduct = state.productData.find(
        (item: StoreProduct) => cartItemKey(item) === nextKey
      );
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.productData.push(action.payload);
      }
    },
    addToFavorite: (state, action) => {
      const existingProduct = state.favoriteData.find(
        (item: StoreProduct) => item._id === action.payload._id
      );
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.favoriteData.push(action.payload);
      }
    },
    increaseQuantity: (state, action) => {
      const key = payloadKey(action.payload);
      const existingProduct = state.productData.find(
        (item: StoreProduct) => cartItemKey(item) === key
      );
      existingProduct && existingProduct.quantity++;
    },
    decreaseQuantity: (state, action) => {
      const key = payloadKey(action.payload);
      const existingProduct = state.productData.find(
        (item: StoreProduct) => cartItemKey(item) === key
      );
      if (existingProduct?.quantity === 1) {
        existingProduct.quantity = 1;
      } else {
        existingProduct!.quantity--;
      }
    },
    setQuantity: (state, action) => {
      const key = payloadKey(action.payload);
      const existingProduct = state.productData.find(
        (item: StoreProduct) => cartItemKey(item) === key
      );
      if (existingProduct) {
        const quantity = Number(action.payload.quantity);
        existingProduct.quantity = Number.isFinite(quantity)
          ? Math.max(1, Math.floor(quantity))
          : existingProduct.quantity;
      }
    },
    deleteProduct: (state, action) => {
      const key = payloadKey(action.payload);
      state.productData = state.productData.filter(
        (item) => cartItemKey(item) !== key
      );
    },
    deleteFavorite: (state, action) => {
      state.favoriteData = state.favoriteData.filter(
        (item) => item._id !== action.payload
      );
    },

    resetCart: (state) => {
      state.productData = [];
    },
    resetFavoriteData: (state) => {
      state.favoriteData = [];
    },

    addUser: (state, action) => {
      state.userInfo = action.payload;
    },
    removeUser: (state) => {
      state.userInfo = null;
    },
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
  },
});

export const {
  addToCart,
  addToFavorite,
  increaseQuantity,
  decreaseQuantity,
  deleteProduct,
  resetCart,
  setQuantity,
  addUser,
  removeUser,
  setAllProducts,
  deleteFavorite,
  resetFavoriteData,
} = nextSlice.actions;
export default nextSlice.reducer;
