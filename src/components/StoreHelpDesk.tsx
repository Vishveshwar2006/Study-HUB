import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headphones,
  Truck,
  MapPin,
  X,
  MessageSquare,
  Send,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  Search,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { StoreOrder, SupportMessage } from "../types";

interface StoreHelpDeskProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: string;
  };
  myOrders: StoreOrder[];
  allOrders?: StoreOrder[];
  supportMessages: SupportMessage[];
  onUpdateOrderAddress: (orderId: string, newAddress: string) => Promise<void> | void;
  onCancelOrder: (orderId: string, reason: string) => Promise<void> | void;
  onSendMessageToAdmin: (text: string, category?: string) => Promise<void> | void;
  onPrintReceipt: (order: StoreOrder) => void;
  onNavigateToShop?: () => void;
}

export default function StoreHelpDesk({
  currentUser,
  myOrders = [],
  allOrders = [],
  supportMessages = [],
  onUpdateOrderAddress,
  onCancelOrder,
  onSendMessageToAdmin,
  onPrintReceipt,
  onNavigateToShop,
}: StoreHelpDeskProps) {
  // Navigation tabs inside Help Desk Dashboard
  const [activeSection, setActiveSection] = useState<"overview" | "track" | "address" | "cancel" | "chat" | "faq" | "contact">("overview");

  // Selected order across tracker, address update, and cancellation
  const [selectedOrderId, setSelectedOrderId] = useState<string>(myOrders[0]?.id || "");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Address update form state
  const [newAddress, setNewAddress] = useState("");
  const [addressSuccessMsg, setAddressSuccessMsg] = useState("");

  // Cancel order form state
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("");

  // Chat form state
  const [chatInput, setChatInput] = useState("");
  const [chatCategory, setChatCategory] = useState<string>("Order Delivery Delay");
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-select latest order if none selected
  useEffect(() => {
    if (!selectedOrderId && myOrders.length > 0) {
      setSelectedOrderId(myOrders[0].id);
    }
  }, [myOrders, selectedOrderId]);

  // When selected order changes, pre-fill address for update
  useEffect(() => {
    if (selectedOrderId) {
      const ord = myOrders.find((o) => o.id === selectedOrderId);
      if (ord && ord.shippingAddress) {
        setNewAddress(ord.shippingAddress);
      }
    }
  }, [selectedOrderId, myOrders]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSection === "chat" || activeSection === "overview") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [supportMessages, activeSection]);

  const activeOrders = myOrders.filter(
    (o) => o.status !== "Cancelled" && o.status !== "Delivered"
  );
  const deliveredOrders = myOrders.filter((o) => o.status === "Delivered");
  const cancelledOrders = myOrders.filter((o) => o.status === "Cancelled");

  // Filter student's support messages
  const studentMessages = supportMessages.filter(
    (m) => m.studentId === (currentUser?.id || "student")
  );

  const currentSelectedOrder = myOrders.find((o) => o.id === selectedOrderId);

  const handleCopyTracking = (trackId: string) => {
    navigator.clipboard.writeText(trackId);
    setCopiedTrackingId(trackId);
    setTimeout(() => setCopiedTrackingId(null), 2000);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !newAddress.trim()) return;
    await onUpdateOrderAddress(selectedOrderId, newAddress.trim());
    setAddressSuccessMsg(`Shipping address for Order #${selectedOrderId} updated successfully!`);
    setTimeout(() => setAddressSuccessMsg(""), 5000);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    const finalReason = cancelReason === "Other" ? customCancelReason.trim() : cancelReason;
    if (!finalReason) return;
    await onCancelOrder(selectedOrderId, finalReason);
    setCancelSuccessMsg(`Order #${selectedOrderId} has been cancelled successfully.`);
    setTimeout(() => setCancelSuccessMsg(""), 5000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const formatted = chatCategory ? `[${chatCategory}] ${chatInput.trim()}` : chatInput.trim();
    await onSendMessageToAdmin(formatted);
    setChatInput("");
  };

  // Helper for status progress step
  const getStatusStep = (status: string) => {
    switch (status) {
      case "Placed":
      case "Pending Payment at Center":
      case "Pending Admin Verification":
      case "Pending Confirmation":
        return 1;
      case "Confirmed":
      case "Payment Confirmed / Active":
      case "Verified & Approved":
        return 2;
      case "Packed":
        return 3;
      case "Dispatched":
      case "Out for Delivery":
        return 4;
      case "Delivered":
        return 5;
      case "Cancelled":
        return -1;
      default:
        return 2;
    }
  };

  const filteredOrders = myOrders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.items?.some((i) => i.itemName.toLowerCase().includes(q)) ||
      (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q)) ||
      o.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* STICKY TOP-LEFT NAVIGATION BAR */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pt-1 pb-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {/* REQUIRED & IMPORTANT: Back to Store (Fixed in top left corner) */}
          {onNavigateToShop && (
            <button
              type="button"
              onClick={onNavigateToShop}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all mr-1"
              title="Return to Store / Books Catalogue"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSection("overview")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "overview"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("track")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "track"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-sky-500" />
            <span>Live Tracking</span>
            {activeOrders.length > 0 && (
              <span className="bg-sky-100 text-sky-800 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("address")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "address"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>Change Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("cancel")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "cancel"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Cancel Order</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("chat")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "chat"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Support Chat</span>
            {studentMessages.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                {studentMessages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("faq")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "faq"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>FAQs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("contact")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeSection === "contact"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Contacts</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW DASHBOARD */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* Active Orders Summary & Quick Help */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Recent Active Orders */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900">Your Recent Store Orders</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("track")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center"
                >
                  <span>View All ({myOrders.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No store orders placed yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Browse study material, books, stationery, or online courses to get started.
                  </p>
                  {onNavigateToShop && (
                    <button
                      type="button"
                      onClick={onNavigateToShop}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                    >
                      Browse Books & Courses
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.slice(0, 3).map((order) => {
                    const step = getStatusStep(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 transition-all"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono text-xs font-black text-indigo-700">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-slate-400">• {order.orderDate}</span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              order.status === "Cancelled"
                                ? "bg-rose-100 text-rose-800"
                                : order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="mt-2.5 text-xs text-slate-800 font-bold">
                          {order.items?.map((i) => `${i.itemName} (x${i.quantity || 1})`).join(", ") ||
                            "Store Material"}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60 text-xs">
                          <span className="font-black text-slate-900">
                            ₹{order.totalAmount?.toLocaleString("en-IN")} • {order.paymentMethod}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => onPrintReceipt(order)}
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer flex items-center space-x-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setActiveSection("track");
                              }}
                              className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg shadow-xs cursor-pointer flex items-center space-x-1"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Track</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Quick Support & Helpline */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 rounded-3xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-950 font-black text-sm">
                  <Headphones className="w-4 h-4 text-indigo-600" />
                  <span>Immediate Help Assistance</span>
                </div>
                <p className="text-xs text-indigo-800/90 leading-relaxed">
                  Need rapid assistance with a damaged kit, dispatch delay, or incorrect subject book?
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Helpline: +91 98765 43210</p>
                      <p className="text-[10px] text-slate-500">Mon - Sat: 9:00 AM - 7:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">store-support@mpdigital.edu</p>
                      <p className="text-[10px] text-slate-500">24-hour response window</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("chat")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Support Team</span>
                </button>
              </div>

              {/* Fast FAQ link */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Common Store Queries</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <li
                    onClick={() => setActiveSection("faq")}
                    className="hover:text-indigo-600 cursor-pointer flex items-center justify-between p-1 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span>How many days does dispatch take?</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </li>
                  <li
                    onClick={() => setActiveSection("faq")}
                    className="hover:text-indigo-600 cursor-pointer flex items-center justify-between p-1 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span>Can I collect from Study Hub Center?</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </li>
                  <li
                    onClick={() => setActiveSection("faq")}
                    className="hover:text-indigo-600 cursor-pointer flex items-center justify-between p-1 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span>Cancellation policy before shipping</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LIVE ORDER TRACKING */}
      {activeSection === "track" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>Live Order Tracking & Dispatch Status</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitor the exact shipment progress of books, study kits, and coaching material.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search order ID or item..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-indigo-600 text-slate-900"
              />
            </div>
          </div>

          {/* Order Selection Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Select Order to Track:
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full sm:w-auto min-w-[320px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600"
            >
              {filteredOrders.length === 0 ? (
                <option value="">No matching orders</option>
              ) : (
                filteredOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    Order #{o.id} - {o.items?.[0]?.itemName || "Store Item"} ({o.status} • ₹
                    {o.totalAmount})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Selected Order Tracking Card */}
          {currentSelectedOrder ? (
            <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-black font-mono text-indigo-700">
                      Order #{currentSelectedOrder.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        currentSelectedOrder.status === "Cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : currentSelectedOrder.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {currentSelectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Booked on: <strong>{currentSelectedOrder.orderDate}</strong> • Mode:{" "}
                    <strong>{currentSelectedOrder.paymentMethod}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onPrintReceipt(currentSelectedOrder)}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>
                  {currentSelectedOrder.status !== "Cancelled" &&
                    currentSelectedOrder.status !== "Delivered" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderId(currentSelectedOrder.id);
                          setActiveSection("address");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Update Address</span>
                      </button>
                    )}
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              {currentSelectedOrder.status === "Cancelled" ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-900">
                  <X className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <p className="font-extrabold text-sm">This order was Cancelled</p>
                    <p className="text-xs text-rose-700 mt-0.5">
                      {currentSelectedOrder.adminComment ||
                        "Order was cancelled prior to dispatch. No payment deductions applied."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                    Shipment Progress Milestones
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {[
                      { step: 1, title: "Order Placed", desc: currentSelectedOrder.orderDate },
                      { step: 2, title: "Confirmed & Verified", desc: "Inventory allocated" },
                      { step: 3, title: "Packed & Sealed", desc: "Quality inspected" },
                      {
                        step: 4,
                        title: "In Transit / Dispatched",
                        desc: currentSelectedOrder.courierName
                          ? `${currentSelectedOrder.courierName}`
                          : "Courier handover",
                      },
                      {
                        step: 5,
                        title: "Delivered",
                        desc: currentSelectedOrder.deliveredAt || "Home delivery",
                      },
                    ].map((m) => {
                      const currentStep = getStatusStep(currentSelectedOrder.status);
                      const isCompleted = currentStep >= m.step;
                      const isCurrent = currentStep === m.step;
                      return (
                        <div
                          key={m.step}
                          className={`p-3 rounded-2xl border transition-all ${
                            isCompleted
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                              : "bg-white border-slate-200 text-slate-400"
                          } ${isCurrent ? "ring-2 ring-indigo-500 shadow-xs" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              Step 0{m.step}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <p className="text-xs font-black leading-tight text-slate-900">{m.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{m.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Info & Tracking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Items & Amount */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    <span>Package Contents</span>
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {currentSelectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{item.itemName}</p>
                          <p className="text-[10px] text-slate-500">
                            Qty: {item.quantity || 1} • Rate: ₹{item.price}
                          </p>
                        </div>
                        <span className="font-mono font-black text-slate-900">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span>₹{currentSelectedOrder.totalAmount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Delivery & Courier Details */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Shipping & Courier Details</span>
                  </h4>

                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Delivery Address:
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {currentSelectedOrder.shippingAddress ||
                          "Study Hub Center Pickup / Address pending"}
                      </p>
                    </div>

                    {currentSelectedOrder.courierName && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">
                            Courier Service:
                          </span>
                          <p className="font-bold text-slate-900">
                            {currentSelectedOrder.courierName}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">
                            Tracking Number:
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="font-mono font-bold text-indigo-600">
                              {currentSelectedOrder.trackingId || "N/A"}
                            </span>
                            {currentSelectedOrder.trackingId && (
                              <button
                                type="button"
                                onClick={() => handleCopyTracking(currentSelectedOrder.trackingId!)}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Copy tracking ID"
                              >
                                {copiedTrackingId === currentSelectedOrder.trackingId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSelectedOrder.adminComment && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 mt-2">
                        <strong className="block text-[10px] uppercase font-black">
                          Admin Operational Note:
                        </strong>
                        <p className="text-[11px] mt-0.5">{currentSelectedOrder.adminComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold">No order selected or available to track.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: CHANGE DELIVERY ADDRESS */}
      {activeSection === "address" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Update Delivery Address for Dispatches</span>
            </h3>
            <p className="text-xs text-slate-500">
              Modify the destination shipping location for pending or in-transit store orders.
            </p>
          </div>

          {addressSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{addressSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Select Active Order to Update:
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600"
                  >
                    {activeOrders.length === 0 ? (
                      <option value="">No active undelivered orders available</option>
                    ) : (
                      activeOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id} - {o.items?.[0]?.itemName || "Store Item"} ({o.status})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    New Shipping & Delivery Address:
                  </label>
                  <textarea
                    rows={4}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter complete House/Flat No., Street, Area, Landmark, City, District, PIN Code..."
                    disabled={activeOrders.length === 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-indigo-600 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-400">
                    Include landmarks and pin code to ensure swift delivery by the postal/courier agent.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={activeOrders.length === 0 || !newAddress.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Updated Address</span>
                </button>
              </form>
            </div>

            {/* Address Policy Info Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Address Change Guidelines</span>
              </h4>
              <ul className="space-y-2 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
                <li>Address updates are immediately effective for orders in "Placed" or "Confirmed" state.</li>
                <li>If the courier parcel is already out for local delivery, our logistics team will notify the courier delivery agent.</li>
                <li>Updating the address logs an automatic ticket in the Admin dispatch records.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ORDER CANCELLATION DESK */}
      {activeSection === "cancel" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <X className="w-5 h-5 text-rose-600" />
              <span>Order Cancellation Desk</span>
            </h3>
            <p className="text-xs text-slate-500">
              Request or perform instant cancellation for store material before final dispatch.
            </p>
          </div>

          {cancelSuccessMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-950 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Select Active Order to Cancel:
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600"
                  >
                    {activeOrders.length === 0 ? (
                      <option value="">No cancellable orders found</option>
                    ) : (
                      activeOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id} - {o.items?.[0]?.itemName || "Store Item"} (₹{o.totalAmount} •{" "}
                          {o.status})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Reason for Cancellation:
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600"
                  >
                    <option value="Ordered by mistake">Ordered by mistake / Duplicate order</option>
                    <option value="Need to change delivery location">Need to change delivery location</option>
                    <option value="Found other study material">Opted for alternative material</option>
                    <option value="Financial or budget constraints">Financial constraints</option>
                    <option value="Other">Other Reason (Specify below)</option>
                  </select>
                </div>

                {cancelReason === "Other" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Specify Reason:
                    </label>
                    <input
                      type="text"
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                      placeholder="Enter specific cancellation reason..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-indigo-600"
                    />
                  </div>
                )}

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 space-y-1">
                  <p className="font-black">Notice:</p>
                  <p className="leading-relaxed">
                    Once cancelled, this order status is irreversibly changed to "Cancelled" in the central database. If cash on delivery was chosen, no amount is owed.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={activeOrders.length === 0}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Confirm Order Cancellation</span>
                </button>
              </form>
            </div>

            {/* Right: Cancellation FAQ */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3 text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Cancellation Terms</span>
              </h4>
              <ul className="space-y-2 text-slate-600 list-disc list-inside leading-relaxed text-[11px]">
                <li>Free cancellations anytime prior to physical dispatch handover.</li>
                <li>Digital courses cannot be cancelled once digital course materials have been unlocked.</li>
                <li>Physical books can be returned within 7 days if defective or incorrect edition was sent.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: STORE ADMIN LIVE CHAT & TICKETS */}
      {activeSection === "chat" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Store Support Chat & Ticket Desk</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct synchronous messaging with Study Hub coaching and store management staff.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Admin Online</span>
              </span>
            </div>
          </div>

          {/* Chat Message Thread Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 h-[400px] overflow-y-auto space-y-3">
            {studentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No support ticket messages yet.</p>
                <p className="text-[11px] max-w-sm">
                  Have a question regarding book kits, shipment delays, center pickups, or bill receipts? Send a message below and our support team will reply.
                </p>
              </div>
            ) : (
              studentMessages.map((msg) => {
                const isAdmin = msg.senderRole === "admin" || msg.senderRole === "feemanager";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-1 text-xs shadow-xs ${
                        isAdmin
                          ? "bg-amber-50 border border-amber-200/80 text-amber-950 rounded-bl-none"
                          : "bg-indigo-600 text-white rounded-br-none"
                      }`}
                    >
                      <div className="flex items-center justify-between space-x-3 text-[10px] opacity-85 font-mono">
                        <span className="font-black">
                          {isAdmin ? "🛡️ " + msg.senderName + " (Store Admin)" : "👤 " + msg.senderName}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[10px] py-1">Quick Inquiries:</span>
            {[
              "Where is my book parcel right now?",
              "Can I collect my study kit directly from the center?",
              "Received wrong chapter book in my package",
              "Need an official GST tax invoice for my order",
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChatInput(prompt)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleChatSubmit} className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={chatCategory}
                onChange={(e) => setChatCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-indigo-600 shrink-0"
              >
                <option value="Order Delivery Delay">📦 Delivery Delay</option>
                <option value="Book Defect / Missing Page">📖 Book Defect / Replacement</option>
                <option value="Payment / Invoice Query">💳 Payment / Receipt</option>
                <option value="General Store Inquiry">💬 General Inquiry</option>
              </select>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question or issue for the Store Admin..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-indigo-600"
              />

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send to Admin</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 6: FAQS */}
      {activeSection === "faq" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <span>Frequently Asked Questions (Store & Deliveries)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Clear answers to the most common queries regarding book orders, coaching kits, and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "What is the expected delivery timeframe for book orders?",
                a: "For Madhya Pradesh and adjacent states, books and study kits are typically delivered within 3 to 5 business days via speed post or private courier partner.",
              },
              {
                q: "Can I collect my book order from a physical Study Hub center?",
                a: "Yes! During checkout you can pick 'Offline Payment / Pickup at Study Hub Center'. Once booked, your books are kept ready at the front desk of your chosen center.",
              },
              {
                q: "How do I return a book if it has missing or damaged pages?",
                a: "Simply use the 'Store Admin Live Chat' tab in this Help Desk, mention your Order ID, and upload a brief note. Our staff will dispatch a free fresh replacement kit immediately.",
              },
              {
                q: "Is Cash on Delivery (COD) supported across all districts?",
                a: "Yes, COD is available across all 55 districts of Madhya Pradesh. Payment can be made in cash or via UPI QR code directly to the courier agent upon arrival.",
              },
              {
                q: "How can I update my shipping address after placing an order?",
                a: "Head to the 'Change Delivery Address' tab on this Help Desk, pick your active order, type the new address, and click Save. It synchronizes automatically with the dispatch team.",
              },
              {
                q: "How do I download or print my official GST tax invoice?",
                a: "In the 'Live Order Tracking' tab, click the 'Print Invoice' button next to any order to generate and print the official receipt.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-start space-x-2">
                  <span className="text-indigo-600 shrink-0 font-mono font-bold">Q{i + 1}.</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: SUPPORT CONTACTS */}
      {activeSection === "contact" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>Official Support Contacts & Physical Hub Centers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Reach our dedicated store logistics and student support team through multiple channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Store Helpline (Toll Free)</h4>
              <p className="text-xs text-slate-600 font-mono font-bold">+91 98765 43210</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Available Monday to Saturday from 9:00 AM to 7:00 PM IST for dispatch and order tracking queries.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Official Email Desk</h4>
              <p className="text-xs text-slate-600 font-mono font-bold">store-support@mpdigital.edu</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Send formal billing queries, GST invoice requests, and bulk coaching material purchase orders.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Central Coaching Hub</h4>
              <p className="text-xs text-slate-600 font-bold">MP Digital School Headquarters</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                MP Nagar Zone 1, Press Complex, Bhopal, Madhya Pradesh - 462011
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
