import React, { useState, useEffect } from "react";
import { doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { markIdAsDeleted } from "../lib/firestoreSync";
import { 
  Book, BookOpen, Package, ShoppingBag, Truck, Plus, Edit2, Trash2, CheckCircle2, 
  AlertCircle, Search, Filter, ArrowUpRight, ArrowDownRight, Layers, DollarSign,
  Boxes, ShieldCheck, MapPin, Phone, Mail, User, Clock, RefreshCw, Upload, Sparkles,
  FileText, Navigation, Check, X, Tag, Printer, Download, UserPlus, History, BarChart3,
  QrCode, ArrowUpDown, ChevronDown, FileSpreadsheet, Eye, Zap, Archive
} from "lucide-react";
import { StoreItem, StoreOrder, Student, Course } from "../types";
import { initialStoreItems } from "../data";

export interface StockMovementLog {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  change: number; // positive = added, negative = deducted
  type: "restock" | "manual_adjustment" | "sale_fulfillment" | "item_created" | "status_toggle" | "batch_replenish";
  previousStock: number;
  newStock: number;
  timestamp: string;
  notes?: string;
  performedBy?: string;
}

interface InventoryManagerProps {
  storeItems: StoreItem[];
  setStoreItems: React.Dispatch<React.SetStateAction<StoreItem[]>>;
  storeOrders: StoreOrder[];
  setStoreOrders: React.Dispatch<React.SetStateAction<StoreOrder[]>>;
  students?: Student[];
  courses?: Course[];
  initialView?: "inventory" | "delivery-orders";
}

export default function InventoryManager({
  storeItems,
  setStoreItems,
  storeOrders,
  setStoreOrders,
  students = [],
  courses = [],
  initialView = "inventory"
}: InventoryManagerProps) {
  const safeItems = storeItems || [];
  const safeOrders = storeOrders || [];

  // Active view: Inventory Catalogue vs Home Delivery Orders vs Stock Movement & Audit Log
  const [activeView, setActiveView] = useState<"inventory" | "delivery-orders" | "audit-logs">(initialView || "inventory");

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  // Category filter for inventory
  const [categoryFilter, setCategoryFilter] = useState<"all" | "book" | "study_guide" | "stationery" | "exam_kit">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<"all" | "critical_low" | "low_stock" | "out_of_stock">("all");

  // Order status filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Modal States
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

  // Form State for Build / Edit
  const [formData, setFormData] = useState<{
    name: string;
    type: "book" | "study_guide" | "stationery" | "exam_kit";
    description: string;
    price: number;
    image: string;
    stockCount: number;
    sku: string;
    authorOrBrand: string;
    inStock: boolean;
  }>({
    name: "",
    type: "book",
    description: "",
    price: 499,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    stockCount: 50,
    sku: "SH-ITEM-" + Math.floor(1000 + Math.random() * 9000),
    authorOrBrand: "Study HUB Press",
    inStock: true
  });

  // Delivery Modal State
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<StoreOrder | null>(null);
  const [courierName, setCourierName] = useState("Delhivery Express");
  const [trackingId, setTrackingId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Create Order on Demand Modal State
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [customStudentName, setCustomStudentName] = useState("");
  const [customStudentEmail, setCustomStudentEmail] = useState("");
  const [customStudentMobile, setCustomStudentMobile] = useState("");
  const [orderShippingAddress, setOrderShippingAddress] = useState("");
  const [orderPaymentMethod, setOrderPaymentMethod] = useState("Cash on Delivery (COD)");
  const [orderStatus, setOrderStatus] = useState("Placed");
  const [orderCartItems, setOrderCartItems] = useState<{ itemId: string; itemName: string; price: number; quantity: number; itemType?: string }[]>([]);

  // Print Invoice Modal State
  const [printingOrder, setPrintingOrder] = useState<StoreOrder | null>(null);

  // Notification Banner
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Stock Movement & Audit Logs state
  const [stockMovementLogs, setStockMovementLogs] = useState<StockMovementLog[]>(() => {
    const saved = localStorage.getItem("co_stock_movement_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "log_init_1",
        itemId: "item_1",
        itemName: "MP Board Class 12 Physics Complete Master Guide",
        sku: "SH-BK-1001",
        change: 50,
        type: "restock",
        previousStock: 0,
        newStock: 50,
        timestamp: new Date(Date.now() - 86400000 * 3).toLocaleString(),
        notes: "Inward shipment from Bhopal Central Depot (Invoice: BPL-2026-881)",
        performedBy: "Administrator"
      },
      {
        id: "log_init_2",
        itemId: "item_2",
        itemName: "Class 10 Mathematics NCERT Exemplar & Formula Bank",
        sku: "SH-BK-1002",
        change: 45,
        type: "restock",
        previousStock: 0,
        newStock: 45,
        timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
        notes: "NCERT Consignment Batch received",
        performedBy: "Administrator"
      },
      {
        id: "log_init_3",
        itemId: "item_1",
        itemName: "MP Board Class 12 Physics Complete Master Guide",
        sku: "SH-BK-1001",
        change: -1,
        type: "sale_fulfillment",
        previousStock: 50,
        newStock: 49,
        timestamp: new Date(Date.now() - 3600000 * 8).toLocaleString(),
        notes: "Order fulfilled for student delivery",
        performedBy: "System Store Engine"
      }
    ];
  });

  const addMovementLog = (
    itemId: string,
    itemName: string,
    sku: string,
    change: number,
    type: StockMovementLog["type"],
    prevStock: number,
    newStock: number,
    notes?: string
  ) => {
    const log: StockMovementLog = {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      itemId,
      itemName,
      sku,
      change,
      type,
      previousStock: prevStock,
      newStock,
      timestamp: new Date().toLocaleString(),
      notes: notes || "Inventory update",
      performedBy: "Administrator"
    };
    setStockMovementLogs(prev => {
      const updated = [log, ...prev].slice(0, 250);
      localStorage.setItem("co_stock_movement_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // Inline Stock Edit State
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineStockInput, setInlineStockInput] = useState<number>(0);

  // Inward Shipment / Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockItemId, setRestockItemId] = useState<string>("");
  const [restockQty, setRestockQty] = useState<number>(25);
  const [restockSupplier, setRestockSupplier] = useState<string>("Bhopal Central Educational Depot");
  const [restockInvoiceNo, setRestockInvoiceNo] = useState<string>("");
  const [restockNotes, setRestockNotes] = useState<string>("");

  // Barcode / SKU Tag Modal State
  const [barcodeModalItem, setBarcodeModalItem] = useState<StoreItem | null>(null);

  // Valuation Audit Report Modal State
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);

  // Sorting Option
  const [sortOption, setSortOption] = useState<"default" | "stock_asc" | "stock_desc" | "price_desc" | "price_asc" | "name_asc">("default");

  // Audit Log Filter States
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>("all");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");

  // Filter items
  const filteredItems = safeItems.filter(item => {
    const matchesCat = categoryFilter === "all" || item.type === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.authorOrBrand && item.authorOrBrand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const count = item.stockCount ?? (item.inStock ? 50 : 0);
    const matchesStock = stockStatusFilter === "all" ||
                         (stockStatusFilter === "critical_low" && count > 0 && count < 5) ||
                         (stockStatusFilter === "low_stock" && count > 0 && count < 15) ||
                         (stockStatusFilter === "out_of_stock" && (!item.inStock || count === 0));

    return matchesCat && matchesSearch && matchesStock;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aStock = a.stockCount ?? (a.inStock ? 50 : 0);
    const bStock = b.stockCount ?? (b.inStock ? 50 : 0);
    if (sortOption === "stock_asc") return aStock - bStock;
    if (sortOption === "stock_desc") return bStock - aStock;
    if (sortOption === "price_desc") return b.price - a.price;
    if (sortOption === "price_asc") return a.price - b.price;
    if (sortOption === "name_asc") return a.name.localeCompare(b.name);
    return 0;
  });

  // Filter orders
  const filteredOrders = safeOrders.filter(ord => {
    if (orderStatusFilter === "all") return true;
    if (orderStatusFilter === "pending") {
      return ord.status === "Pending Confirmation" || 
             ord.status === "Pending Admin Verification" || 
             ord.status === "Pending Payment at Center" || 
             ord.status === "Placed" ||
             ord.status === "Pending";
    }
    if (orderStatusFilter === "confirmed") {
      return ord.status === "Confirmed" || 
             ord.status === "Payment Confirmed / Active" || 
             ord.status === "Verified & Approved" ||
             ord.status === "Active";
    }
    return ord.status === orderStatusFilter;
  });

  // Filter audit logs
  const filteredAuditLogs = stockMovementLogs.filter(log => {
    const matchesType = auditTypeFilter === "all" || log.type === auditTypeFilter;
    const matchesQuery = !auditSearchQuery.trim() ||
                         log.itemName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                         log.sku.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                         (log.notes && log.notes.toLowerCase().includes(auditSearchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  // Analytics Metrics
  const totalItemsCount = safeItems.length;
  const totalStockUnits = safeItems.reduce((acc, i) => acc + (i.stockCount ?? (i.inStock ? 50 : 0)), 0);
  const totalValuation = safeItems.reduce((acc, i) => acc + ((i.stockCount ?? (i.inStock ? 50 : 0)) * i.price), 0);
  const criticalLowCount = safeItems.filter(i => {
    const c = i.stockCount ?? (i.inStock ? 50 : 0);
    return c > 0 && c < 5;
  }).length;
  const lowStockCount = safeItems.filter(i => {
    const c = i.stockCount ?? (i.inStock ? 50 : 0);
    return c >= 5 && c < 15;
  }).length;
  const outOfStockCount = safeItems.filter(i => !i.inStock || (i.stockCount ?? 0) === 0).length;
  const pendingDeliveriesCount = safeOrders.filter(o => o.status === "Placed" || o.status === "Confirmed" || o.status === "Out for Delivery").length;
  const totalInwardUnits = stockMovementLogs.filter(l => l.change > 0).reduce((sum, l) => sum + l.change, 0);
  const totalOutwardUnits = stockMovementLogs.filter(l => l.change < 0).reduce((sum, l) => sum + Math.abs(l.change), 0);

  // Open Build Modal
  const handleOpenBuildModal = () => {
    setFormData({
      name: "",
      type: "book",
      description: "",
      price: 499,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
      stockCount: 50,
      sku: "SH-BK-" + Math.floor(1000 + Math.random() * 9000),
      authorOrBrand: "Study HUB Press",
      inStock: true
    });
    setEditingItem(null);
    setIsBuildModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: (item.type as any) || "book",
      description: item.description,
      price: item.price,
      image: item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
      stockCount: item.stockCount ?? (item.inStock ? 50 : 0),
      sku: item.sku || ("SH-SKU-" + item.id),
      authorOrBrand: item.authorOrBrand || "Study HUB",
      inStock: item.inStock
    });
    setIsBuildModalOpen(true);
  };

  // Save Item (Build or Edit)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      // Edit
      const prevCount = editingItem.stockCount ?? (editingItem.inStock ? 50 : 0);
      const newCount = Number(formData.stockCount);
      const diff = newCount - prevCount;

      setStoreItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            name: formData.name.trim(),
            type: formData.type,
            description: formData.description.trim(),
            price: Number(formData.price),
            image: formData.image.trim(),
            stockCount: newCount,
            sku: formData.sku.trim(),
            authorOrBrand: formData.authorOrBrand.trim(),
            inStock: newCount > 0 && formData.inStock
          };
        }
        return item;
      }));

      if (diff !== 0) {
        addMovementLog(
          editingItem.id,
          formData.name.trim(),
          formData.sku.trim(),
          diff,
          "manual_adjustment",
          prevCount,
          newCount,
          `Item details & stock modified via inventory editor (${prevCount} -> ${newCount})`
        );
      }

      showNotification(`Updated item "${formData.name}" stock & details successfully!`);
    } else {
      // Build New
      const initialStock = Number(formData.stockCount);
      const newItem: StoreItem = {
        id: "item_" + Date.now(),
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        price: Number(formData.price),
        image: formData.image.trim() || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        stockCount: initialStock,
        sku: formData.sku.trim() || ("SKU-" + Date.now()),
        authorOrBrand: formData.authorOrBrand.trim() || "Study HUB",
        inStock: initialStock > 0 && formData.inStock
      };
      setStoreItems(prev => [newItem, ...prev]);

      addMovementLog(
        newItem.id,
        newItem.name,
        newItem.sku || "N/A",
        initialStock,
        "item_created",
        0,
        initialStock,
        `New item added to store catalogue with opening stock of ${initialStock} units`
      );

      showNotification(`Added new item "${newItem.name}" to store catalogue!`);
    }

    setIsBuildModalOpen(false);
  };

  // Stock Control: Quick Adjust Quantity
  const handleAdjustStock = (itemId: string, delta: number) => {
    const target = safeItems.find(i => i.id === itemId);
    if (!target) return;
    const currentCount = target.stockCount ?? (target.inStock ? 50 : 0);
    const newCount = Math.max(0, currentCount + delta);
    const actualChange = newCount - currentCount;
    if (actualChange === 0) return;

    setStoreItems(prev => prev.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          stockCount: newCount,
          inStock: newCount > 0
        };
      }
      return i;
    }));

    addMovementLog(
      target.id,
      target.name,
      target.sku || ("SH-SKU-" + target.id),
      actualChange,
      actualChange > 0 ? "restock" : "manual_adjustment",
      currentCount,
      newCount,
      `Quick adjustment: ${actualChange > 0 ? "+" + actualChange : actualChange} units`
    );
  };

  // Stock Control: Quick Toggle Availability
  const handleToggleStockStatus = (itemId: string) => {
    const target = safeItems.find(i => i.id === itemId);
    if (!target) return;
    const nextState = !target.inStock;
    const prevStock = target.stockCount ?? (target.inStock ? 50 : 0);
    const nextStock = nextState ? (target.stockCount || 25) : 0;

    setStoreItems(prev => prev.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          inStock: nextState,
          stockCount: nextStock
        };
      }
      return i;
    }));

    addMovementLog(
      target.id,
      target.name,
      target.sku || ("SH-SKU-" + target.id),
      nextStock - prevStock,
      "status_toggle",
      prevStock,
      nextStock,
      `Availability toggled to ${nextState ? "In Stock" : "Out of Stock"}`
    );
  };

  // Save Inline Stock Input
  const handleInlineStockSave = (itemId: string) => {
    const target = safeItems.find(i => i.id === itemId);
    if (!target) return;
    const prevCount = target.stockCount ?? (target.inStock ? 50 : 0);
    const newCount = Math.max(0, inlineStockInput);
    const diff = newCount - prevCount;

    setStoreItems(prev => prev.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          stockCount: newCount,
          inStock: newCount > 0
        };
      }
      return i;
    }));

    if (diff !== 0) {
      addMovementLog(
        target.id,
        target.name,
        target.sku || ("SH-SKU-" + target.id),
        diff,
        "manual_adjustment",
        prevCount,
        newCount,
        `Inline stock count modified from ${prevCount} to ${newCount}`
      );
      showNotification(`Updated stock for "${target.name}" to ${newCount} units.`);
    }

    setInlineEditingId(null);
  };

  // One-Click Auto Restock for Critical Low Stock items
  const handleAutoRestockCriticalItems = () => {
    const criticalItems = safeItems.filter(i => {
      const count = i.stockCount ?? (i.inStock ? 50 : 0);
      return count < 5;
    });

    if (criticalItems.length === 0) {
      showNotification("All items currently have healthy stock levels (>= 5 units)!");
      return;
    }

    setStoreItems(prev => prev.map(item => {
      const count = item.stockCount ?? (item.inStock ? 50 : 0);
      if (count < 5) {
        const added = 25 - count;
        addMovementLog(
          item.id,
          item.name,
          item.sku || ("SH-SKU-" + item.id),
          added,
          "batch_replenish",
          count,
          25,
          "Emergency batch replenish to 25 units"
        );
        return {
          ...item,
          stockCount: 25,
          inStock: true
        };
      }
      return item;
    }));

    showNotification(`Successfully auto-restocked ${criticalItems.length} low-stock items to 25 units each!`);
  };

  // Process Inward Shipment / Batch Restock
  const handleProcessInwardRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItemId) return;
    const qty = Number(restockQty);
    if (isNaN(qty) || qty <= 0) return;

    if (restockItemId === "ALL_CRITICAL") {
      handleAutoRestockCriticalItems();
      setIsRestockModalOpen(false);
      return;
    }

    const targetItem = safeItems.find(i => i.id === restockItemId);
    if (!targetItem) return;

    const prev = targetItem.stockCount ?? (targetItem.inStock ? 50 : 0);
    const updated = prev + qty;

    setStoreItems(prevItems => prevItems.map(item => {
      if (item.id === restockItemId) {
        return {
          ...item,
          stockCount: updated,
          inStock: true
        };
      }
      return item;
    }));

    addMovementLog(
      targetItem.id,
      targetItem.name,
      targetItem.sku || ("SH-SKU-" + targetItem.id),
      qty,
      "restock",
      prev,
      updated,
      `Inward shipment from ${restockSupplier || "Bhopal Central Depot"} | Inv #${restockInvoiceNo || "N/A"}: ${restockNotes || "Consignment Received"}`
    );

    showNotification(`Successfully checked in +${qty} units of "${targetItem.name}"!`);
    setIsRestockModalOpen(false);
    setRestockQty(25);
    setRestockInvoiceNo("");
    setRestockNotes("");
  };

  // Export Catalogue to CSV
  const handleExportCsv = () => {
    const headers = ["SKU", "Item Name", "Category", "Author or Brand", "Price (INR)", "Stock Count", "Stock Status", "Valuation (INR)"];
    const rows = safeItems.map(item => {
      const stock = item.stockCount ?? (item.inStock ? 50 : 0);
      const status = !item.inStock || stock === 0 ? "Out of Stock" : stock < 5 ? "Critical Low" : stock < 15 ? "Low Stock" : "Healthy";
      const valuation = stock * item.price;
      return [
        `"${item.sku || 'N/A'}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.type}"`,
        `"${(item.authorOrBrand || 'Study HUB').replace(/"/g, '""')}"`,
        item.price,
        stock,
        `"${status}"`,
        valuation
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studyhub_inventory_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Inventory CSV report downloaded successfully!");
  };

  // Export Audit Logs to CSV
  const handleExportAuditCsv = () => {
    const headers = ["Log ID", "Date Time", "SKU", "Item Name", "Action Type", "Stock Delta", "Previous Stock", "New Stock", "Notes", "Performed By"];
    const rows = stockMovementLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.sku}"`,
      `"${l.itemName.replace(/"/g, '""')}"`,
      `"${l.type}"`,
      l.change > 0 ? `+${l.change}` : l.change,
      l.previousStock,
      l.newStock,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.performedBy || 'Administrator'}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studyhub_stock_audit_trail_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Stock movement audit trail CSV downloaded successfully!");
  };

  // Permanent Delete Item
  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`)) {
      markIdAsDeleted("storeItems", itemId);
      setStoreItems(prev => {
        const next = prev.filter(i => i.id !== itemId);
        localStorage.setItem("co_store_items", JSON.stringify(next));
        return next;
      });
      localStorage.setItem("co_seeded_storeItems", "true");
      try {
        await deleteDoc(doc(db, "storeItems", itemId));
      } catch (err) {
        console.error("Error deleting document from Firestore:", err);
      }
      showNotification(`Permanently deleted "${itemName}" from store inventory.`);
    }
  };



  // Permanent Delete Order by Admin
  const handleDeleteOrder = async (orderId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete order "${orderId}" for ${studentName}? This action cannot be undone.`)) {
      markIdAsDeleted("storeOrders", orderId);
      setStoreOrders(prev => {
        const next = prev.filter(o => o.id !== orderId);
        localStorage.setItem("co_store_orders", JSON.stringify(next));
        return next;
      });
      try {
        await deleteDoc(doc(db, "storeOrders", orderId));
      } catch (err) {
        console.error("Error deleting order from Firestore:", err);
      }
      showNotification(`Permanently deleted order ${orderId}.`);
    }
  };

  // Generate Clean Standalone Invoice HTML Document
  const getInvoiceHtmlDocument = (order: StoreOrder) => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice_${order.id}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; background: #ffffff; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
      .title { font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; }
      .sub { font-size: 11px; color: #64748b; font-weight: 600; }
      .badge { background: #1e1b4b; color: white; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 12px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
      th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; color: #334155; }
      td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
      .total-box { background: #0f172a; color: white; padding: 16px; border-radius: 12px; width: 220px; margin-left: auto; text-align: right; font-size: 12px; }
      .total-box .grand { font-size: 16px; font-weight: 900; border-top: 1px solid #334155; padding-top: 6px; margin-top: 6px; color: #ffffff; }
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }
      .seal { border: 2px solid #4338ca; color: #1e1b4b; padding: 6px 12px; border-radius: 6px; font-weight: 900; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; transform: rotate(-3deg); opacity: 0.8; }
      @media print {
        .no-print { display: none !important; }
        body { margin: 10px; }
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
      <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 11px;">🖨️ Print Document / Save PDF</button>
      <button onclick="window.close()" style="padding: 10px 16px; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 11px;">Close Window</button>
    </div>
    <div class="header">
      <div>
        <div class="title">STUDY HUB MADHYA PRADESH</div>
        <div class="sub">Official Educational Books & Exam Kit Store</div>
        <div class="sub">GSTIN: 23AAACS9812K1Z9 | Registration No: MP-EDU-2026</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">Tax Invoice / Memo</span>
        <div style="font-weight: 900; font-size: 15px; margin-top: 4px; color: #0f172a;">#${order.id}</div>
        <div class="sub">Date: ${order.orderDate}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div style="color: #4338ca; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px;">Billed & Shipped To:</div>
        <div style="font-weight: 800; font-size: 14px; color: #0f172a;">${order.studentName}</div>
        <div>Phone: <strong>${order.studentMobile}</strong></div>
        <div>Email: ${order.studentEmail}</div>
        <div style="margin-top: 4px; color: #334155;">Address: ${order.shippingAddress || order.centerAddress || "Study HUB Center Address"}</div>
      </div>
      <div style="text-align: right;">
        <div style="color: #4338ca; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px;">Order Status & Payment:</div>
        <div>Payment Method: <strong>${order.paymentMethod}</strong></div>
        <div>Status: <strong style="color: #047857;">${order.status}</strong></div>
        ${order.courierName ? `<div style="margin-top: 6px; font-size: 11px;">Courier: <strong>${order.courierName}</strong><br/>Tracking ID: <strong>${order.trackingId || 'N/A'}</strong></div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Item Description</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map((item, idx) => `
          <tr>
            <td style="color: #64748b;">${idx + 1}</td>
            <td><strong>${item.itemName}</strong></td>
            <td style="text-align: right;">₹${item.price}</td>
            <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
            <td style="text-align: right;"><strong>₹${item.price * item.quantity}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-box">
      <div>Subtotal: ₹${order.totalAmount}</div>
      <div style="color: #34d399;">Home Delivery: FREE</div>
      <div class="grand">Grand Total: ₹${order.totalAmount}</div>
    </div>

    <div class="footer">
      <div>
        <p style="margin: 0; font-weight: 700; color: #475569;">Generated by Study HUB ERP System</p>
        <p style="margin: 2px 0 0 0; color: #94a3b8;">Computer generated tax invoice valid for Study HUB returns.</p>
      </div>
      <div style="text-align: center;">
        <div class="seal">VERIFIED & SEALED</div>
        <p style="margin: 4px 0 0 0; font-weight: 800; color: #334155;">Authorized Signatory</p>
      </div>
    </div>
  </body>
</html>`;
  };

  // Open Invoice in Standalone Popup Window for Instant Printing
  const handlePrintInvoice = (order: StoreOrder) => {
    const html = getInvoiceHtmlDocument(order);
    try {
      const pWin = window.open("", "_blank", "width=850,height=900");
      if (pWin) {
        pWin.document.open();
        pWin.document.write(html);
        pWin.document.close();
        setTimeout(() => {
          pWin.focus();
          pWin.print();
        }, 400);
        return;
      }
    } catch (e) {
      console.error("Popup print window error:", e);
    }
    // Fallback to in-page print
    window.print();
  };

  // Download Invoice HTML file
  const handleDownloadInvoiceHtml = (order: StoreOrder) => {
    const html = getInvoiceHtmlDocument(order);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${order.id}_${order.studentName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Downloaded tax invoice HTML for order ${order.id}!`);
  };

  // Add Item to On-Demand Order Cart
  const handleAddItemToDemandOrder = (item: StoreItem) => {
    setOrderCartItems(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId: item.id, itemName: item.name, price: item.price, quantity: 1, itemType: item.type }];
    });
  };

  // Remove Item from On-Demand Order Cart
  const handleRemoveItemFromDemandOrder = (itemId: string) => {
    setOrderCartItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  // Update Item Quantity in On-Demand Order Cart
  const handleUpdateDemandItemQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItemFromDemandOrder(itemId);
      return;
    }
    setOrderCartItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: qty } : i));
  };

  // Create Order on Demand
  const handleCreateDemandOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderCartItems.length === 0) {
      alert("Please select at least one store item for this order.");
      return;
    }

    let sId = selectedStudentId;
    let sName = customStudentName.trim();
    let sEmail = customStudentEmail.trim();
    let sMobile = customStudentMobile.trim();

    if (selectedStudentId) {
      const matchedStudent = students.find(s => s.id === selectedStudentId);
      if (matchedStudent) {
        sId = matchedStudent.id;
        sName = matchedStudent.name;
        sEmail = matchedStudent.email || `${matchedStudent.rollNo || matchedStudent.id}@coachinghub.edu`;
        sMobile = matchedStudent.mobileNumber || "9876543210";
      }
    } else {
      if (!sName) {
        alert("Please select a student or enter the student's name.");
        return;
      }
      sId = "std_demand_" + Date.now();
    }

    const totalAmount = orderCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrderId = "ORD-DEMAND-" + Math.floor(100000 + Math.random() * 900000);

    const newOrder: StoreOrder = {
      id: newOrderId,
      studentId: sId,
      studentName: sName,
      studentEmail: sEmail || `${sId}@coachinghub.edu`,
      studentMobile: sMobile || "9876543210",
      items: orderCartItems,
      totalAmount,
      paymentMethod: orderPaymentMethod,
      shippingAddress: orderShippingAddress.trim() || "Study HUB Center / Home Address",
      status: orderStatus as any,
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      adminComment: "Created on demand by Administrator."
    };

    // Reduce stock for ordered items
    setStoreItems(prev => prev.map(item => {
      const ordered = orderCartItems.find(ci => ci.itemId === item.id);
      if (ordered) {
        const currentStock = item.stockCount ?? (item.inStock ? 50 : 0);
        const newStock = Math.max(0, currentStock - ordered.quantity);
        return {
          ...item,
          stockCount: newStock,
          inStock: newStock > 0
        };
      }
      return item;
    }));

    setStoreOrders(prev => {
      const next = [newOrder, ...prev];
      localStorage.setItem("co_store_orders", JSON.stringify(next));
      return next;
    });

    try {
      await setDoc(doc(db, "storeOrders", newOrder.id), newOrder);
    } catch (err) {
      console.error("Error saving on demand order to Firestore:", err);
    }

    setIsCreateOrderModalOpen(false);
    // Reset form state
    setSelectedStudentId("");
    setCustomStudentName("");
    setCustomStudentEmail("");
    setCustomStudentMobile("");
    setOrderShippingAddress("");
    setOrderCartItems([]);
    showNotification(`Successfully created order ${newOrderId} on demand for ${sName}!`);
  };
  const handleOpenDeliveryModal = (order: StoreOrder) => {
    setSelectedOrderForDelivery(order);
    setCourierName(order.courierName || "Delhivery Express");
    setTrackingId(order.trackingId || ("SHB-TRK-" + Math.floor(100000 + Math.random() * 900000)));
    
    // Set default expected date to 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setExpectedDate(order.expectedDeliveryDate || d.toISOString().split('T')[0]);
    setDeliveryNotes(order.deliveryNotes || "Deliver to student residential address. Call student before arrival.");
  };

  // Confirm Dispatch & Delivery Control
  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDelivery) return;

    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStoreOrders(prev => prev.map(o => {
      if (o.id === selectedOrderForDelivery.id) {
        return {
          ...o,
          status: "Out for Delivery",
          courierName: courierName.trim(),
          trackingId: trackingId.trim(),
          expectedDeliveryDate: expectedDate,
          deliveryNotes: deliveryNotes.trim(),
          dispatchedAt: dateStr,
          adminComment: `Dispatched via ${courierName}. Waybill: ${trackingId}. Est delivery: ${expectedDate}.`
        };
      }
      return o;
    }));

    showNotification(`Order ${selectedOrderForDelivery.id} dispatched for home delivery via ${courierName}!`);
    setSelectedOrderForDelivery(null);
  };

  // Mark Delivered to Student Home
  const handleMarkDelivered = (orderId: string) => {
    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStoreOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Delivered",
          deliveredAt: dateStr,
          adminComment: `Successfully delivered to student home on ${dateStr}. Payment/Signature verified.`
        };
      }
      return o;
    }));

    showNotification(`Order ${orderId} marked as DELIVERED to student home!`);
  };

  // Confirm Order by Admin (Immediately activates courses for student dashboard)
  const handleConfirmOrder = (orderId: string) => {
    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStoreOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = {
          ...o,
          status: "Confirmed",
          paymentConfirmedAt: dateStr,
          adminComment: `Order confirmed by Admin on ${dateStr}. Course access granted automatically to student course dashboard.`
        };
        try {
          const targetDoc = doc(db, "storeOrders", orderId);
          setDoc(targetDoc, updated, { merge: true }).catch(() => {});
        } catch (e) {
          // Fallback
        }
        return updated;
      }
      return o;
    }));

    showNotification(`Order #${orderId} CONFIRMED! The course is now automatically visible in the student's Course Dashboard.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Sticky Top Header with Fixed Top-Left Build New Item Button & Core Inventory Controls */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pt-1 pb-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* USER DIRECTIVE: Fixed top-left Build New Item Button */}
          <button
            onClick={handleOpenBuildModal}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 flex items-center space-x-2 shrink-0 cursor-pointer transition-all"
            title="Build New Item"
          >
            <Plus className="w-4 h-4" />
            <span>Build New Item</span>
          </button>

          {/* Quick Inward Consignment / Restock Button */}
          <button
            onClick={() => {
              setRestockItemId(safeItems[0]?.id || "");
              setIsRestockModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all"
            title="Record Inward Stock Consignment / Restock"
          >
            <Zap className="w-4 h-4" />
            <span>Intake / Restock</span>
          </button>

          {/* Stock Valuation Ledger Report */}
          <button
            onClick={() => setIsValuationModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all"
            title="Open Full Stock Valuation & Audit Ledger"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Valuation Ledger</span>
          </button>

          {/* Export Catalogue CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all"
            title="Export full inventory data to CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Critical Emergency Auto-Replenish if needed */}
          {criticalLowCount > 0 && (
            <button
              onClick={handleAutoRestockCriticalItems}
              className="px-3 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all animate-pulse"
              title="Emergency: Automatically replenish all items with <5 units to 25 units"
            >
              <AlertCircle className="w-3.5 h-3.5 text-white" />
              <span>Auto-Replenish Low ({criticalLowCount})</span>
            </button>
          )}

          <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
            <Boxes className="w-3.5 h-3.5 text-indigo-600" />
            <span>Inventory Management ({totalItemsCount} items)</span>
          </div>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Total SKUs</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalItemsCount}</p>
          <p className="text-[10px] text-slate-400">Catalogue items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Stock Units</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalStockUnits}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Available in hub</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Stock Value</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">₹{totalValuation.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium">Warehouse asset value</p>
        </div>

        <div 
          onClick={() => setStockStatusFilter(stockStatusFilter === "critical_low" ? "all" : "critical_low")}
          className={`p-4 rounded-2xl border shadow-xs space-y-1 cursor-pointer transition-all ${
            stockStatusFilter === "critical_low"
              ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase text-rose-700">Low Stock (&lt; 5)</span>
            <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <p className="text-2xl font-black text-rose-600">{criticalLowCount}</p>
            <span className="text-[10px] text-slate-400 font-semibold">({lowStockCount} with 5-14)</span>
          </div>
          <p className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            Critical stock below 5
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Out of Stock</span>
            <Tag className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{outOfStockCount}</p>
          <p className="text-[10px] text-rose-700 font-medium">Needs reordering</p>
        </div>

        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-indigo-200">
            <span className="text-[11px] font-bold uppercase">Home Delivery</span>
            <Truck className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black text-white">{pendingDeliveriesCount}</p>
          <p className="text-[10px] text-indigo-100 font-medium">Pending dispatches</p>
        </div>
      </div>

      {/* Main View Mode Selector (Catalogue vs Orders vs Stock Movement Logs) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setActiveView("inventory")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 cursor-pointer ${
              activeView === "inventory"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Store Catalogue & Stock Control ({totalItemsCount})</span>
          </button>

          <button
            onClick={() => setActiveView("delivery-orders")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 cursor-pointer ${
              activeView === "delivery-orders"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Order Control & Home Delivery ({safeOrders.length})</span>
            {pendingDeliveriesCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingDeliveriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("audit-logs")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 cursor-pointer ${
              activeView === "audit-logs"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Audit Trail & Ledger ({stockMovementLogs.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INVENTORY & STOCK CONTROL */}
      {activeView === "inventory" && (
        <div className="space-y-4">
          {/* Filtering Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setCategoryFilter("book")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "book" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>Books</span>
              </button>
              <button
                onClick={() => setCategoryFilter("study_guide")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "study_guide" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Study Guides</span>
              </button>
              <button
                onClick={() => setCategoryFilter("stationery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "stationery" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Stationery</span>
              </button>
              <button
                onClick={() => setCategoryFilter("exam_kit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  categoryFilter === "exam_kit" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Exam Kits</span>
              </button>
            </div>

            {/* Search, Stock Status, Sort & Inventory Valuation */}
            <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-2">
              <div className="relative flex-1 min-w-[170px] md:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search item, SKU, publisher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 font-medium"
                />
              </div>

              {/* Status Filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value as any)}
                className="bg-slate-50 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-indigo-600 cursor-pointer"
              >
                <option value="all">All Stock Statuses</option>
                <option value="critical_low">🚨 Low Stock (&lt; 5)</option>
                <option value="low_stock">⚠️ Moderate Stock (5 - 14)</option>
                <option value="out_of_stock">❌ Out of Stock</option>
              </select>

              {/* Sort Dropdown */}
              <div className="relative flex items-center">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-slate-50 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-indigo-600 cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="stock_asc">Stock: Low to High 🚨</option>
                  <option value="stock_desc">Stock: High to Low</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="name_asc">Title: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Table & Stock Control Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Item & SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Stock Control (Units)</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sortedItems.map((item) => {
                    const currentStock = item.stockCount ?? (item.inStock ? 50 : 0);
                    const isCriticalLow = currentStock > 0 && currentStock < 5;
                    const isLow = currentStock >= 5 && currentStock < 15;
                    const isOut = !item.inStock || currentStock === 0;
                    const isEditingThis = inlineEditingId === item.id;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          isCriticalLow 
                            ? "bg-rose-50/70 hover:bg-rose-100/70 border-l-4 border-l-rose-500" 
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Item Details */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"}
                              alt=""
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-extrabold text-slate-900 line-clamp-1">{item.name}</p>
                                {isCriticalLow && (
                                  <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-pulse shadow-xs">
                                    <AlertCircle className="w-3 h-3" />
                                    Low Stock
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                                  {item.sku || ("SKU-" + item.id.substring(0, 6))}
                                </span>
                                <span>•</span>
                                <span>{item.authorOrBrand || "Study HUB"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            item.type === "book" 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : item.type === "study_guide"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : item.type === "exam_kit"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {item.type === "study_guide" ? "Study Guide" : item.type === "exam_kit" ? "Exam Kit" : item.type}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4 font-black text-slate-900 text-sm">
                          ₹{item.price}
                        </td>

                        {/* Stock Quantity Control (With Inline Editing & Quick Adjust Buttons) */}
                        <td className="p-4">
                          {isEditingThis ? (
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                min="0"
                                value={inlineStockInput}
                                onChange={(e) => setInlineStockInput(Math.max(0, parseInt(e.target.value) || 0))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleInlineStockSave(item.id);
                                  if (e.key === "Escape") setInlineEditingId(null);
                                }}
                                className="w-20 px-2.5 py-1 bg-white border-2 border-indigo-600 rounded-lg text-xs font-black text-slate-900 focus:outline-none shadow-xs"
                                autoFocus
                              />
                              <button
                                onClick={() => handleInlineStockSave(item.id)}
                                className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-xs transition-all"
                                title="Save Stock Count"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setInlineEditingId(null)}
                                className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                                title="Cancel Edit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleAdjustStock(item.id, -5)}
                                title="Decrease 5 Units"
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleAdjustStock(item.id, -1)}
                                title="Decrease 1 Unit"
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs"
                              >
                                -1
                              </button>

                              {/* Clickable Stock Badge to trigger inline edit */}
                              <div
                                onClick={() => {
                                  setInlineEditingId(item.id);
                                  setInlineStockInput(currentStock);
                                }}
                                title="Click to edit exact stock value"
                                className={`font-mono font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${
                                  isOut 
                                    ? "bg-rose-100 text-rose-800 border border-rose-200 hover:border-rose-400" 
                                    : isCriticalLow
                                    ? "bg-rose-100 text-rose-900 border-2 border-rose-400 font-extrabold animate-pulse"
                                    : isLow 
                                    ? "bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-400" 
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-400"
                                }`}
                              >
                                {isCriticalLow && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                                <span>{currentStock} units</span>
                                <Edit2 className="w-2.5 h-2.5 text-slate-400 ml-0.5 opacity-60" />
                              </div>

                              <button
                                onClick={() => handleAdjustStock(item.id, 1)}
                                title="Increase 1 Unit"
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleAdjustStock(item.id, 10)}
                                title="Increase 10 Units"
                                className="w-6 h-6 sm:w-7 sm:h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors text-[10px]"
                              >
                                +10
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Availability Toggle */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStockStatus(item.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                              !isOut
                                ? isCriticalLow
                                  ? "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${!isOut ? (isCriticalLow ? "bg-rose-500 animate-ping" : "bg-emerald-500") : "bg-rose-500"}`}></span>
                            <span>{!isOut ? (isCriticalLow ? "Low Stock (<5)" : "In Stock") : "Out of Stock"}</span>
                          </button>
                        </td>

                        {/* Actions (Restock / Barcode / Edit / Delete) */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Quick Inward Restock */}
                            <button
                              onClick={() => {
                                setRestockItemId(item.id);
                                setIsRestockModalOpen(true);
                              }}
                              title="Inward Shipment / Restock This Item"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Zap className="w-4 h-4" />
                            </button>

                            {/* Barcode / SKU Tag Generator */}
                            <button
                              onClick={() => setBarcodeModalItem(item)}
                              title="Generate Barcode / SKU Tag"
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Edit Item */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Item Details"
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Item */}
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              title="Remove Item Permanently"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {sortedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                        No store items found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ORDER CONTROL & STUDENT HOME DELIVERY */}
      {activeView === "delivery-orders" && (
        <div className="space-y-4">
          {/* Order Status Filters & Create Order Action */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setOrderStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Orders ({safeOrders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === "pending" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pending Confirmation ({safeOrders.filter(o => o.status === "Pending Confirmation" || o.status === "Pending Admin Verification" || o.status === "Pending Payment at Center" || o.status === "Placed" || o.status === "Pending").length})
              </button>
              <button
                onClick={() => setOrderStatusFilter("confirmed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === "confirmed" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Confirmed ({safeOrders.filter(o => o.status === "Confirmed" || o.status === "Payment Confirmed / Active" || o.status === "Verified & Approved" || o.status === "Active").length})
              </button>
              <button
                onClick={() => setOrderStatusFilter("Out for Delivery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === "Out for Delivery" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Out for Delivery ({safeOrders.filter(o => o.status === "Out for Delivery").length})
              </button>
              <button
                onClick={() => setOrderStatusFilter("Delivered")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === "Delivered" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Delivered ({safeOrders.filter(o => o.status === "Delivered").length})
              </button>
            </div>

            <button
              onClick={() => setIsCreateOrderModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Order (On Demand)</span>
            </button>
          </div>

          {/* Orders Ledger List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isDispatched = order.status === "Out for Delivery";
              const isDelivered = order.status === "Delivered";
              const isConfirmed = order.status === "Confirmed" || order.status === "Payment Confirmed / Active" || order.status === "Verified & Approved";
              const hasCourseItem = (order.items || []).some(i => i.itemType === "course" || i.courseId || (courses || []).some(c => c.id === i.itemId || (i.itemName && c.title.toLowerCase().includes(i.itemName.toLowerCase()))));

              return (
                <div key={order.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                          {order.id}
                        </span>
                        {hasCourseItem && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-purple-600" />
                            Course Order
                          </span>
                        )}
                        {hasCourseItem && isConfirmed && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active in Student Dashboard
                          </span>
                        )}
                        <span className="text-xs text-slate-400">Order Date: {order.orderDate}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {order.items && order.items.length > 0 ? order.items.map(i => i.itemName).join(", ") : "Book & Stationery Order"}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase border ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : isDispatched
                          ? "bg-sky-50 text-sky-700 border-sky-300"
                          : "bg-amber-50 text-amber-700 border-amber-300"
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-base font-black text-slate-900">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Student & Shipping Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Student Information</span>
                      </p>
                      <p className="font-semibold text-slate-800">{order.studentName}</p>
                      <p className="text-[11px] text-slate-500">{order.studentEmail}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{order.studentMobile}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>Student Home Address</span>
                      </p>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        {order.shippingAddress || order.centerAddress || "Student Registered Home Address"}
                      </p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-1">
                        Mode: {order.paymentMethod}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Home Delivery Tracking</span>
                      </p>
                      {order.courierName ? (
                        <div className="space-y-0.5 text-[11px]">
                          <p className="font-bold text-slate-800">Courier: {order.courierName}</p>
                          <p className="font-mono text-indigo-700">Tracking: {order.trackingId}</p>
                          <p className="text-slate-500">Est. Date: {order.expectedDeliveryDate}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 font-semibold italic">
                          Not yet dispatched to courier driver.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Action Controls */}
                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    <p className="text-xs text-slate-500 italic max-w-md">
                      {order.adminComment || "Order verified and queued for student home delivery."}
                    </p>

                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                      <button
                        onClick={() => setPrintingOrder(order)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase rounded-xl transition-all border border-slate-300 flex items-center space-x-1.5 cursor-pointer"
                        title="Print or Download Order Invoice PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Invoice PDF</span>
                      </button>

                      {/* Prominent Confirm Order Button */}
                      {!isConfirmed ? (
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer hover:scale-105"
                          title="Confirm Order & Automatically Display in Student Course Dashboard"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Order</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      )}

                      {!isDelivered && !hasCourseItem && (
                        <button
                          onClick={() => handleOpenDeliveryModal(order)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{order.courierName ? "Update Delivery Info" : "Dispatch to Student Home"}</span>
                        </button>
                      )}

                      {!isDelivered && isDispatched && (
                        <button
                          onClick={() => handleMarkDelivered(order.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(order.id, order.studentName)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase rounded-xl transition-all border border-rose-200 flex items-center space-x-1 cursor-pointer"
                        title="Permanently Delete Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm font-semibold">No orders found matching the filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: STOCK MOVEMENT & AUDIT LOGS */}
      {activeView === "audit-logs" && (
        <div className="space-y-4">
          {/* Audit Filter Bar & Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Action Type Filter Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setAuditTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  auditTypeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Entries ({stockMovementLogs.length})
              </button>
              <button
                onClick={() => setAuditTypeFilter("restock")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  auditTypeFilter === "restock" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Restocks</span>
              </button>
              <button
                onClick={() => setAuditTypeFilter("manual_adjustment")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  auditTypeFilter === "manual_adjustment" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjustments</span>
              </button>
              <button
                onClick={() => setAuditTypeFilter("sale_fulfillment")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  auditTypeFilter === "sale_fulfillment" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Fulfillments</span>
              </button>
              <button
                onClick={() => setAuditTypeFilter("batch_replenish")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  auditTypeFilter === "batch_replenish" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Auto-Replenish</span>
              </button>
            </div>

            {/* Audit Search & Export CSV */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search logs by item, SKU, notes..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 font-medium"
                />
              </div>

              <button
                onClick={handleExportAuditCsv}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-all"
                title="Export stock movement log to CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">Total Audit Logs</span>
              <p className="text-2xl font-black text-slate-900">{stockMovementLogs.length}</p>
              <p className="text-[10px] text-slate-400">Tracked inventory events</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Total Inward Units</span>
              <p className="text-2xl font-black text-emerald-600">+{totalInwardUnits}</p>
              <p className="text-[10px] text-slate-400">Added via restock & adjustments</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-rose-600">Total Dispatched / Out</span>
              <p className="text-2xl font-black text-rose-600">-{totalOutwardUnits}</p>
              <p className="text-[10px] text-slate-400">Sold & dispatched to students</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-indigo-600">Net Flow</span>
              <p className={`text-2xl font-black ${totalInwardUnits - totalOutwardUnits >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                {totalInwardUnits - totalOutwardUnits >= 0 ? `+${totalInwardUnits - totalOutwardUnits}` : totalInwardUnits - totalOutwardUnits}
              </p>
              <p className="text-[10px] text-slate-400">Net inventory balance</p>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Timestamp & ID</th>
                    <th className="p-4">Item & SKU</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Quantity Change</th>
                    <th className="p-4">Stock Transition</th>
                    <th className="p-4">Consignment / Reason</th>
                    <th className="p-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAuditLogs.map((log) => {
                    const isPositive = log.change > 0;
                    const isNegative = log.change < 0;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Timestamp & Log ID */}
                        <td className="p-4">
                          <p className="font-mono font-bold text-slate-900">{log.timestamp}</p>
                          <p className="font-mono text-[10px] text-slate-400">{log.id}</p>
                        </td>

                        {/* Item Name & SKU */}
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900 line-clamp-1">{log.itemName}</p>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold">
                            {log.sku}
                          </span>
                        </td>

                        {/* Event Type */}
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border inline-block ${
                            log.type === "restock"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : log.type === "batch_replenish"
                              ? "bg-purple-50 text-purple-700 border-purple-300"
                              : log.type === "sale_fulfillment"
                              ? "bg-sky-50 text-sky-700 border-sky-300"
                              : log.type === "manual_adjustment"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : log.type === "item_created"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}>
                            {log.type === "restock"
                              ? "Inward Restock"
                              : log.type === "batch_replenish"
                              ? "Batch Replenish"
                              : log.type === "sale_fulfillment"
                              ? "Order Dispatched"
                              : log.type === "manual_adjustment"
                              ? "Manual Adjustment"
                              : log.type === "item_created"
                              ? "New Item Created"
                              : "Status Changed"}
                          </span>
                        </td>

                        {/* Change Amount */}
                        <td className="p-4">
                          <span className={`font-mono font-black text-sm px-2.5 py-1 rounded-lg ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isNegative
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {isPositive ? `+${log.change}` : log.change} units
                          </span>
                        </td>

                        {/* Transition (Previous -> New) */}
                        <td className="p-4 font-mono font-bold text-slate-700">
                          <span className="text-slate-400">{log.previousStock}</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span className="text-slate-900 font-extrabold">{log.newStock} units</span>
                        </td>

                        {/* Notes */}
                        <td className="p-4 max-w-xs">
                          <p className="text-slate-700 font-medium line-clamp-2">{log.notes || "—"}</p>
                        </td>

                        {/* Performed By */}
                        <td className="p-4 text-slate-500 font-semibold text-[11px]">
                          {log.performedBy || "Admin"}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 italic">
                        No audit log records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BUILD & EDIT ITEM MODAL */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {editingItem ? "Edit Store Item" : "Build & Add New Store Item"}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {editingItem ? "Modify Catalogue & Stock Details" : "Add Book, Study Guide, Stationery or Exam Kit"}
                </h3>
              </div>
              <button 
                onClick={() => setIsBuildModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Title / Book Name *</label>
                <input
                  type="text"
                  placeholder="e.g. NCERT Biology Chapterwise Mindmaps & PYQs"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                  >
                    <option value="book">📚 Book (Textbook / PYQ Bank)</option>
                    <option value="study_guide">📖 Study Guide (Flashcards / Mindmaps)</option>
                    <option value="stationery">✏️ Stationery (Pens / Planners / OMR)</option>
                    <option value="exam_kit">🎒 Exam Kit (All-In-One Bundle)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Author / Publisher / Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Study HUB Academic Press"
                    value={formData.authorOrBrand}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorOrBrand: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 499"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-black text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock Units *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.stockCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockCount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SH-BK-102"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-mono text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Key Features *</label>
                <textarea
                  rows={3}
                  placeholder="Describe book contents, target exam, number of pages, or kit contents..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-indigo-600 font-medium text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBuildModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingItem ? "Save Changes" : "Build & Publish Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH TO STUDENT HOME DELIVERY MODAL */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  Student Home Delivery Control
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Dispatch Order #{selectedOrderForDelivery.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-1">
              <p className="font-bold">Student: {selectedOrderForDelivery.studentName} ({selectedOrderForDelivery.studentMobile})</p>
              <p className="text-[11px] text-slate-600">Address: {selectedOrderForDelivery.shippingAddress}</p>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Courier / Logistics Partner *</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-bold text-slate-800"
                  >
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                    <option value="StudyHub Local Hub Rider">StudyHub Local Hub Rider</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Ecom Express Courier">Ecom Express Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waybill / Tracking Number *</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. SHB-TRK-98231"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-mono text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Courier Delivery Instructions / Note</label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Instructions for courier driver..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-indigo-600 font-medium text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 shadow-md shadow-amber-600/30 flex items-center space-x-2 cursor-pointer uppercase"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Order to Home</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ORDER ON DEMAND MODAL */}
      {isCreateOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  On-Demand Order Generator
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Create Store Order on Demand for Student
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemandOrder} className="space-y-4 text-xs">
              {/* Select Student Option */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                  <UserPlus className="w-4 h-4" />
                  <span>Select Student Account *</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Choose Registered Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setSelectedStudentId(sId);
                      if (sId) {
                        const std = students.find(s => s.id === sId);
                        if (std) {
                          setCustomStudentName(std.name);
                          setCustomStudentEmail(std.email || "");
                          setCustomStudentMobile(std.mobileNumber || "");
                        }
                      } else {
                        setCustomStudentName("");
                        setCustomStudentEmail("");
                        setCustomStudentMobile("");
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-indigo-600 cursor-pointer"
                  >
                    <option value="">-- Enter Custom / Unregistered Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.rollNo ? `(Roll: ${s.rollNo})` : ""} - {s.mobileNumber || s.email || s.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Student Name *</label>
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={customStudentName}
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={customStudentMobile}
                      onChange={(e) => setCustomStudentMobile(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-semibold focus:outline-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customStudentEmail}
                      onChange={(e) => setCustomStudentEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Select Items from Store Inventory */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Select Items from Store Inventory</span>
                  </span>
                  <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    Total: ₹{orderCartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id="add-item-select"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 font-medium text-xs focus:outline-indigo-600 cursor-pointer"
                    onChange={(e) => {
                      const item = safeItems.find(i => i.id === e.target.value);
                      if (item) {
                        handleAddItemToDemandOrder(item);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">-- Choose Item to Add to Order --</option>
                    {safeItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₹{item.price} (Stock: {item.stockCount ?? 50})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Added Cart Items List */}
                {orderCartItems.length > 0 ? (
                  <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {orderCartItems.map((cartItem) => (
                      <div key={cartItem.itemId} className="p-3 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 max-w-[240px]">
                          <p className="font-bold text-slate-900 truncate">{cartItem.itemName}</p>
                          <p className="text-[10px] text-slate-500">Unit Price: ₹{cartItem.price}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateDemandItemQuantity(cartItem.itemId, cartItem.quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-slate-800 px-1">{cartItem.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateDemandItemQuantity(cartItem.itemId, cartItem.quantity + 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-black text-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                          <span className="font-mono font-bold text-indigo-700 text-xs w-14 text-right">
                            ₹{cartItem.price * cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromDemandOrder(cartItem.itemId)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    No items selected yet. Choose an item above to add to this order.
                  </p>
                )}
              </div>

              {/* Shipping Address & Payment Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Home Delivery Address *</label>
                  <textarea
                    rows={2}
                    placeholder="Full street address, city, pin code, landmark..."
                    value={orderShippingAddress}
                    onChange={(e) => setOrderShippingAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-indigo-600 font-medium text-slate-800"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
                    <select
                      value={orderPaymentMethod}
                      onChange={(e) => setOrderPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 focus:outline-indigo-600 cursor-pointer"
                    >
                      <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                      <option value="Offline Payment at Study Hub Center">Offline Payment at Study Hub Center</option>
                      <option value="Paid Online / Verified">Paid Online / Verified (UPI / Card)</option>
                      <option value="Free Student Benefit">Free Student Benefit / Scholarship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Order Initial Status *</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800 focus:outline-indigo-600 cursor-pointer"
                    >
                      <option value="Placed">New Order (Placed)</option>
                      <option value="Confirmed">Confirmed & Packed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered to Student</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer uppercase"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create & Save Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT / DOWNLOAD ORDER INVOICE PDF MODAL */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div id="printable-invoice-modal" className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative print:p-0 print:border-none print:shadow-none print:rounded-none">
            {/* Action Bar (Hidden during window.print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Order Tax Invoice & Delivery Memo</h3>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                <button
                  onClick={() => handlePrintInvoice(printingOrder)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  title="Open in clean print window and print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => handleDownloadInvoiceHtml(printingOrder)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  title="Download HTML Invoice File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
                <button 
                  onClick={() => setPrintingOrder(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="space-y-6 text-slate-900 text-xs">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-indigo-600 pb-4">
                <div>
                  <h1 className="text-xl font-black text-indigo-900 tracking-tight">STUDY HUB MADHYA PRADESH</h1>
                  <p className="text-[11px] text-slate-500 font-semibold">Official Educational Books & Exam Kit Store</p>
                  <p className="text-[10px] text-slate-400">GSTIN: 23AAACS9812K1Z9 | Registration No: MP-EDU-2026</p>
                </div>
                <div className="text-right">
                  <span className="bg-indigo-900 text-white font-mono font-bold text-[10px] px-3 py-1 rounded uppercase inline-block mb-1">
                    Tax Invoice / Memo
                  </span>
                  <p className="font-mono font-black text-slate-800 text-sm">#{printingOrder.id}</p>
                  <p className="text-[11px] text-slate-500">Date: {printingOrder.orderDate}</p>
                </div>
              </div>

              {/* Customer & Delivery Meta */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900 uppercase text-[10px] text-indigo-700 mb-1">Billed & Shipped To:</p>
                  <p className="font-extrabold text-sm text-slate-900">{printingOrder.studentName}</p>
                  <p className="text-slate-600 text-[11px] font-mono">{printingOrder.studentMobile}</p>
                  <p className="text-slate-600 text-[11px]">{printingOrder.studentEmail}</p>
                  <p className="text-slate-700 text-[11px] font-medium mt-1 leading-snug">
                    {printingOrder.shippingAddress || printingOrder.centerAddress || "Study HUB Registered Address"}
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <p className="font-bold text-slate-900 uppercase text-[10px] text-indigo-700 mb-1">Order Status & Mode:</p>
                  <p className="font-bold text-slate-800">Payment: <span className="font-black text-indigo-800">{printingOrder.paymentMethod}</span></p>
                  <p className="font-bold text-slate-800">Status: <span className="font-black text-emerald-700">{printingOrder.status}</span></p>
                  {printingOrder.courierName && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px]">
                      <p className="font-bold text-slate-800">{printingOrder.courierName}</p>
                      <p className="font-mono text-indigo-700 font-bold">Tracking: {printingOrder.trackingId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {printingOrder.items && printingOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.itemName}</td>
                        <td className="p-3 text-right font-mono">₹{item.price}</td>
                        <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-slate-900">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-end pt-2">
                <div className="text-[10px] text-slate-500 space-y-1 max-w-xs">
                  <p className="font-bold text-slate-700">Terms & Conditions:</p>
                  <p>1. Computer generated tax invoice valid for Study HUB warranty and returns.</p>
                  <p>2. Subject to MP Educational Jurisdiction.</p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl w-52 space-y-1.5 text-right">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Subtotal:</span>
                    <span>₹{printingOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400">
                    <span>Home Delivery:</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between font-black text-base border-t border-slate-700 pt-1.5 text-white">
                    <span>Grand Total:</span>
                    <span>₹{printingOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Official Seal Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200 text-[10px] text-slate-400">
                <p>Generated by Study HUB ERP Management System</p>
                <div className="text-center font-serif text-slate-600">
                  <div className="w-24 h-12 border-2 border-indigo-800/30 rounded-lg flex items-center justify-center font-sans font-black text-[9px] text-indigo-900 uppercase tracking-widest rotate-[-3deg] opacity-70 mx-auto mb-1">
                    VERIFIED & SEALED
                  </div>
                  <p className="font-bold font-sans">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
