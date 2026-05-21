import { useEffect, useMemo, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  icon: string;
};

type OrderLine = { itemId: string; qty: number };
type TableStatus = "free" | "active" | "billing";
type TableState = { id: number; status: TableStatus; order: OrderLine[] };
type PaymentMethod = "cash" | "card" | "wallet";
type Lang = "ar" | "en";

const ICON_OPTIONS: { value: string; labelAr: string; labelEn: string }[] = [
  { value: "🔥", labelAr: "🔥 مشويات", labelEn: "🔥 Grilled" },
  { value: "🍔", labelAr: "🍔 برجر", labelEn: "🍔 Burger" },
  { value: "🍕", labelAr: "🍕 بيتزا", labelEn: "🍕 Pizza" },
  { value: "🍜", labelAr: "🍜 باستا", labelEn: "🍜 Pasta" },
  { value: "🍗", labelAr: "🍗 دجاج", labelEn: "🍗 Chicken" },
  { value: "🍤", labelAr: "🍤 بحري", labelEn: "🍤 Seafood" },
  { value: "🍳", labelAr: "🍳 فطور", labelEn: "🍳 Breakfast" },
  { value: "🧀", labelAr: "🧀 أجبان", labelEn: "🧀 Cheese" },
  { value: "🥗", labelAr: "🥗 سلطات", labelEn: "🥗 Salads" },
  { value: "🍞", labelAr: "🍞 خبز", labelEn: "🍞 Bread" },
  { value: "🍦", labelAr: "🍦 آيس كريم", labelEn: "🍦 Ice cream" },
  { value: "🍰", labelAr: "🍰 كيك", labelEn: "🍰 Cake" },
  { value: "🍪", labelAr: "🍪 كوكيز", labelEn: "🍪 Cookies" },
  { value: "🍎", labelAr: "🍎 فواكه", labelEn: "🍎 Fruits" },
  { value: "☕", labelAr: "☕ قهوة", labelEn: "☕ Coffee" },
  { value: "🍵", labelAr: "🍵 شاي", labelEn: "🍵 Tea" },
  { value: "🥤", labelAr: "🥤 عصائر", labelEn: "🥤 Juice" },
  { value: "🍹", labelAr: "🍹 كوكتيل", labelEn: "🍹 Cocktail" },
  { value: "🍼", labelAr: "🍼 مياه", labelEn: "🍼 Water" },
  { value: "🐟", labelAr: "🐟 أسماك", labelEn: "🐟 Fish" },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", name: "كبدة إسكندراني", nameEn: "Alexandrian Liver", price: 95, icon: "🔥" },
  { id: "m2", name: "برجر لحم مزدوج", nameEn: "Double Beef Burger", price: 145, icon: "🍔" },
  { id: "m3", name: "بيتزا بيبروني", nameEn: "Pepperoni Pizza", price: 180, icon: "🍕" },
  { id: "m4", name: "باستا ألفريدو", nameEn: "Alfredo Pasta", price: 130, icon: "🍜" },
  { id: "m5", name: "ربع فرخة مشوي", nameEn: "Grilled Quarter Chicken", price: 120, icon: "🍗" },
  { id: "m6", name: "جمبري بانيه", nameEn: "Breaded Shrimp", price: 220, icon: "🍤" },
  { id: "m7", name: "سلطة سيزر", nameEn: "Caesar Salad", price: 75, icon: "🥗" },
  { id: "m8", name: "كيك شوكولاتة", nameEn: "Chocolate Cake", price: 60, icon: "🍰" },
  { id: "m9", name: "إسبريسو مزدوج", nameEn: "Double Espresso", price: 45, icon: "☕" },
  { id: "m10", name: "عصير مانجو فريش", nameEn: "Fresh Mango Juice", price: 55, icon: "🥤" },
  { id: "m11", name: "موهيتو ليمون نعناع", nameEn: "Lemon Mint Mojito", price: 70, icon: "🍹" },
  { id: "m12", name: "مياه معدنية", nameEn: "Mineral Water", price: 20, icon: "🍼" },
];

const TABLE_COUNT = 12;
const TAX_RATE = 0.14;

