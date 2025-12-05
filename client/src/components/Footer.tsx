import { SiInstagram, SiWhatsapp, SiSnapchat } from "react-icons/si";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@assets/logo.jpg";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { ar: "الرئيسية", en: "Home", href: "/" },
    { ar: "من نحن", en: "About Us", href: "#" },
    { ar: "سياسة الخصوصية", en: "Privacy Policy", href: "#" },
    { ar: "شروط الاستخدام", en: "Terms of Use", href: "#" },
    { ar: "سياسة الاسترجاع", en: "Return Policy", href: "#" },
  ];

  const socialLinks = [
    {
      icon: SiInstagram,
      href: "https://instagram.com/althenayanfarms",
      label: "Instagram",
    },
    { icon: SiWhatsapp, href: "https://wa.me/96599999999", label: "WhatsApp" },
    {
      icon: SiSnapchat,
      href: "https://snapchat.com/add/althenayanfarms",
      label: "Snapchat",
    },
  ];

  return (
    <footer className="bg-sidebar border-t border-sidebar-border">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div>
            <img
              src={logoImage}
              alt={t("مزرعة الثنيان", "Al Thenayan Farms")}
              className="h-20 w-auto mb-4"
            />
            <p className="text-sidebar-foreground leading-relaxed">
              {t(
                "مزرعة الثنيان - نقدم لكم أجود المنتجات الطازجة من المزرعة مباشرة إلى مائدتكم. جودة عالية وأسعار منافسة.",
                "Al Thenayan Farms - We bring you the finest fresh products directly from our farm to your table. High quality and competitive prices."
              )}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-sidebar-foreground mb-4">
              {t("روابط سريعة", "Quick Links")}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.en}>
                  <a
                    href={link.href}
                    className="text-sidebar-foreground hover:text-primary transition-colors"
                    data-testid={`link-footer-${link.en.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {t(link.ar, link.en)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-sidebar-foreground mb-4">
              {t("تواصل معنا", "Contact Us")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sidebar-foreground">
                  {t(
                    "الكويت - منطقة الوفرة الزراعية",
                    "Kuwait - Wafra Agricultural Area"
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="tel:+96599999999"
                  className="text-sidebar-foreground hover:text-primary transition-colors"
                  dir="ltr"
                  data-testid="link-phone"
                >
                  +965 9999 9999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@althenayanfarms.com"
                  className="text-sidebar-foreground hover:text-primary transition-colors"
                  data-testid="link-email"
                >
                  info@althenayanfarms.com
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sidebar-accent hover:bg-primary hover:text-primary-foreground text-sidebar-foreground p-2.5 rounded-full transition-colors"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-start">
              {t(
                "© 2024 مزرعة الثنيان. جميع الحقوق محفوظة.",
                "© 2024 Al Thenayan Farms. All rights reserved."
              )}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t("طرق الدفع:", "Payment Methods:")}
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-card text-card-foreground px-3 py-1 rounded text-xs font-medium">
                  KNET
                </span>
                <span className="bg-card text-card-foreground px-3 py-1 rounded text-xs font-medium">
                  Visa
                </span>
                <span className="bg-card text-card-foreground px-3 py-1 rounded text-xs font-medium">
                  Mastercard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
