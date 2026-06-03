import { configureStore } from "@reduxjs/toolkit";
import nextReducer from "./nextSlice";
import { trackAddToCart } from "@/lib/metaPixel";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["allProducts"],
};

const persistedReducer = persistReducer(persistConfig, nextReducer);

export const store = configureStore({
  reducer: { next: persistedReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat((storeApi) => (next) => (action) => {
      const result = next(action);
      if (action?.type === "next/addToCart") {
        const item = action.payload || {};
        trackAddToCart({
          contentName: String(item.title || ""),
          contentId: String(item.productId || item._id || ""),
          value: Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)),
          quantity: Number(item.quantity || 1),
        });
      }
      return result;
    }),
});
export let persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
