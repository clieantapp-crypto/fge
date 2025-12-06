import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  User,
  ExternalLink,
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
import { useLocation } from "wouter";

const imageMap: Record<string, string> = {
  fish: tilapiaImg,
  duck: duckImg,
  pigeon: pigeonImg,
  eggs: eggsImg,
  chicken: chickenImg,
  lamb: lambImg,
  goat: lambImg,
};

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

export default function Checkout() {
  const { t, language, isRTL } = useLanguage();
  const { items, totalPrice, sessionId, totalItems, clearCart } = useCart();
  const [step, setStep] = useState<
    "info" | "payment" | "processing" | "success"
  >("info");
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

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout/create-order", {
        amount: totalPrice,
        sessionId,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        paymentMethod: "knet",
        shippingAddress: {
          name: customerInfo.name,
          area: customerInfo.area,
          block: customerInfo.block,
          street: customerInfo.street,
          building: customerInfo.building,
          floor: customerInfo.floor,
          notes: customerInfo.notes,
        },
        cartItems: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setOrderId(data.orderId);
      setStep("payment");
    },
  });

  const processKnetPayment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/checkout/process-knet", {
        orderId,
        sessionId,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.redirectUrl) {
        window.location.href = "/kpay";
      } else {
        clearCart();
        window.location.href = "/kpay";
      }
    },
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate();
  };

  const handleKnetPayment = () => {
    setStep("processing");
    setTimeout(() => {
      window.location.href = "/kpay";
    }, 3000);
    //setLocation("/kpay");
    //processKnetPayment.mutate();
  };

  const handleInputChange =
    (field: keyof CustomerInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                {t(
                  "أضف منتجات للمتابعة للدفع",
                  "Add products to proceed to checkout",
                )}
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

  if (step === "processing") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 bg-background">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-8 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">
                {t("جاري التحويل لبوابة كي نت", "Redirecting to KNET Gateway")}
              </h2>
              <p className="text-muted-foreground">
                {t("يرجى الانتظار...", "Please wait...")}
              </p>
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
                  "Thank you for shopping at Al Thenayan Farms. We'll contact you soon to confirm delivery.",
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
                  <p className="text-sm font-medium">
                    {t("التوصيل", "Delivery")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("خلال ٢٤ ساعة", "Within 24 hours")}
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-md">
                  <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">
                    {t("التواصل", "Contact")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("سنتصل بك", "We'll call you")}
                  </p>
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
            <div className="flex items-center gap-2 text-primary">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
                {step === "info" ? "1" : <CheckCircle className="h-4 w-4" />}
              </div>
              <span className="font-medium hidden sm:inline">
                {t("معلومات التوصيل", "Delivery Info")}
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div
              className={`flex items-center gap-2 ${step !== "info" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step !== "info"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="font-medium hidden sm:inline">
                {t("الدفع", "Payment")}
              </span>
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
                          <span>
                            {t("معلومات التوصيل", "Delivery Information")}
                          </span>
                          <p className="text-sm font-normal text-muted-foreground mt-0.5">
                            {t(
                              "أدخل بياناتك لتوصيل الطلب",
                              "Enter your details for delivery",
                            )}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span>{t("الدفع عبر كي نت", "Pay via KNET")}</span>
                          <p className="text-sm font-normal text-muted-foreground mt-0.5">
                            {t(
                              "سيتم تحويلك لبوابة الدفع الآمنة",
                              "You will be redirected to secure payment gateway",
                            )}
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
                              {t("الاسم الكامل", "Full Name")}{" "}
                              <span className="text-destructive">*</span>
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
                              {t("البريد الإلكتروني", "Email")}{" "}
                              <span className="text-destructive">*</span>
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
                              {t("رقم الهاتف", "Phone Number")}{" "}
                              <span className="text-destructive">*</span>
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
                              {t("المنطقة", "Area")}{" "}
                              <span className="text-destructive">*</span>
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
                              {t("القطعة", "Block")}{" "}
                              <span className="text-destructive">*</span>
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
                              {t("الشارع", "Street")}{" "}
                              <span className="text-destructive">*</span>
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
                            placeholder={t(
                              "مثال: بجانب المسجد، الباب الأزرق",
                              "Example: Next to the mosque, blue door",
                            )}
                            className="mt-1.5 resize-none"
                            rows={2}
                            data-testid="input-notes"
                          />
                        </div>
                      </div>

                      {createOrderMutation.error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
                          {t(
                            "حدث خطأ. يرجى المحاولة مرة أخرى.",
                            "An error occurred. Please try again.",
                          )}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full rounded-full h-12 text-base font-semibold"
                        size="lg"
                        disabled={createOrderMutation.isPending}
                        data-testid="button-continue-payment"
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 me-2 animate-spin" />
                            {t("جاري التحميل...", "Loading...")}
                          </>
                        ) : (
                          <>
                            {t("متابعة للدفع", "Continue to Payment")}
                            <ArrowLeft
                              className={`h-5 w-5 ms-2 ${isRTL ? "" : "rotate-180"}`}
                            />
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {step === "payment" && (
                    <div className="space-y-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep("info")}
                        className="mb-2"
                        data-testid="button-back-info"
                      >
                        <ArrowLeft
                          className={`h-4 w-4 me-2 ${isRTL ? "rotate-180" : ""}`}
                        />
                        {t(
                          "تعديل معلومات التوصيل",
                          "Edit Delivery Information",
                        )}
                      </Button>

                      <div className="bg-muted/50 p-4 rounded-md space-y-2">
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {customerInfo.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customerInfo.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customerInfo.phone}
                            </p>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">
                            <p>
                              {customerInfo.area}, {t("قطعة", "Block")}{" "}
                              {customerInfo.block}
                            </p>
                            <p>
                              {t("شارع", "Street")} {customerInfo.street}
                              {customerInfo.building &&
                                `, ${t("مبنى", "Building")} ${customerInfo.building}`}
                              {customerInfo.floor &&
                                `, ${t("طابق", "Floor")} ${customerInfo.floor}`}
                            </p>
                            {customerInfo.notes && (
                              <p className="mt-1 italic">
                                {customerInfo.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-16 w-24 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center p-2 shadow-sm">
                            <img
                              src="/knt.svg"
                              alt="KNET"
                              className="h-12 w-auto"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {t("الدفع عبر كي نت", "Pay via KNET")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t(
                                "بوابة الدفع الإلكتروني الكويتية",
                                "Kuwait Electronic Payment Gateway",
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 text-blue-600" />
                            {t("دفع آمن ومشفر", "Secure and encrypted payment")}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4 text-blue-600" />
                            {t("حماية بيانات البطاقة", "Card data protection")}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            {t(
                              "يدعم جميع البطاقات الكويتية",
                              "Supports all Kuwaiti cards",
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-md mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              {t("المبلغ المطلوب", "Amount Due")}
                            </span>
                            <span className="text-2xl font-bold text-primary">
                              {totalPrice.toFixed(3)} {t("د.ك", "KWD")}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={handleKnetPayment}
                          className="w-full rounded-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                          size="lg"
                          disabled={processKnetPayment.isPending}
                          data-testid="button-pay-knet"
                        >
                          {processKnetPayment.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 me-2 animate-spin" />
                              {t("جاري التحويل...", "Redirecting...")}
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-5 w-5 me-2" />
                              {t("ادفع الآن عبر كي نت", "Pay Now via KNET")}
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>{t("حماية المشتري", "Buyer Protection")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="h-4 w-4" />
                          <span>{t("SSL مشفر", "SSL Encrypted")}</span>
                        </div>
                      </div>
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
                    {items.map((item) => {
                      const hasDiscount =
                        item.product.isOnSale && item.product.originalPrice;
                      return (
                        <div
                          key={item.product.id}
                          className="flex gap-3"
                          data-testid={`checkout-item-${item.product.id}`}
                        >
                          <div className="relative">
                            <img
                              src={
                                imageMap[item.product.category] ||
                                item.product.image
                              }
                              alt={
                                language === "ar"
                                  ? item.product.nameAr
                                  : item.product.nameEn
                              }
                              className="w-14 h-14 object-cover rounded-md"
                            />
                            <div className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                              {item.quantity}
                            </div>
                            {hasDiscount && (
                              <div className="absolute -bottom-1 -start-1 bg-red-500 text-white text-[10px] px-1 rounded">
                                -{item.product.discountPercent}%
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate text-foreground">
                              {language === "ar"
                                ? item.product.nameAr
                                : item.product.nameEn}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {parseFloat(item.product.price).toFixed(3)}{" "}
                              {t("د.ك", "KWD")} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="font-semibold text-sm">
                              {(
                                parseFloat(item.product.price) * item.quantity
                              ).toFixed(3)}{" "}
                              {t("د.ك", "KWD")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("المجموع الفرعي", "Subtotal")}
                      </span>
                      <span className="text-foreground">
                        {totalPrice.toFixed(3)} {t("د.ك", "KWD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("التوصيل", "Delivery")}
                      </span>
                      <span className="text-green-600 font-medium">
                        {t("مجاني", "Free")}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">
                      {t("الإجمالي", "Total")}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {totalPrice.toFixed(3)} {t("د.ك", "KWD")}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">
                        {t(
                          "توصيل مجاني لجميع الطلبات",
                          "Free delivery on all orders",
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        KNET
                      </span>
                    </div>
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
