import { SiMediamarkt } from "react-icons/si";
import FormattedPrice from "./FormattedPrice";
import { useDispatch, useSelector } from "react-redux";
import { StateProps, StoreProduct } from "../../type";
import { useEffect, useMemo, useState } from "react";

interface Props { email?: string }
const CartPayment = ({ email }: Props) => {
  const { productData, userInfo } = useSelector(
    (state: StateProps) => state.next
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const [method, setMethod] = useState<string>("yape");
  const yapeNumber = process.env.NEXT_PUBLIC_YAPE_NUMBER || "000000000";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Banco";
  const accountNumber = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "00000000000";
  const cci = process.env.NEXT_PUBLIC_BANK_CCI || "00000000000000000000";
  const holder = process.env.NEXT_PUBLIC_ACCOUNT_HOLDER || "";
  const contactPhoneRaw = process.env.NEXT_PUBLIC_CONTACT_PHONE || yapeNumber;
  const contactPhone = useMemo(() => contactPhoneRaw.replace(/[^0-9]/g, ""), [contactPhoneRaw]);
  useEffect(() => {
    let amt = 0;
    productData.map((item: StoreProduct) => {
      amt += item.price * item.quantity;
      return;
    });
    setTotalAmount(amt);
  }, [productData]);
  const orderText = useMemo(() => {
    const lines = productData.map((p: StoreProduct) => `• ${p.title} x ${p.quantity} = S/ ${(p.price * p.quantity).toFixed(2)}`);
    const base = [
      `Hola, quiero confirmar mi pedido`,
      `Método: ${method === "yape" ? "Yape" : "Transferencia"}`,
      `Total: S/ ${totalAmount.toFixed(2)}`,
      email ? `Email: ${email}` : "",
      "",
      "Productos:",
      ...lines,
      "",
      "Datos de pago:",
      `Yape: ${yapeNumber}`,
      `Transferencia: ${bankName} Cuenta: ${accountNumber} CCI: ${cci}`,
      holder ? `Titular: ${holder}` : "",
    ].filter(Boolean);
    return base.join("\n");
  }, [productData, totalAmount, method, email, yapeNumber, bankName, accountNumber, cci, holder]);

  const handleConfirm = () => {
    if (!contactPhone) {
      alert("No se ha configurado el número de contacto.");
      return;
    }
    const url = `https://wa.me/${contactPhone}?text=${encodeURIComponent(orderText)}`;
    window.open(url, "_blank");
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <span className="bg-green-600 rounded-full p-1 h-6 w-6 text-sm text-white flex items-center justify-center mt-1">
          <SiMediamarkt />
        </span>
        <p className="text-sm">
          Pedidos despues de las 4:00 pm los envios salen al siguiente día, los pedidos salen a partir de las 4.00 pm
        </p>
      </div>
      <p className="flex items-center justify-between px-2 font-semibold">
        Total:{" "}
        <span className="font-bold text-xl">
          <FormattedPrice amount={totalAmount} />
        </span>
      </p>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Medio de pago</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="yape">Yape</option>
          <option value="transferencia">Transferencia bancaria</option>
        </select>
      </div>

      {method === "yape" ? (
        <div className="text-sm text-gray-700">
          <p className="mt-2">Paga al número Yape <span className="font-semibold">{yapeNumber}</span> y confirma por WhatsApp.</p>
          {holder && <p className="mt-1">Titular: <span className="font-semibold">{holder}</span></p>}
          <p className="mt-1">En el mensaje se incluirá el detalle de tu pedido.</p>
        </div>
      ) : (
        <div className="text-sm text-gray-700">
          <p className="mt-2">Transfiere a <span className="font-semibold">{bankName}</span>.</p>
          <p>Cuenta: <span className="font-semibold">{accountNumber}</span></p>
          <p>CCI: <span className="font-semibold">{cci}</span></p>
          {holder && <p>Titular: <span className="font-semibold">{holder}</span></p>}
        </div>
      )}

      <div className="flex flex-col items-center mt-3">
        <button
          onClick={handleConfirm}
          className="w-full h-10 text-sm font-semibold bg-amazon_blue text-white rounded-lg hover:bg-amazon_yellow hover:text-black duration-300"
        >
          Confirmar pedido por WhatsApp
        </button>
        {!userInfo && (
          <p className="text-xs mt-1 text-gray-600">Puedes comprar sin iniciar sesión, pero añade tu correo en Checkout para coordinar.</p>
        )}
      </div>
    </div>
  );
};

export default CartPayment;
