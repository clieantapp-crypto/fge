import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

export default function CartSlideOut() {
  const { t, language, isRTL } = useLanguage();
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
        data-testid="cart-overlay"
      />

      <div
        className={`fixed top-0 ${
          isRTL ? "left-0" : "right-0"
        } h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col transform transition-transform duration-300 ${
          isCartOpen
            ? "translate-x-0"
            : isRTL
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
        data-testid="cart-slideout"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground" data-testid="text-cart-title">
            {t("عربة التسوق الخاصة بك", "Your Shopping Cart")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("سلة التسوق الخاصة بك فارغة", "Your cart is empty")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t(
                  "أضف بعض المنتجات للبدء",
                  "Add some products to get started"
                )}
              </p>
              <Button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                data-testid="button-continue-shopping"
              >
                {t("متابعة التسوق", "Continue Shopping")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-card rounded-md border border-card-border"
                  data-testid={`cart-item-${item.product.id}`}
                >
                  <img
                    src={item.product.image}
                    alt={
                      language === "ar"
                        ? item.product.nameAr
                        : item.product.nameEn
                    }
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                      {language === "ar"
                        ? item.product.nameAr
                        : item.product.nameEn}
                    </h4>

                    <p className="text-primary font-bold mt-1">
                      {parseFloat(item.product.price).toFixed(3)}{" "}
                      {t("د.ك", "KWD")}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span
                        className="w-8 text-center font-medium text-foreground"
                        data-testid={`text-quantity-${item.product.id}`}
                      >
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="ms-auto text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.product.id)}
                        data-testid={`button-remove-${item.product.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("المجموع التقديري", "Estimated Total")}
              </span>
              <span
                className="text-xl font-bold text-foreground"
                data-testid="text-cart-total"
              >
                {totalPrice.toFixed(3)} {t("د.ك", "KWD")}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {t(
                "يتم احتساب الضرائب والخصومات والشحن عند الخروج.",
                "Taxes, discounts and shipping calculated at checkout."
              )}
            </p>

            <Button
              className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              data-testid="button-checkout"
            >
              {t("الدفع", "Checkout")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
