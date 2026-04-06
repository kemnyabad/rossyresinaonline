import { resetCart } from "@/store/nextSlice";
import { useDispatch } from "react-redux";

const ResetCart = () => {
  const dispatch = useDispatch();
  const handleResetCart = () => {
    const confirmReset = window.confirm(
      "Ests seguro de vaciar tu carrito?"
    );
    if (confirmReset) {
      dispatch(resetCart());
    }
  };
  return (
    <button
      onClick={handleResetCart}
      className="text-sm font-semibold text-gray-600 hover:text-red-600 duration-200"
    >
      Vaciar carrito
    </button>
  );
};

export default ResetCart;
