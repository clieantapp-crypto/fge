import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  Shield, 
  Lock,
  Truck,
  Phone,
  Mail,
  MapPin,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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

function PaymentForm({ 
  clientSecret, 
  orderId, 
  onSuccess,
  totalPrice 
}: { 
  clientSecret: string; 
  orderId: string;
  onSuccess: () => void;
  totalPrice: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { t, isRTL } = useLanguage();
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
      <div className="bg-muted/30 p-4 rounded-md mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="font-semibold">{t("معلومات البطاقة", "Card Information")}</span>
        </div>
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm flex items-start gap-2">
          <div className="shrink-0 mt-0.5">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md text-green-700 dark:text-green-400 text-sm">
        <Lock className="h-4 w-4" />
        <span>{t("دفع آمن ومشفر بتقنية SSL", "Secure payment encrypted with SSL")}</span>
      </div>

      <Button 
        type="submit" 
        className="w-full rounded-full h-14 text-lg font-semibold" 
        size="lg"
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 me-2 animate-spin" />
            {t("جاري معالجة الدفع...", "Processing Payment...")}
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 me-2" />
            {t("ادفع", "Pay")} {totalPrice.toFixed(3)} {t("د.ك", "KWD")}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-muted-foreground text-xs">
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span>{t("حماية المشتري", "Buyer Protection")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-4 w-4" />
          <span>{t("دفع مشفر", "Encrypted")}</span>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  const { t, language, isRTL } = useLanguage();
  const { items, totalPrice, sessionId, totalItems, clearCart } = useCart();
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
        cartItems: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (totalItems === 0 && step !== "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {t("السلة فارغة", "Cart is Empty")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("أضف منتجات للمتابعة للدفع", "Add products to proceed to checkout")}
              </p>
              <Button asChild className="rounded-full">
                <a href="/">{t("تسوق الآن", "Shop Now")}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 bg-background">
          <Card className="max-w-lg w-full mx-4">
            <CardContent className="pt-8 text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {t("تم إتمام الطلب بنجاح!", "Order Completed Successfully!")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t(
                  "شكراً لتسوقك من مزارع الذنيان. سنتواصل معك قريباً لتأكيد التوصيل.",
                  "Thank you for shopping at Al Thenayan Farms. We'll contact you soon to confirm delivery."
                )}
              </p>
              
              {orderId && (
                <div className="bg-muted/50 p-4 rounded-md mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("رقم الطلب", "Order Number")}
                  </p>
                  <p className="font-mono text-lg font-bold text-primary">
                    #{orderId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/30 p-4 rounded-md">
                  <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{t("التوصيل", "Delivery")}</p>
                  <p className="text-xs text-muted-foreground">{t("خلال ٢٤ ساعة", "Within 24 hours")}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-md">
                  <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{t("التواصل", "Contact")}</p>
                  <p className="text-xs text-muted-foreground">{t("سنتصل بك", "We'll call you")}</p>
                </div>
              </div>
              
              <Button asChild className="rounded-full w-full">
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
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="mb-8">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-back"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              {t("العودة للتسوق", "Back to Shopping")}
            </a>
            <h1 className="text-2xl md:text-3xl font-bold mt-4 text-foreground">
              {t("إتمام الطلب", "Checkout")}
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "info" || step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "info" ? "bg-primary text-primary-foreground" : 
                step === "payment" || step === "success" ? "bg-primary text-primary-foreground" : 
                "bg-muted text-muted-foreground"
              }`}>
                {step === "payment" || step === "success" ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-medium hidden sm:inline">{t("معلومات التوصيل", "Delivery Info")}</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "payment" ? "bg-primary text-primary-foreground" : 
                step === "success" ? "bg-primary text-primary-foreground" : 
                "bg-muted text-muted-foreground"
              }`}>
                {step === "success" ? <CheckCircle className="h-4 w-4" /> : "2"}
              </div>
              <span className="font-medium hidden sm:inline">{t("الدفع", "Payment")}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {step === "info" ? (
                      <>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span>{t("معلومات التوصيل", "Delivery Information")}</span>
                          <p className="text-sm font-normal text-muted-foreground mt-0.5">
                            {t("أدخل بياناتك لتوصيل الطلب", "Enter your details for delivery")}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span>{t("الدفع الآمن", "Secure Payment")}</span>
                          <p className="text-sm font-normal text-muted-foreground mt-0.5">
                            {t("أدخل بيانات البطاقة", "Enter your card details")}
                          </p>
                        </div>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {step === "info" && (
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <User className="h-4 w-4 text-primary" />
                          {t("المعلومات الشخصية", "Personal Information")}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="name" className="text-sm">
                              {t("الاسم الكامل", "Full Name")} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={customerInfo.name}
                              onChange={handleInputChange("name")}
                              placeholder={t("أحمد محمد", "Ahmed Mohammed")}
                              required
                              className="mt-1.5"
                              data-testid="input-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm">
                              {t("البريد الإلكتروني", "Email")} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative mt-1.5">
                              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                value={customerInfo.email}
                                onChange={handleInputChange("email")}
                                placeholder="email@example.com"
                                required
                                className="ps-10"
                                data-testid="input-email"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-sm">
                              {t("رقم الهاتف", "Phone Number")} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative mt-1.5">
                              <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                value={customerInfo.phone}
                                onChange={handleInputChange("phone")}
                                placeholder="+965 XXXX XXXX"
                                required
                                className="ps-10"
                                data-testid="input-phone"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {t("عنوان التوصيل", "Delivery Address")}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="area" className="text-sm">
                              {t("المنطقة", "Area")} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="area"
                              value={customerInfo.area}
                              onChange={handleInputChange("area")}
                              placeholder={t("السالمية", "Salmiya")}
                              required
                              className="mt-1.5"
                              data-testid="input-area"
                            />
                          </div>
                          <div>
                            <Label htmlFor="block" className="text-sm">
                              {t("القطعة", "Block")} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="block"
                              value={customerInfo.block}
                              onChange={handleInputChange("block")}
                              placeholder="12"
                              required
                              className="mt-1.5"
                              data-testid="input-block"
                            />
                          </div>
                          <div>
                            <Label htmlFor="street" className="text-sm">
                              {t("الشارع", "Street")} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="street"
                              value={customerInfo.street}
                              onChange={handleInputChange("street")}
                              placeholder="5"
                              required
                              className="mt-1.5"
                              data-testid="input-street"
                            />
                          </div>
                          <div>
                            <Label htmlFor="building" className="text-sm">
                              {t("المبنى / المنزل", "Building / House")}
                            </Label>
                            <Input
                              id="building"
                              value={customerInfo.building}
                              onChange={handleInputChange("building")}
                              placeholder="15A"
                              className="mt-1.5"
                              data-testid="input-building"
                            />
                          </div>
                          <div>
                            <Label htmlFor="floor" className="text-sm">
                              {t("الطابق / الشقة", "Floor / Apartment")}
                            </Label>
                            <Input
                              id="floor"
                              value={customerInfo.floor}
                              onChange={handleInputChange("floor")}
                              placeholder="3"
                              className="mt-1.5"
                              data-testid="input-floor"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="notes" className="text-sm">
                            {t("ملاحظات التوصيل", "Delivery Notes")}
                          </Label>
                          <Textarea
                            id="notes"
                            value={customerInfo.notes}
                            onChange={handleInputChange("notes")}
                            placeholder={t("مثال: بجانب المسجد، الباب الأزرق", "Example: Next to the mosque, blue door")}
                            className="mt-1.5 resize-none"
                            rows={2}
                            data-testid="input-notes"
                          />
                        </div>
                      </div>

                      {createPaymentMutation.error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
                          {t("حدث خطأ. يرجى المحاولة مرة أخرى.", "An error occurred. Please try again.")}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full rounded-full h-12 text-base font-semibold" 
                        size="lg"
                        disabled={createPaymentMutation.isPending}
                        data-testid="button-continue-payment"
                      >
                        {createPaymentMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 me-2 animate-spin" />
                            {t("جاري التحميل...", "Loading...")}
                          </>
                        ) : (
                          <>
                            {t("متابعة للدفع", "Continue to Payment")}
                            <ArrowLeft className={`h-5 w-5 ms-2 ${isRTL ? "" : "rotate-180"}`} />
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {step === "payment" && clientSecret && (
                    <div className="space-y-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("info")}
                        className="mb-2"
                        data-testid="button-back-info"
                      >
                        <ArrowLeft className={`h-4 w-4 me-2 ${isRTL ? "rotate-180" : ""}`} />
                        {t("تعديل معلومات التوصيل", "Edit Delivery Information")}
                      </Button>
                      
                      <div className="bg-muted/50 p-4 rounded-md space-y-2">
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-foreground">{customerInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                            <p className="text-sm text-muted-foreground">{customerInfo.phone}</p>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">
                            <p>{customerInfo.area}, {t("قطعة", "Block")} {customerInfo.block}</p>
                            <p>{t("شارع", "Street")} {customerInfo.street}
                              {customerInfo.building && `, ${t("مبنى", "Building")} ${customerInfo.building}`}
                              {customerInfo.floor && `, ${t("طابق", "Floor")} ${customerInfo.floor}`}
                            </p>
                            {customerInfo.notes && (
                              <p className="mt-1 italic">{customerInfo.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Elements
                        stripe={getStripe()}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#E37E16",
                              colorBackground: "#ffffff",
                              colorText: "#1a1a1a",
                              colorDanger: "#dc2626",
                              fontFamily: '"Open Sans", system-ui, sans-serif',
                              borderRadius: "8px",
                              spacingUnit: "4px",
                            },
                            rules: {
                              '.Input': {
                                border: '1px solid #e5e7eb',
                                boxShadow: 'none',
                                padding: '12px',
                              },
                              '.Input:focus': {
                                border: '2px solid #E37E16',
                                boxShadow: 'none',
                              },
                              '.Label': {
                                fontWeight: '500',
                                marginBottom: '8px',
                              },
                              '.Tab': {
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              },
                              '.Tab--selected': {
                                border: '2px solid #E37E16',
                                backgroundColor: '#FEF3E7',
                              },
                            },
                          },
                        }}
                      >
                        <PaymentForm 
                          clientSecret={clientSecret} 
                          orderId={orderId!}
                          onSuccess={() => setStep("success")}
                          totalPrice={totalPrice}
                        />
                      </Elements>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      {t("ملخص الطلب", "Order Summary")}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({totalItems} {t("منتج", "items")})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div 
                        key={item.product.id} 
                        className="flex gap-3"
                        data-testid={`checkout-item-${item.product.id}`}
                      >
                        <div className="relative">
                          <img
                            src={imageMap[item.product.category] || item.product.image}
                            alt={language === "ar" ? item.product.nameAr : item.product.nameEn}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                          <div className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate text-foreground">
                            {language === "ar" ? item.product.nameAr : item.product.nameEn}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {parseFloat(item.product.price).toFixed(3)} {t("د.ك", "KWD")} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="font-semibold text-sm">
                            {(parseFloat(item.product.price) * item.quantity).toFixed(3)} {t("د.ك", "KWD")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span className="text-foreground">{totalPrice.toFixed(3)} {t("د.ك", "KWD")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                      <span className="text-green-600 font-medium">{t("مجاني", "Free")}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">{t("الإجمالي", "Total")}</span>
                    <span className="text-2xl font-bold text-primary">{totalPrice.toFixed(3)} {t("د.ك", "KWD")}</span>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">{t("توصيل مجاني لجميع الطلبات", "Free delivery on all orders")}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4">
                    <img src="https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5ngr8p9rx3jxr/Visa_Brandmark_Blue_RGB_2021.svg" alt="Visa" className="h-6 opacity-70" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-70" />
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Shield className="h-4 w-4" />
                      <span>{t("دفع آمن", "Secure")}</span>
                    </div>
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
