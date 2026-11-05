import React from "react";
import { 
  ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Package, Book, BookOpen, ShieldCheck, Truck 
} from "lucide-react";
import { CartItem } from "../types";

interface StoreCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const StoreCartDrawer: React.FC<StoreCartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const physicalItems = cart.filter(i => i.type === "book" || i.type === "stationery");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-base text-white tracking-wide">Shopping Cart</h3>
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Study Hub Store Checkout</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="px-2.5 py-1.5 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold"
                  title="Clear all items in cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery perk info banner */}
          {physicalItems.length > 0 && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 flex items-center space-x-2 text-xs text-emerald-900">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                You've unlocked <strong>Free Home Postal Delivery</strong> on all book & stationery items!
              </span>
            </div>
          )}

          {/* Items List Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-800">Your Cart is Empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Explore our collection of MP Board reference books, test kits, formula handbooks, and competitive coaching modules.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Start Browsing Store
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const itemSubtotal = item.price * item.quantity;
                  return (
                    <div 
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-slate-300 transition-all flex gap-3.5 items-start"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                            {item.type === "course" ? (
                              <BookOpen className="w-6 h-6 text-violet-500" />
                            ) : item.type === "stationery" ? (
                              <Package className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <Book className="w-6 h-6 text-indigo-500" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Details & Controls */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                              item.type === "course"
                                ? "bg-violet-100 text-violet-800"
                                : item.type === "stationery"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}>
                              {item.authorOrBrand || item.type}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-1 leading-snug">
                              {item.title}
                            </h4>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price & Quantity Adjuster */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                              {item.price > 0 ? `₹${item.price}` : "FREE"}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                each
                              </span>
                            )}
                          </div>

                          {/* Quantity control */}
                          {item.type === "course" ? (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                              1 Enrollment
                            </span>
                          ) : (
                            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs text-xs"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-slate-900 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs text-xs"
                                title="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Line subtotal */}
                        <div className="flex justify-end pt-1 text-[11px] font-mono">
                          <span className="text-slate-500 mr-1.5">Subtotal:</span>
                          <strong className="text-slate-900 font-extrabold">
                            {itemSubtotal > 0 ? `₹${itemSubtotal}` : "₹0 (Free)"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-mono font-bold text-slate-900">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Home Postal Delivery</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px]">
                    FREE (₹0)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Educational Discount</span>
                  <span className="text-slate-500 font-mono">Included</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
                  <span className="font-extrabold text-slate-900">Total Payable Amount</span>
                  <span className="font-black text-indigo-700 font-mono text-base sm:text-lg">
                    {totalPrice > 0 ? `₹${totalPrice}` : "FREE"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onProceedToCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Single Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Study Hub Academic Materials & Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