const T = {
  ar: {
    appTitle: "فليكس كاشير المطور",
    panelActive: "لوحة التحكم في المنتجات نشطة",
    toggleMode: "تبديل الوضع",
    light: "☀️ نهاري",
    dark: "🌙 ليلي",
    langBtn: "EN",
    tablesTitle: "🗺️ خريطة الطاولات الحية",
    legendFree: "فاضية",
    legendActive: "نشطة",
    editTables: "✏️ تعديل الطاولات",
    doneEdit: "✅ إنهاء التعديل",
    table: "طاولة",
    addTable: "إضافة طاولة",
    deleteTable: "حذف الطاولة",
    menuTitle: "🍽️ قائمة الطعام التفاعلية",
    activeTable: "الطاولة النشطة:",
    editMenu: "✏️ تعديل القائمة",
    clearAll: "🗑️ مسح الكل",
    confirmClear: "هل تريد مسح القائمة بالكامل؟",
    emptyMenu: "لا توجد أصناف بعد. أضف وجبة جديدة بالأسفل.",
    name: "الاسم",
    price: "السعر",
    done: "✓ تم",
    edit: "تعديل",
    delete: "حذف",
    addItem: "➕ إضافة وجبة جديدة للقائمة",
    itemName: "اسم الوجبة/المشروب",
    itemNamePh: "مثال: شاورما لحم",
    priceEgp: "السعر (ج.م)",
    chooseIcon: "اختر الأيقونة البصرية",
    save: "💾 حفظ الوجبة في القائمة",
    orderFor: "طلب طاولة #",
    orderSub: "تفاصيل العمليات والخدمات",
    resetOrder: "تصفير الطلب",
    noItems: "لا توجد أصناف في الطلب",
    subtotal: "المجموع الفرعي:",
    taxLbl: "الخدمة والضريبة (14%):",
    totalLbl: "الإجمالي المستحق:",
    payMethod: "طريقة الدفع الحالية:",
    cash: "💵 نقدًا",
    card: "💳 بطاقة",
    wallet: "📱 محفظة",
    checkout: "✅ معالجة الدفع وإغلاق الحساب",
    currency: "ج.م",
    locale: "ar-EG",
  },
  en: {
    appTitle: "Flex Cashier Pro",
    panelActive: "Products control panel is active",
    toggleMode: "Toggle mode",
    light: "☀️ Light",
    dark: "🌙 Dark",
    langBtn: "ع",
    tablesTitle: "🗺️ Live Tables Map",
    legendFree: "Free",
    legendActive: "Active",
    editTables: "✏️ Edit Tables",
    doneEdit: "✅ Done",
    table: "Table",
    addTable: "Add table",
    deleteTable: "Delete table",
    menuTitle: "🍽️ Interactive Menu",
    activeTable: "Active table:",
    editMenu: "✏️ Edit Menu",
    clearAll: "🗑️ Clear All",
    confirmClear: "Clear the entire menu?",
    emptyMenu: "No items yet. Add a new one below.",
    name: "Name",
    price: "Price",
    done: "✓ Done",
    edit: "Edit",
    delete: "Delete",
    addItem: "➕ Add a new item to the menu",
    itemName: "Item / drink name",
    itemNamePh: "e.g. Beef Shawarma",
    priceEgp: "Price (EGP)",
    chooseIcon: "Pick a visual icon",
    save: "💾 Save item to menu",
    orderFor: "Table order #",
    orderSub: "Operation and service details",
    resetOrder: "Reset order",
    noItems: "No items in the order",
    subtotal: "Subtotal:",
    taxLbl: "Service & Tax (14%):",
    totalLbl: "Total due:",
    payMethod: "Current payment method:",
    cash: "💵 Cash",
    card: "💳 Card",
    wallet: "📱 Wallet",
    checkout: "✅ Process payment & close",
    currency: "EGP",
    locale: "en-US",
  },
} as const;

