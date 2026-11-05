import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, BookOpen, Book, Package, Play, CheckCircle2, 
  Truck, ShieldCheck, MapPin, Phone, Mail, User, X, Sparkles, Filter, AlertCircle, Building2, Search, Calendar, Clock, CreditCard,
  MessageSquare, Bot, Send, Trash2, Edit3, RefreshCw, Printer, ShoppingCart, Plus, Minus, ArrowRight, Check, Headphones, Boxes
} from "lucide-react";
import { Course, StoreItem, StoreOrder, Student, StudyHubCenter, SupportMessage, CartItem } from "../types";
import { initialStudyHubCenters, initialStoreItems } from "../data";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import StoreHelpDesk from "./StoreHelpDesk";
import { StoreCartDrawer } from "./StoreCartDrawer";

interface StoreViewProps {
  courses: Course[];
  storeItems: StoreItem[];
  storeOrders: StoreOrder[];
  studyHubCenters?: StudyHubCenter[];
  currentUser?: {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: string;
  };
  onPlaceOrder: (order: StoreOrder) => void;
  onAskDoubt?: (courseId: string, doubtMsg: string) => void;
  supportMessages?: SupportMessage[];
  setSupportMessages?: React.Dispatch<React.SetStateAction<SupportMessage[]>>;
  setStoreOrders?: React.Dispatch<React.SetStateAction<StoreOrder[]>>;
  initialTab?: "courses" | "books" | "stationery" | "centers" | "my-orders" | "helpdesk";
  onNavigateToInventory?: () => void;
}

