import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import tilapiaImg from "@assets/generated_images/tilapia_fish_product_shot.png";
import duckImg from "@assets/generated_images/french_duck_product_shot.png";
import pigeonImg from "@assets/generated_images/pigeon_meat_product_shot.png";
import eggsImg from "@assets/generated_images/farm_eggs_product_shot.png";
import chickenImg from "@assets/generated_images/fresh_chicken_product_shot.png";
import lambImg from "@assets/generated_images/lamb_meat_product_shot.png";

const imageMap: Record<string, string> = {
  fish: tilapiaImg,
  duck: duckImg,
  pigeon: pigeonImg,
  eggs: eggsImg,
  chicken: chickenImg,
  lamb: lambImg,
  goat: lambImg,
};

let stripePromise: Promise<any> | null = null;

function getStripe() {
  if (!stripePromise) {
    stripePromise = fetch("/api/config/stripe")
      .then((res) => res.json())
      .then((data) => loadStripe(data.publishableKey));
  }
  return stripePromise;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  area: string;
  block: string;
  street: string;
  building: string;
  floor: string;
  notes: string;
}

function CheckoutForm({ 
  clientSecret, 
  orderId, 
  onSuccess 
}: { 
  clientSecret: string; 
  orderId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const { sessionId, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout/confirm", { orderId, sessionId });
      return res.json();
    },
    onSuccess: () => {
      clearCart();
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || t("حدث خطأ", "An error occurred"));
      setIsProcessing(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/checkout/success",
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || t("فشل الدفع", "Payment failed"));
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      await confirmMutation.mutateAsync();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full rounded-full" 
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 me-2 animate-spin" />
            {t("جاري المعالجة...", "Processing...")}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 me-2" />
            {t("ادفع الآن", "Pay Now")}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const { t, language, isRTL } = useLanguage();
  const { items, totalPrice, sessionId, totalItems } = useCart();
  const [step, setStep] = useState<"info" | "payment" | "success">("info");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    area: "",
    block: "",
    street: "",
    building: "",
    floor: "",
    notes: "",
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout/create-payment-intent", {
        amount: totalPrice,
        sessionId,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: {
          name: customerInfo.name,
          area: customerInfo.area,
          block: customerInfo.block,
          street: customerInfo.street,
          building: customerInfo.building,
          floor: customerInfo.floor,
          notes: customerInfo.notes,
        },
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep("payment");
    },
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPaymentMutation.mutate();
  };

  const handleInputChange = (field: keyof CustomerInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (totalItems === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {t("السلة فارغة", "Cart is Empty")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("أضف منتجات للمتابعة", "Add products to continue")}
            </p>
            <Button asChild className="rounded-full">
              <a href="/">{t("تسوق الآن", "Shop Now")}</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {t("تم الطلب بنجاح!", "Order Placed Successfully!")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t(
                  "شكراً لتسوقك معنا. سنتواصل معك قريباً.",
                  "Thank you for shopping with us. We'll contact you soon."
                )}
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-6">
                  {t("رقم الطلب", "Order Number")}: <span className="font-mono">{orderId.slice(0, 8)}</span>
                </p>
              )}
              <Button asChild className="rounded-full">
                <a href="/">{t("العودة للتسوق", "Continue Shopping")}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-back"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("العودة للتسوق", "Back to Shopping")}
            </a>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {step === "info" ? (
                      <>
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                        {t("معلومات التوصيل", "Delivery Information")}
                      </>
                    ) : (
                      <>
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                        {t("الدفع", "Payment")}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {step === "info" && (
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="name">{t("الاسم الكامل", "Full Name")} *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={handleInputChange("name")}
                            required
                            data-testid="input-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t("البريد الإلكتروني", "Email")} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={handleInputChange("email")}
                            required
                            data-testid="input-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">{t("رقم الهاتف", "Phone")} *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={customerInfo.phone}
                            onChange={handleInputChange("phone")}
                            required
                            data-testid="input-phone"
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <h3 className="font-semibold mb-4">
                        {t("عنوان التوصيل", "Delivery Address")}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="area">{t("المنطقة", "Area")} *</Label>
                          <Input
                            id="area"
                            value={customerInfo.area}
                            onChange={handleInputChange("area")}
                            required
                            data-testid="input-area"
                          />
                        </div>
                        <div>
                          <Label htmlFor="block">{t("القطعة", "Block")} *</Label>
                          <Input
                            id="block"
                            value={customerInfo.block}
                            onChange={handleInputChange("block")}
                            required
                            data-testid="input-block"
                          />
                        </div>
                        <div>
                          <Label htmlFor="street">{t("الشارع", "Street")} *</Label>
                          <Input
                            id="street"
                            value={customerInfo.street}
                            onChange={handleInputChange("street")}
                            required
                            data-testid="input-street"
                          />
                        </div>
                        <div>
                          <Label htmlFor="building">{t("المبنى", "Building")}</Label>
                          <Input
                            id="building"
                            value={customerInfo.building}
                            onChange={handleInputChange("building")}
                            data-testid="input-building"
                          />
                        </div>
                        <div>
                          <Label htmlFor="floor">{t("الطابق", "Floor")}</Label>
                          <Input
                            id="floor"
                            value={customerInfo.floor}
                            onChange={handleInputChange("floor")}
                            data-testid="input-floor"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="notes">{t("ملاحظات", "Notes")}</Label>
                          <Input
                            id="notes"
                            value={customerInfo.notes}
                            onChange={handleInputChange("notes")}
                            placeholder={t("ملاحظات إضافية للتوصيل", "Additional delivery notes")}
                            data-testid="input-notes"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full rounded-full mt-6" 
                        size="lg"
                        disabled={createPaymentMutation.isPending}
                        data-testid="button-continue-payment"
                      >
                        {createPaymentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 me-2 animate-spin" />
                            {t("جاري التحميل...", "Loading...")}
                          </>
                        ) : (
                          t("متابعة للدفع", "Continue to Payment")
                        )}
                      </Button>
                    </form>
                  )}

                  {step === "payment" && clientSecret && (
                    <Elements
                      stripe={getStripe()}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#E37E16",
                          },
                        },
                      }}
                    >
                      <div className="mb-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStep("info")}
                          className="mb-4"
                          data-testid="button-back-info"
                        >
                          <ArrowLeft className={`h-4 w-4 me-2 ${isRTL ? "rotate-180" : ""}`} />
                          {t("تعديل المعلومات", "Edit Information")}
                        </Button>
                        <div className="bg-muted/50 p-4 rounded-md text-sm space-y-1">
                          <p><strong>{customerInfo.name}</strong></p>
                          <p>{customerInfo.email} | {customerInfo.phone}</p>
                          <p>{customerInfo.area}, {t("قطعة", "Block")} {customerInfo.block}, {t("شارع", "Street")} {customerInfo.street}</p>
                        </div>
                      </div>
                      <CheckoutForm 
                        clientSecret={clientSecret} 
                        orderId={orderId!}
                        onSuccess={() => setStep("success")}
                      />
                    </Elements>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {t("ملخص الطلب", "Order Summary")}
                    <span className="text-muted-foreground font-normal text-sm">
                      ({totalItems} {t("منتج", "items")})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={item.product.id} 
                      className="flex gap-4"
                      data-testid={`checkout-item-${item.product.id}`}
                    >
                      <img
                        src={imageMap[item.product.category] || item.product.image}
                        alt={language === "ar" ? item.product.nameAr : item.product.nameEn}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {language === "ar" ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("الكمية", "Qty")}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="font-semibold">
                          {(parseFloat(item.product.price) * item.quantity).toFixed(3)} {t("د.ك", "KWD")}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span>{totalPrice.toFixed(3)} {t("د.ك", "KWD")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                      <span className="text-green-600">{t("مجاني", "Free")}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("الإجمالي", "Total")}</span>
                    <span className="text-primary">{totalPrice.toFixed(3)} {t("د.ك", "KWD")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
