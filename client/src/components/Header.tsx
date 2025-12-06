import { Search, User, ShoppingCart, ChevronDown, Menu, X, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLocation } from "wouter";
import logoImage from "@assets/logo.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className={`flex items-center gap-4 ${isRTL ? "order-last" : "order-first"}`}>
            <a href="/" className="flex items-center" data-testid="link-home">
              <img
                src={logoImage}
                alt={t("مزرعة الثنيان", "Al Thenayan Farms")}
                className="h-12 md:h-14 w-auto"
              />
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="text-foreground font-medium hover:text-primary transition-colors"
              data-testid="link-main"
            >
              {t("الرئيسية", "Home")}
            </a>
          </nav>

          <div className={`flex items-center gap-2 md:gap-4 ${isRTL ? "order-first" : "order-last"}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-sm"
                  data-testid="button-language-toggle"
                >
                  <span>{language === "ar" ? "العربية" : "English"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem
                  onClick={() => setLanguage("ar")}
                  className={language === "ar" ? "bg-accent" : ""}
                  data-testid="menu-item-arabic"
                >
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-accent" : ""}
                  data-testid="menu-item-english"
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {!loading && (
              isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex relative"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.displayName || t("مستخدم", "User")}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/orders")} data-testid="menu-item-orders">
                      {t("طلباتي", "My Orders")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} data-testid="menu-item-logout">
                      <LogOut className="h-4 w-4 me-2" />
                      {t("تسجيل الخروج", "Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => setLocation("/login")}
                  data-testid="button-login"
                >
                  <User className="h-5 w-5" />
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <a
                href="/"
                className="text-foreground font-medium hover:text-primary transition-colors"
                data-testid="link-main-mobile"
              >
                {t("الرئيسية", "Home")}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="justify-start" data-testid="button-search-mobile">
                  <Search className="h-5 w-5 me-2" />
                  {t("بحث", "Search")}
                </Button>
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start" 
                      onClick={() => setLocation("/orders")}
                      data-testid="button-orders-mobile"
                    >
                      {t("طلباتي", "My Orders")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-destructive" 
                      onClick={handleSignOut}
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="h-5 w-5 me-2" />
                      {t("تسجيل الخروج", "Sign Out")}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => setLocation("/login")}
                    data-testid="button-login-mobile"
                  >
                    <LogIn className="h-5 w-5 me-2" />
                    {t("تسجيل الدخول", "Sign In")}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