export function FlexBossPOS() {
  const [now, setNow] = useState(new Date());
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);
  const [tables, setTables] = useState<TableState[]>(
    Array.from({ length: TABLE_COUNT }, (_, i) => ({
      id: i + 1,
      status: "free" as TableStatus,
      order: [],
    })),
  );
  const [activeTableId, setActiveTableId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [editMenu, setEditMenu] = useState(false);
  const [editTables, setEditTables] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<Lang>("ar");
  const t = T[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [lang, isRtl]);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newIcon, setNewIcon] = useState<string>(ICON_OPTIONS[0].value);

  useEffect(() => {
    const tm = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tm);
  }, []);

  const activeTable = tables.find((tb) => tb.id === activeTableId)!;

  const lines = useMemo(
    () =>
      activeTable.order
        .map((l) => {
          const item = menu.find((m) => m.id === l.itemId);
          return item ? { ...l, item } : null;
        })
        .filter((l): l is OrderLine & { item: MenuItem } => l !== null),
    [activeTable.order, menu],
  );

  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const itemLabel = (it: MenuItem) =>
    lang === "en" && it.nameEn ? it.nameEn : it.name;
  const iconLabel = (o: (typeof ICON_OPTIONS)[number]) =>
    lang === "en" ? o.labelEn : o.labelAr;

  function updateActiveTable(updater: (t: TableState) => TableState) {
    setTables((prev) => prev.map((tb) => (tb.id === activeTableId ? updater(tb) : tb)));
  }

  function addItemToOrder(itemId: string) {
    updateActiveTable((tb) => {
      const existing = tb.order.find((l) => l.itemId === itemId);
      const order = existing
        ? tb.order.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l))
        : [...tb.order, { itemId, qty: 1 }];
      return { ...tb, order, status: "active" };
    });
  }

  function changeQty(itemId: string, delta: number) {
    updateActiveTable((tb) => {
      const order = tb.order
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0);
      return { ...tb, order, status: order.length === 0 ? "free" : tb.status };
    });
  }

  function clearOrder() {
    updateActiveTable((tb) => ({ ...tb, order: [], status: "free" }));
  }

  function processPayment() {
    if (lines.length === 0) return;
    updateActiveTable((tb) => ({ ...tb, order: [], status: "free" }));
  }

  function clearMenu() {
    if (confirm(t.confirmClear)) setMenu([]);
  }

  function addMenuItem(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price <= 0) return;
    setMenu((m) => [
      ...m,
      { id: `m${Date.now()}`, name: newName.trim(), price, icon: newIcon },
    ]);
    setNewName("");
    setNewPrice("");
  }

  function deleteMenuItem(id: string) {
    setMenu((m) => m.filter((x) => x.id !== id));
    if (editingItemId === id) setEditingItemId(null);
  }

  function updateMenuItem(id: string, patch: Partial<MenuItem>) {
    setMenu((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function addTable() {
    setTables((prev) => [
      ...prev,
      { id: (prev.at(-1)?.id ?? 0) + 1, status: "free", order: [] },
    ]);
  }

  function deleteTable(id: number) {
    setTables((prev) => {
      const next = prev.filter((tb) => tb.id !== id);
      if (id === activeTableId && next.length > 0) setActiveTableId(next[0].id);
      return next;
    });
  }

  const tableStatusColor: Record<TableStatus, string> = {
    free: "bg-secondary text-muted-foreground border-border",
    active: "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]",
    billing: "bg-warning text-warning-foreground border-warning",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t.appTitle}</h1>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-success" />
                {t.panelActive}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary px-4 py-2 font-mono text-lg tabular-nums">
            {now.toLocaleTimeString(t.locale, { hour12: true })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-bold transition-colors hover:border-primary"
              title="Language / اللغة"
            >
              🌐 {t.langBtn}
            </button>
            <button
              onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-semibold transition-colors hover:border-primary"
              title={t.toggleMode}
            >
              {theme === "dark" ? t.light : t.dark}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.tablesTitle}</h2>
              <div className="flex items-center gap-3">
                <div className="hidden gap-3 text-xs text-muted-foreground sm:flex">
                  <Legend dot="bg-secondary" label={t.legendFree} />
                  <Legend dot="bg-primary" label={t.legendActive} />
                </div>
                <button
                  onClick={() => setEditTables((v) => !v)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${editTables ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground hover:border-primary"}`}
                >
                  {editTables ? t.doneEdit : t.editTables}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {tables.map((tb) => {
                const isActive = tb.id === activeTableId;
                const hasOrder = tb.order.length > 0;
                const status: TableStatus = hasOrder ? "active" : "free";
                return (
                  <div key={tb.id} className="relative">
                    <button
                      onClick={() => setActiveTableId(tb.id)}
                      className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 font-bold transition-all hover:scale-105 ${tableStatusColor[status]} ${isActive ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
                    >
                      <span className="text-2xl">🪑</span>
                      <span className="text-sm">{t.table} {tb.id}</span>
                      {hasOrder && (
                        <span className={`absolute -top-2 ${isRtl ? "-right-2" : "-left-2"} flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground`}>
                          {tb.order.reduce((s, l) => s + l.qty, 0)}
                        </span>
                      )}
                    </button>
                    {editTables && (
                      <button
                        onClick={() => deleteTable(tb.id)}
                        className={`absolute -top-2 ${isRtl ? "-left-2" : "-right-2"} z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow-md hover:scale-110`}
                        title={t.deleteTable}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
              {editTables && (
                <button
                  onClick={addTable}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5 text-primary transition-all hover:scale-105 hover:bg-primary/10"
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-xs font-semibold">{t.addTable}</span>
                </button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{t.menuTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  {t.activeTable} <span className="text-accent font-semibold">{t.table} {activeTableId}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setEditMenu((v) => !v); setEditingItemId(null); }}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${editMenu ? "border-accent bg-accent text-accent-foreground" : "border-border bg-secondary text-foreground hover:border-primary"}`}
                >
                  {editMenu ? t.doneEdit : t.editMenu}
                </button>
                {editMenu && (
                  <button
                    onClick={clearMenu}
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {t.clearAll}
                  </button>
                )}
              </div>
            </div>
            {menu.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                {t.emptyMenu}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {menu.map((item) => {
                  const isEditing = editingItemId === item.id;
                  if (editMenu && isEditing) {
                    return (
                      <div key={item.id} className="flex flex-col gap-2 rounded-xl border-2 border-primary bg-secondary p-3">
                        <select
                          value={item.icon}
                          onChange={(e) => updateMenuItem(item.id, { icon: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        >
                          {ICON_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{iconLabel(o)}</option>
                          ))}
                        </select>
                        <input
                          value={itemLabel(item)}
                          onChange={(e) => updateMenuItem(item.id, lang === "en" ? { nameEn: e.target.value } : { name: e.target.value })}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                          placeholder={t.name}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateMenuItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                          placeholder={t.price}
                        />
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="rounded-md bg-primary px-2 py-1.5 text-xs font-bold text-primary-foreground"
                        >
                          {t.done}
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => (editMenu ? setEditingItemId(item.id) : addItemToOrder(item.id))}
                        className="group flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-secondary p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
                      >
                        <span className="text-4xl transition-transform group-hover:scale-110">{item.icon}</span>
                        <span className="text-sm font-semibold leading-tight">{itemLabel(item)}</span>
                        <span className="text-sm font-bold text-primary">{item.price.toFixed(2)} {t.currency}</span>
                      </button>
                      {editMenu && (
                        <>
                          <button
                            onClick={() => setEditingItemId(item.id)}
                            className={`absolute -top-2 ${isRtl ? "-right-2" : "-left-2"} z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md hover:scale-110`}
                            title={t.edit}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className={`absolute -top-2 ${isRtl ? "-left-2" : "-right-2"} z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow-md hover:scale-110`}
                            title={t.delete}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {editMenu && (
            <section className="rounded-2xl border-2 border-primary/40 bg-card p-5">
              <h2 className="mb-4 text-lg font-bold">{t.addItem}</h2>
              <form onSubmit={addMenuItem} className="grid gap-4 md:grid-cols-2">
                <Field label={t.itemName}>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.itemNamePh}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Field label={t.priceEgp}>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </Field>
                <Field label={t.chooseIcon}>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{iconLabel(o)}</option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{t.orderFor}{activeTableId}</h2>
                <p className="text-xs text-muted-foreground">{t.orderSub}</p>
              </div>
              <button
                onClick={clearOrder}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                {t.resetOrder}
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {lines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  {t.noItems}
                </p>
              ) : (
                lines.map((l) => (
                  <div key={l.itemId} className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
                    <span className="text-2xl">{l.item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{itemLabel(l.item)}</p>
                      <p className="text-xs text-muted-foreground">{l.item.price.toFixed(2)} {t.currency}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <QtyBtn onClick={() => changeQty(l.itemId, -1)}>−</QtyBtn>
                      <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                      <QtyBtn onClick={() => changeQty(l.itemId, +1)}>+</QtyBtn>
                    </div>
                    <span className="w-20 text-end text-sm font-bold text-primary">
                      {(l.item.price * l.qty).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <Row label={t.subtotal} value={`${subtotal.toFixed(2)} ${t.currency}`} />
              <Row label={t.taxLbl} value={`${tax.toFixed(2)} ${t.currency}`} />
              <Row label={t.totalLbl} value={`${total.toFixed(2)} ${t.currency}`} emphasis />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.payMethod}</p>
              <div className="grid grid-cols-3 gap-2">
                <PayBtn active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")}>{t.cash}</PayBtn>
                <PayBtn active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")}>{t.card}</PayBtn>
                <PayBtn active={paymentMethod === "wallet"} onClick={() => setPaymentMethod("wallet")}>{t.wallet}</PayBtn>
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={lines.length === 0}
              className="w-full rounded-xl px-4 py-3 text-base font-bold text-accent-foreground transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "var(--gradient-accent)" }}
            >
              {t.checkout}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${emphasis ? "border-t border-border pt-2 text-base font-bold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={emphasis ? "text-primary" : "text-foreground"}>{value}</span>
    </div>
  );
}

function QtyBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-sm font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </button>
  );
}

function PayBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "border-border bg-secondary text-muted-foreground hover:border-primary"}`}
    >
      {children}
    </button>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded ${dot}`} />
      {label}
    </span>
  );
}