export default function StoreView({
  courses = [],
  storeItems = [],
  storeOrders = [],
  studyHubCenters = initialStudyHubCenters,
  currentUser,
  onPlaceOrder,
  onAskDoubt,
  supportMessages = [],
  setSupportMessages,
  setStoreOrders,
  initialTab = "books",
  onNavigateToInventory,
}: StoreViewProps) {
  const safeCenters = studyHubCenters || initialStudyHubCenters || [];
  const safeOrders = storeOrders || [];
  const safeCourses = courses || [];
  const safeStoreItems = storeItems || [];

  const isStudentOrTeacher = currentUser?.role === "student" || currentUser?.role === "teacher";
  const defaultTab = isStudentOrTeacher 
    ? (initialTab === "my-orders" ? "my-orders" : "courses")
    : (initialTab || "books");

  // Store Tab filter
  const [activeTab, setActiveTab] = useState<"courses" | "books" | "stationery" | "centers" | "my-orders" | "helpdesk">(defaultTab);

  useEffect(() => {
    if (isStudentOrTeacher) {
      if (initialTab === "my-orders") {
        setActiveTab("my-orders");
      } else {
        setActiveTab("courses");
      }
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isStudentOrTeacher]);
  
  // Search state for books/stationery
  const [itemSearch, setItemSearch] = useState("");

  // Modals for direct order card actions (Change Address & Cancel Order)
  const [editingAddressOrder, setEditingAddressOrder] = useState<StoreOrder | null>(null);
  const [editAddressText, setEditAddressText] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<StoreOrder | null>(null);
  const [cancelOrderReason, setCancelOrderReason] = useState("");

  // Shopping Cart State & Persistence
  const cartStorageKey = `store_cart_${currentUser?.id || "guest"}`;
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(cartStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  }, [cart, cartStorageKey]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [cartToast, setCartToast] = useState<{ message: string; visible: boolean } | null>(null);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const showCartToast = (message: string) => {
    setCartToast({ message, visible: true });
    setTimeout(() => {
      setCartToast(prev => (prev ? { ...prev, visible: false } : null));
    }, 2800);
  };

  const handleAddToCart = (
    item: { id: string; title: string; type: "course" | "book" | "stationery"; price: number; description?: string; image?: string; authorOrBrand?: string },
    qty = 1,
    openCart = false
  ) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (item.type === "course") {
          showCartToast(`"${item.title}" is already in your cart!`);
          return prev;
        }
        showCartToast(`Updated "${item.title}" in cart (+${qty})`);
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      showCartToast(`Added "${item.title}" to cart!`);
      return [...prev, {
        id: item.id,
        title: item.title,
        type: item.type,
        price: item.price,
        description: item.description,
        image: item.image,
        authorOrBrand: item.authorOrBrand,
        quantity: qty
      }];
    });

    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.id === id) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showCartToast("Item removed from cart");
  };

  const handleClearCart = () => {
    setCart([]);
    showCartToast("Cart cleared");
  };

  // Address Checkout Form & Payment Gateway Selection
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash on Delivery (COD)");
  const [selectedCenterId, setSelectedCenterId] = useState<string>(safeCenters[0]?.id || "");
  const [centerSearch, setCenterSearch] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [studentMobile, setStudentMobile] = useState(currentUser?.mobileNumber || "9876543210");
  const [studentEmail, setStudentEmail] = useState(currentUser?.email || "student@studyhub.edu");
  const [studentName, setStudentName] = useState(currentUser?.name || "Student Scholar");
  const [qualification, setQualification] = useState("Class 12th / Undergraduate");

  // Success Notification banner after placing order
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    itemTitle: string;
    totalAmount: number;
    paymentMethod: string;
    centerName?: string;
    email: string;
    mobile: string;
    itemType: string;
  } | null>(null);

  // Search filter for centers
  const filteredCenters = safeCenters.filter(c => 
    c.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
    c.city.toLowerCase().includes(centerSearch.toLowerCase()) ||
    c.pincode.includes(centerSearch) ||
    c.address.toLowerCase().includes(centerSearch.toLowerCase())
  );

  // Filter books and stationery
  const bookItems = safeStoreItems.filter(i => i.type === "book");
  const filteredBooks = bookItems.filter(b => 
    b.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    b.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (b.authorOrBrand && b.authorOrBrand.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const stationeryItems = safeStoreItems.filter(i => i.type === "stationery");
  const filteredStationery = stationeryItems.filter(s => 
    s.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (s.authorOrBrand && s.authorOrBrand.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  // Only show published & unblocked courses in store
  const visibleCourses = safeCourses.filter(c => c.isPublished && !c.isBlocked);

  const handlePrintOrderReceipt = (order: StoreOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print/download the order receipt.");
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.itemName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${(item.price || 0).toLocaleString("en-IN")}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</td>
      </tr>
    `
      )
      .join("");

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; color: #c2410c; letter-spacing: 1px; }
            .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
            .badge { background: #ffedf0; color: #c2410c; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; border: 1px solid #fecdd3; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
            .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 13px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .total-box { text-align: right; margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
            .actions { margin-top: 30px; text-align: center; }
            .btn { background: #ea580c; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            @media print { .actions { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">COACHING HUB STORE</div>
              <div class="sub">OFFICIAL TAX INVOICE & ORDER RECEIPT</div>
            </div>
            <div class="badge">${order.status || "CONFIRMED"}</div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="label">Order Information</div>
              <div class="val">Order ID: #${order.id}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Date: ${order.orderDate || new Date().toLocaleDateString("en-IN")}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Payment Method: ${order.paymentMethod || "Center Payment"}</div>
            </div>
            <div class="box">
              <div class="label">Customer / Student Details</div>
              <div class="val">${order.studentName || currentUser?.name || "Student"}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 4px;">Phone: ${order.studentMobile || currentUser?.mobileNumber || "N/A"}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Email: ${order.studentEmail || currentUser?.email || "N/A"}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 2px;">Delivery Address: ${order.shippingAddress || "Home Delivery / Center"}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Item / Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <div style="font-size: 12px; color: #64748b;">Subtotal: ₹${(order.totalAmount || 0).toLocaleString("en-IN")}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Taxes & Handling: Inclusive</div>
            <div style="font-size: 18px; font-weight: 900; color: #ea580c; margin-top: 8px;">Grand Total: ₹${(order.totalAmount || 0).toLocaleString("en-IN")}</div>
          </div>

          ${
            order.adminComment
              ? `
            <div style="margin-top: 20px; font-size: 11px; color: #475569; background: #fff7ed; padding: 10px; border-radius: 8px; border: 1px solid #ffedd5;">
              <strong>Verification Note:</strong> ${order.adminComment}
            </div>
          `
              : ""
          }

          <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #94a3b8;">
            <div>
              <p>Authorized Signature: _______________________</p>
              <p style="margin-top: 4px;">CoachingHub Admissions & Store Department</p>
            </div>
            <div>Thank you for your order! Keep this receipt for verification.</div>
          </div>

          <div class="actions">
            <button class="btn" onclick="window.print()">🖨️ Print Receipt / Download PDF</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleOpenCheckout = (
    itemsOrSingle: CartItem | CartItem[] | { 
      id: string; 
      title: string; 
      type: "course" | "book" | "stationery"; 
      price: number; 
      description?: string;
      image?: string;
      authorOrBrand?: string;
      quantity?: number;
    }, 
    preselectedCenterId?: string
  ) => {
    const itemsList: CartItem[] = Array.isArray(itemsOrSingle)
      ? itemsOrSingle
      : [{
          id: itemsOrSingle.id,
          title: itemsOrSingle.title,
          type: itemsOrSingle.type,
          price: itemsOrSingle.price,
          description: itemsOrSingle.description,
          image: itemsOrSingle.image,
          authorOrBrand: itemsOrSingle.authorOrBrand,
          quantity: itemsOrSingle.quantity || 1
        }];

    if (itemsList.length === 0) return;

    setCheckoutItems(itemsList);
    setShippingAddress("");
    
    const isFreeOrAllCourses = itemsList.every(i => i.price === 0 || i.type === "course");
    if (isFreeOrAllCourses) {
      setPaymentMethod("Free Admission & Verification Request");
    } else {
      setPaymentMethod("Cash on Delivery (COD)");
    }
    if (preselectedCenterId) {
      setSelectedCenterId(preselectedCenterId);
    }
    if (currentUser) {
      if (currentUser.name) setStudentName(currentUser.name);
      if (currentUser.email) setStudentEmail(currentUser.email);
      if (currentUser.mobileNumber) setStudentMobile(currentUser.mobileNumber);
    }
    setIsCheckoutOpen(true);
  };

  const handleInstantBuy = (item: {
    id: string;
    title: string;
    type: "course" | "book" | "stationery";
    price: number;
    description?: string;
    image?: string;
    authorOrBrand?: string;
  }) => {
    // Add to cart if not already present so user has record
    setCart(prev => {
      if (!prev.some(i => i.id === item.id)) {
        return [...prev, {
          id: item.id,
          title: item.title,
          type: item.type,
          price: item.price,
          description: item.description,
          image: item.image,
          authorOrBrand: item.authorOrBrand,
          quantity: 1
        }];
      }
      return prev;
    });
    
    const currentInCart = cart.find(i => i.id === item.id);
    handleOpenCheckout({
      id: item.id,
      title: item.title,
      type: item.type,
      price: item.price,
      description: item.description,
      image: item.image,
      authorOrBrand: item.authorOrBrand,
      quantity: currentInCart ? currentInCart.quantity : 1
    });
  };

  const handleProceedToCheckoutFromCart = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    handleOpenCheckout(cart);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;

    const totalQty = checkoutItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalPrice = checkoutItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const hasCourse = checkoutItems.some(it => it.type === "course");
    const selectedCenter = safeCenters.find(c => c.id === selectedCenterId) || safeCenters[0];
    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let initialStatus: any = "Placed";
    let defaultComment = `Order placed on ${dateStr} for ${totalQty} item(s). Express delivery in 3-5 working days.`;

    if (hasCourse || totalPrice === 0) {
      initialStatus = "Pending Confirmation";
      defaultComment = `Course order placed on ${dateStr}. Awaiting Admin confirmation to unlock course dashboard access.`;
    } else if (paymentMethod === "Cash on Delivery (COD)") {
      initialStatus = "Placed";
      defaultComment = `Cash on Delivery order registered on ${dateStr}. Express delivery in 3-5 working days.`;
    } else if (paymentMethod === "Offline Payment at Study Hub Center") {
      initialStatus = "Pending Payment at Center";
      defaultComment = `Offline pickup order created. Collect from ${selectedCenter?.name || 'Selected Center'}.`;
    } else {
      initialStatus = "Confirmed";
      defaultComment = `Payment received via ${paymentMethod} on ${dateStr}. Preparing order dispatch.`;
    }

    const newOrder: StoreOrder = {
      id: "ORD-2026-" + Math.floor(1000 + Math.random() * 9000),
      studentId: currentUser?.id || "s_guest",
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      studentMobile: studentMobile.trim(),
      items: checkoutItems.map(item => ({
        itemId: item.id,
        itemName: item.title,
        price: item.price || 0,
        quantity: item.quantity || 1,
        itemType: item.type,
        courseId: item.type === "course" ? item.id : undefined
      })),
      totalAmount: totalPrice,
      paymentMethod: paymentMethod,
      centerId: selectedCenter?.id,
      centerName: selectedCenter?.name,
      centerAddress: selectedCenter?.address,
      shippingAddress: shippingAddress.trim() || selectedCenter?.address || "Student Registered Address",
      orderDate: dateStr,
      status: initialStatus,
      adminComment: defaultComment
    };

    onPlaceOrder(newOrder);

    // Remove the ordered items from the cart
    setCart(prev => prev.filter(c => !checkoutItems.some(it => it.id === c.id)));

    // Show Confirmation Banner
    const itemTitles = checkoutItems.map(i => `${i.title} (×${i.quantity})`).join(", ");
    setOrderConfirmation({
      orderId: newOrder.id,
      itemTitle: itemTitles,
      totalAmount: newOrder.totalAmount,
      paymentMethod: paymentMethod,
      centerName: newOrder.centerName,
      email: newOrder.studentEmail,
      mobile: newOrder.studentMobile,
      itemType: hasCourse ? "course" : "book"
    });

    setIsCheckoutOpen(false);
    setCheckoutItems([]);
  };

  // User's own order history
  const myOrders = safeOrders.filter(
    o => o.studentId === currentUser?.id || o.studentEmail === currentUser?.email || (currentUser?.role === "admin" && safeOrders.length > 0)
  );

  const handleUpdateOrderAddress = async (orderId: string, newAddr: string) => {
    if (!newAddr.trim()) return;
    const cleanAddr = newAddr.trim();
    const updatedOrders = safeOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, shippingAddress: cleanAddr };
      }
      return o;
    });

    if (setStoreOrders) {
      setStoreOrders(updatedOrders);
    }
    localStorage.setItem("co_store_orders", JSON.stringify(updatedOrders));

    const targetOrder = safeOrders.find(o => o.id === orderId);
    if (targetOrder) {
      const updatedObj = { ...targetOrder, shippingAddress: cleanAddr };
      try {
        await setDoc(doc(db, "storeOrders", orderId), updatedObj);
      } catch (err) {
        console.error("Error updating order address in Firestore:", err);
      }
    }

    // Append support thread log
    const studentId = currentUser?.id || targetOrder?.studentId || "student";
    const studentName = currentUser?.name || targetOrder?.studentName || "Student";
    const noteMsg: SupportMessage = {
      id: "supp_msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      senderId: studentId,
      senderName: studentName,
      senderRole: "student",
      content: `📍 Updated delivery address for Order #${orderId} to: "${cleanAddr}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString('en-IN'),
      studentId: studentId,
      relatedOrderId: orderId,
      messageType: "address_change_request",
      requestedAddress: cleanAddr
    };

    if (setSupportMessages) {
      setSupportMessages(prev => [...prev, noteMsg]);
    }
    try {
      await setDoc(doc(db, "supportMessages", noteMsg.id), noteMsg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrderAction = async (orderId: string, reason: string) => {
    const updatedOrders = safeOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: "Cancelled", adminComment: `Cancelled by student. Reason: ${reason || 'Not specified'}` };
      }
      return o;
    });

    if (setStoreOrders) {
      setStoreOrders(updatedOrders);
    }
    localStorage.setItem("co_store_orders", JSON.stringify(updatedOrders));

    const targetOrder = safeOrders.find(o => o.id === orderId);
    if (targetOrder) {
      const updatedObj = { 
        ...targetOrder, 
        status: "Cancelled", 
        adminComment: `Cancelled by student. Reason: ${reason || 'Not specified'}` 
      };
      try {
        await setDoc(doc(db, "storeOrders", orderId), updatedObj);
      } catch (err) {
        console.error("Error cancelling order in Firestore:", err);
      }
    }

    // Append support thread log
    const studentId = currentUser?.id || targetOrder?.studentId || "student";
    const studentName = currentUser?.name || targetOrder?.studentName || "Student";
    const noteMsg: SupportMessage = {
      id: "supp_msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      senderId: studentId,
      senderName: studentName,
      senderRole: "student",
      content: `❌ Cancelled Order #${orderId}. Reason: ${reason || 'Cancelled by student'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString('en-IN'),
      studentId: studentId,
      relatedOrderId: orderId,
      messageType: "cancel_request"
    };

    if (setSupportMessages) {
      setSupportMessages(prev => [...prev, noteMsg]);
    }
    try {
      await setDoc(doc(db, "supportMessages", noteMsg.id), noteMsg);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCustomMessageToAdmin = async (text: string) => {
    if (!text.trim()) return;
    const studentId = currentUser?.id || "student";
    const studentName = currentUser?.name || "Student";
    const newMsg: SupportMessage = {
      id: "supp_msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      senderId: studentId,
      senderName: studentName,
      senderRole: "student",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString('en-IN'),
      studentId: studentId,
      messageType: "text"
    };

    if (setSupportMessages) {
      setSupportMessages(prev => [...prev, newMsg]);
    }
    try {
      await setDoc(doc(db, "supportMessages", newMsg.id), newMsg);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Immediate Order Success Toast Banner */}
      {orderConfirmation && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-2xl shadow-lg space-y-2 relative animate-fade-in">
          <button 
            onClick={() => setOrderConfirmation(null)}
            className="absolute top-3 right-3 text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-800 font-black text-sm uppercase">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              {orderConfirmation.itemType === "course" 
                ? "Course Order Placed Successfully!" 
                : "Order Placed Successfully!"}
            </span>
          </div>

          <p className="text-xs text-emerald-950 font-medium">
            Order Reference <strong className="font-mono">{orderConfirmation.orderId}</strong> for <strong>"{orderConfirmation.itemTitle}"</strong> ({orderConfirmation.totalAmount > 0 ? `₹${orderConfirmation.totalAmount}` : "FREE"}) has been processed!
          </p>

          <div className="bg-amber-100 p-3 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
            <p className="font-bold">📦 Order Confirmation & Access Status:</p>
            <p>
              {orderConfirmation.itemType === "course"
                ? "Your course order has been recorded. As soon as the Admin confirms this order, the course will automatically appear in your 'My Course' dashboard."
                : `Your order has been logged with payment mode: ${orderConfirmation.paymentMethod}. Track live dispatch status in the 'My Orders' tab.`}
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Order confirmation sent to: <strong>{orderConfirmation.email}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>SMS updates sent to: <strong>{orderConfirmation.mobile}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Category Tabs - Sticky Top Bar (Only displayed in shopping/store views, NOT in Store Desk Dashboard) */}
      {activeTab !== "helpdesk" && (
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pt-1 pb-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {!isStudentOrTeacher && (
              <button
                onClick={() => setActiveTab("books")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "books" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Books & Study Guides ({bookItems.length})</span>
              </button>
            )}

            {!isStudentOrTeacher && (
              <button
                onClick={() => setActiveTab("stationery")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "stationery" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Stationery & Exam Kits ({stationeryItems.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "courses" ? "bg-violet-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Online Courses ({visibleCourses.length})</span>
            </button>

            {!isStudentOrTeacher && (
              <button
                onClick={() => setActiveTab("centers")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "centers" ? "bg-amber-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Explore Centers ({safeCenters.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("my-orders")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "my-orders" ? "bg-sky-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>My Orders ({myOrders.length})</span>
            </button>

            {/* REQUIRED & IMPORTANT: Store Help Desk Quick Switch Button */}
            {!isStudentOrTeacher && (
              <button
                onClick={() => setActiveTab("helpdesk")}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 shadow-xs"
                title="Open Store Help Desk & Customer Support"
              >
                <Headphones className="w-3.5 h-3.5 text-sky-600" />
                <span>Store Help Desk</span>
              </button>
            )}

            {/* Admin Quick Switch to Inventory Management */}
            {currentUser?.role === "admin" && onNavigateToInventory && (
              <button
                onClick={onNavigateToInventory}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 shadow-xs"
                title="Open Central Inventory & Stock Control"
              >
                <Boxes className="w-3.5 h-3.5 text-amber-600" />
                <span>Inventory Management</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {!isStudentOrTeacher && (activeTab === "books" || activeTab === "stationery") && (
              <div className="relative min-w-[180px] sm:min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === "books" ? "books & guides..." : "kits & items..."}`}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full bg-white text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>
            )}

            {/* Cart Button */}
            {!isStudentOrTeacher && (
              <button
                onClick={() => setIsCartOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative shadow-sm ${
                  totalCartItems > 0 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
                title="Open Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-indigo-400" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-900">
                      {totalCartItems}
                    </span>
                  )}
                </div>
                <span>Cart</span>
                {totalCartAmount > 0 && (
                  <span className="text-emerald-400 font-black pl-1 border-l border-slate-700">
                    ₹{totalCartAmount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Toast Notification */}
      <AnimatePresence>
        {!isStudentOrTeacher && cartToast?.visible && activeTab !== "helpdesk" && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 text-xs font-semibold"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{cartToast.message}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-indigo-300 hover:text-indigo-200 font-bold underline cursor-pointer ml-1"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: BOOKS & STUDY GUIDES */}
      {!isStudentOrTeacher && activeTab === "books" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Thumbnail Image */}
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-indigo-900/80 backdrop-blur-md text-indigo-100 font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg border border-indigo-700/50 uppercase">
                      {item.authorOrBrand || "Study HUB Books"}
                    </span>
                    {item.stockCount !== undefined && item.stockCount > 0 && item.stockCount < 5 ? (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm uppercase animate-pulse">
                        Low Stock ({item.stockCount} left)
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm uppercase">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 flex items-baseline space-x-2">
                      <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{Math.round(item.price * 1.3)}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        23% OFF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  {cart.some(c => c.id === item.id) ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-2 py-1 flex-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, -1)}
                          className="p-1 rounded-lg bg-white text-indigo-700 hover:bg-indigo-100 shadow-xs cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-indigo-900 px-1.5">
                          {cart.find(c => c.id === item.id)?.quantity || 1} in Cart
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, 1)}
                          className="p-1 rounded-lg bg-white text-indigo-700 hover:bg-indigo-100 shadow-xs cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInstantBuy({
                          id: item.id,
                          title: item.name,
                          type: "book",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        })}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>Checkout</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart({
                          id: item.id,
                          title: item.name,
                          type: "book",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        }, 1)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs uppercase py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => handleInstantBuy({
                          id: item.id,
                          title: item.name,
                          type: "book",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredBooks.length === 0 && (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Book className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-semibold">No book items found matching "{itemSearch}".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: STATIONERY & EXAM KITS */}
      {!isStudentOrTeacher && activeTab === "stationery" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStationery.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=400"} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 font-mono font-bold text-[10px] px-2.5 py-1 rounded-lg border border-slate-700/50 uppercase">
                      {item.authorOrBrand || "Study HUB Stationers"}
                    </span>
                    {item.stockCount !== undefined && item.stockCount > 0 && item.stockCount < 5 ? (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm uppercase animate-pulse">
                        Low Stock ({item.stockCount} left)
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-sm uppercase">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 flex items-baseline space-x-2">
                      <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                      <span className="text-xs text-slate-400 line-through">₹{Math.round(item.price * 1.25)}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Special Offer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  {cart.some(c => c.id === item.id) ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-2 py-1 flex-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, -1)}
                          className="p-1 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 shadow-xs cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-emerald-900 px-1.5">
                          {cart.find(c => c.id === item.id)?.quantity || 1} in Cart
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartQuantity(item.id, 1)}
                          className="p-1 rounded-lg bg-white text-emerald-700 hover:bg-emerald-100 shadow-xs cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInstantBuy({
                          id: item.id,
                          title: item.name,
                          type: "stationery",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        })}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>Checkout</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart({
                          id: item.id,
                          title: item.name,
                          type: "stationery",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        }, 1)}
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => handleInstantBuy({
                          id: item.id,
                          title: item.name,
                          type: "stationery",
                          price: item.price,
                          description: item.description,
                          image: item.image,
                          authorOrBrand: item.authorOrBrand
                        })}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredStationery.length === 0 && (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-semibold">No stationery items found matching "{itemSearch}".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STUDY HUB CENTERS */}
      {!isStudentOrTeacher && activeTab === "centers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Physical Study Centers ({safeCenters.length})</span>
            </h3>
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search center by city, pincode..."
                value={centerSearch}
                onChange={(e) => setCenterSearch(e.target.value)}
                className="w-full bg-white text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {center.city}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">PIN: {center.pincode}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {center.name}
                  </h4>

                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{center.address}</span>
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <p className="text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{center.contactNumber}</strong>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{center.operatingHours}</span>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Center Incharge: <strong>{center.managerName}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredCenters.length === 0 && (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No centers found matching "{centerSearch}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: ONLINE COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <span>Published Academic Courses</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-violet-400 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {course.duration}
                    </span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      FREE (₹0)
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Chief Mentor:</span>
                      <strong className="text-slate-800">{course.mentorName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Curriculum:</span>
                      <span className="font-semibold text-slate-700">{course.sections?.length || 0} Modules</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {isStudentOrTeacher ? (
                    <button
                      onClick={() => handleInstantBuy({
                        id: course.id,
                        title: course.title,
                        type: "course",
                        price: 0,
                        description: course.description
                      })}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Enroll (Free)</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart({
                          id: course.id,
                          title: course.title,
                          type: "course",
                          price: 0,
                          description: course.description
                        }, 1)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                          cart.some(c => c.id === course.id)
                            ? "bg-violet-100 text-violet-800 border border-violet-300"
                            : "bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200"
                        }`}
                      >
                        {cart.some(c => c.id === course.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-violet-700" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleInstantBuy({
                          id: course.id,
                          title: course.title,
                          type: "course",
                          price: 0,
                          description: course.description
                        })}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase py-2.5 rounded-xl transition-all shadow-md shadow-violet-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Enroll (Free)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {visibleCourses.length === 0 && (
              <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                No active courses currently published in store.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: MY ORDERS TAB */}
      {activeTab === "my-orders" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600" />
            <span>My Book Purchases & Order History</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {myOrders.map((order) => (
              <div key={order.id} className="py-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {order.id}
                      </span>
                      <span className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {order.paymentMethod}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {order.items && order.items.length > 0 ? order.items.map(i => i.itemName).join(", ") : "Book / Store Item"}
                    </h4>
                    <p className="text-[11px] text-slate-400">Order Date: {order.orderDate}</p>
                    {order.shippingAddress && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Address: {order.shippingAddress}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}</span>
                    <div className="flex items-center gap-1.5 justify-end mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-2xs ${
                        order.status === "Payment Confirmed / Active" || order.status === "Confirmed" || order.status === "Verified & Approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : order.status === "Pending Payment at Center" || order.status === "Pending Admin Verification" || order.status === "Pending Confirmation"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-sky-100 text-sky-800 border border-sky-200"
                      }`}>
                        {order.status === "Payment Confirmed / Active" || order.status === "Confirmed" || order.status === "Verified & Approved"
                          ? "Confirmed"
                          : order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Notice */}
                {(order.paymentMethod === "Cash on Delivery (COD)" || order.paymentMethod === "Cash on Delivery" || order.status === "Placed") &&
                  order.status !== "Payment Confirmed / Active" && order.status !== "Verified & Approved" && order.status !== "Confirmed" && (
                  <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 text-xs text-sky-950 space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-sky-900">
                      <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>🚚 Cash on Delivery (COD) Order Dispatched</span>
                    </div>
                    <p className="text-[11px] text-sky-800">
                      Your book / kit item is being packaged. Delivery estimated in 3-5 working days. Pay ₹{order.totalAmount} at delivery.
                    </p>
                    {order.adminComment && (
                      <p className="text-[11px] text-sky-900 font-medium pt-1 border-t border-sky-200/60">
                        <strong>Comment:</strong> {order.adminComment}
                      </p>
                    )}
                  </div>
                )}

                {/* Offline Payment Guidance Notice */}
                {order.status === "Pending Payment at Center" && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-amber-900">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>📍 Center Pickup & Offline Payment Pending</span>
                    </div>
                    <p className="leading-relaxed">
                      Please visit <strong>{order.centerName || "Selected Study Hub Center"}</strong> to complete fee payment and collect your physical book/kit.
                    </p>
                    {order.centerAddress && (
                      <p className="text-[11px] text-amber-800">
                        <strong>Center Address:</strong> {order.centerAddress}
                      </p>
                    )}
                  </div>
                )}

                {/* Direct Order Actions: Address Change, Order Cancellation & Print Receipt */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handlePrintOrderReceipt(order)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                    title="Print Receipt or Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Receipt / PDF</span>
                  </button>

                  {order.status !== "Cancelled" && order.status !== "Delivered" && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAddressOrder(order);
                          setEditAddressText(order.shippingAddress || "");
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Change Address</span>
                      </button>

                      <button
                        onClick={() => {
                          setCancellingOrder(order);
                          setCancelOrderReason("");
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel Order</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {myOrders.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-8">
                You have not placed any store or book orders yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 6: STORE HELP DESK FOR CUSTOMER */}
      {!isStudentOrTeacher && activeTab === "helpdesk" && (
        <StoreHelpDesk
          currentUser={currentUser}
          myOrders={myOrders}
          allOrders={safeOrders}
          supportMessages={supportMessages}
          onUpdateOrderAddress={handleUpdateOrderAddress}
          onCancelOrder={handleCancelOrderAction}
          onSendMessageToAdmin={handleSendCustomMessageToAdmin}
          onPrintReceipt={handlePrintOrderReceipt}
          onNavigateToShop={() => setActiveTab("books")}
        />
      )}

      {/* CHANGE ADDRESS MODAL */}
      {editingAddressOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Update Delivery Address for Order #{editingAddressOrder.id}</span>
              </div>
              <button 
                onClick={() => setEditingAddressOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">New Shipping / Home Address *</label>
              <textarea
                rows={3}
                value={editAddressText}
                onChange={(e) => setEditAddressText(e.target.value)}
                placeholder="Enter complete house no, street name, landmark, city, pin code..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-indigo-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAddressOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateOrderAddress(editingAddressOrder.id, editAddressText);
                  setEditingAddressOrder(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save New Address</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Cancel Order #{cancellingOrder.id}</span>
              </div>
              <button 
                onClick={() => setCancellingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Are you sure you want to cancel this order? Once cancelled, status will be updated in store & admin dashboard.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Reason for Cancellation (Optional)</label>
              <input
                type="text"
                value={cancelOrderReason}
                onChange={(e) => setCancelOrderReason(e.target.value)}
                placeholder="e.g. Ordered by mistake / Address change / Delayed"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-indigo-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCancelOrderAction(cancellingOrder.id, cancelOrderReason);
                  setCancellingOrder(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-ITEM UNIFIED CHECKOUT & ORDER DELIVERY MODAL */}
      {isCheckoutOpen && checkoutItems.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg md:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {checkoutItems.every(i => i.type === "course") ? "Student Enrollment & Verification" : "Order Checkout & Delivery"}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Single Checkout Flow ({checkoutItems.reduce((sum, i) => sum + i.quantity, 0)} Items)
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCheckoutItems([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Products Breakdown */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Order Items Breakdown
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {checkoutItems.length} unique line {checkoutItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">{item.title}</h5>
                        <p className="text-[10px] text-slate-500">
                          {item.price > 0 ? `₹${item.price} each` : "Free admission"} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {item.price > 0 ? `₹${item.price * item.quantity}` : "₹0"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Order Subtotal:</span>
                <span className="text-sm font-black text-slate-900">
                  {checkoutItems.reduce((acc, i) => acc + i.price * i.quantity, 0) > 0 
                    ? `₹${checkoutItems.reduce((acc, i) => acc + i.price * i.quantity, 0)}` 
                    : "FREE (₹0)"}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
              {/* Payment Method Selection for Paid Items */}
              {checkoutItems.some(i => i.price > 0) && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800">Select Preferred Payment Method *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash on Delivery (COD)")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "Cash on Delivery (COD)"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Truck className="w-4 h-4 text-indigo-600 mb-1" />
                      <span className="text-[11px]">Cash on Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Online Payment (UPI/Card)")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "Online Payment (UPI/Card)"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600 mb-1" />
                      <span className="text-[11px]">UPI / Online Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Offline Payment at Study Hub Center")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "Offline Payment at Study Hub Center"
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-600 mb-1" />
                      <span className="text-[11px]">Center Pickup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={studentMobile}
                    onChange={(e) => setStudentMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. student@studyhub.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {paymentMethod === "Offline Payment at Study Hub Center" 
                    ? "Center Choice / Contact Note" 
                    : "Complete Shipping & Delivery Address *"}
                </label>
                <textarea
                  rows={2}
                  placeholder={paymentMethod === "Offline Payment at Study Hub Center" ? "Note for center pickup..." : "House/Flat No., Landmark, City, State, PIN code..."}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-indigo-600 font-medium text-slate-800"
                  required={paymentMethod !== "Offline Payment at Study Hub Center"}
                />
              </div>

              {/* Nearest Center Selection for Center Pickup / Verification */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Nearest Physical Study Center *</label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                >
                  {safeCenters.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name} ({center.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutItems([]);
                  }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm & Place Order ({checkoutItems.reduce((acc, i) => acc + i.price * i.quantity, 0) > 0 
                      ? `₹${checkoutItems.reduce((acc, i) => acc + i.price * i.quantity, 0)}` 
                      : "Submit Form"})
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOPPING CART SLIDE-OVER DRAWER */}
      {!isStudentOrTeacher && (
        <StoreCartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onProceedToCheckout={handleProceedToCheckoutFromCart}
        />
      )}

      {/* FLOATING QUICK-ACCESS CART BUTTON */}
      {!isStudentOrTeacher && totalCartItems > 0 && !isCartOpen && !isCheckoutOpen && activeTab !== "helpdesk" && (
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white pl-4 pr-5 py-3 rounded-2xl shadow-2xl border border-slate-700 cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              <span className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                {totalCartItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400">View Cart</p>
              <p className="text-xs font-black text-white">
                {totalCartAmount > 0 ? `₹${totalCartAmount}` : "Free Admission"}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 ml-1" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
