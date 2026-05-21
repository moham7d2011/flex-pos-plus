import { useEffect, useMemo, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  icon: string;
};

type OrderLine = {
  itemId: string;
  qty: number;
};

type TableStatus = "free" | "active" | "billing";

type TableState = {
  id: number;
  status: TableStatus;
  order: OrderLine[];
};

type PaymentMethod = "cash" | "card" | "wallet";

const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "🔥", label: "🔥 مأكولات مشوية / مطبوخة" },
  { value: "🍔", label: "🍔 برجر / وجبات سريعة" },
  { value: "🍕", label: "🍕 بيتزا / معجنات" },
  { value: "🍜", label: "🍜 باستا / نودلز / أرز" },
  { value: "🍗", label: "🍗 دجاج مقلي / مشوي" },
  { value: "🍤", label: "🍤 مأكولات بحرية / جمبري" },
  { value: "🍳", label: "🍳 بيض / فطور" },
  { value: "🧀", label: "🧀 أجبان / مقبلات" },
  { value: "🥗", label: "🥗 سلطات / خضروات طازجة" },
  { value: "🍞", label: "🍞 خبز / توست" },
  { value: "🍦", label: "🍦 آيس كريم / جيلاتو" },
  { value: "🍰", label: "🍰 كيك / حلويات شرقية" },
  { value: "🍪", label: "🍪 كوكيز / بسكويت" },
  { value: "🍎", label: "🍎 فواكه طازجة" },
  { value: "☕", label: "☕ قهوة إسبريسو / ساخن" },
  { value: "🍵", label: "🍵 شاي / أعشاب ساخنة" },
  { value: "🥤", label: "🥤 عصائر / موهيتو بارد" },
  { value: "🍹", label: "🍹 كوكتيلات فاخرة" },
  { value: "🍼", label: "🍼 مياه معدنية / غازية" },
  { value: "🐟", label: "🐟 أسماك / وجبات بحرية أخرى" },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: "m1", name: "كبدة إسكندراني", price: 95, icon: "🔥" },
  { id: "m2", name: "برجر لحم مزدوج", price: 145, icon: "🍔" },
  { id: "m3", name: "بيتزا بيبروني", price: 180, icon: "🍕" },
  { id: "m4", name: "باستا ألفريدو", price: 130, icon: "🍜" },
  { id: "m5", name: "ربع فرخة مشوي", price: 120, icon: "🍗" },
  { id: "m6", name: "جمبري بانيه", price: 220, icon: "🍤" },
  { id: "m7", name: "سلطة سيزر", price: 75, icon: "🥗" },
  { id: "m8", name: "كيك شوكولاتة", price: 60, icon: "🍰" },
  { id: "m9", name: "إسبريسو مزدوج", price: 45, icon: "☕" },
  { id: "m10", name: "عصير مانجو فريش", price: 55, icon: "🥤" },
  { id: "m11", name: "موهيتو ليمون نعناع", price: 70, icon: "🍹" },
  { id: "m12", name: "مياه معدنية", price: 20, icon: "🍼" },
];

const TABLE_COUNT = 12;
const TAX_RATE = 0.14;

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

  // New item form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newIcon, setNewIcon] = useState<string>(ICON_OPTIONS[0].value);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeTable = tables.find((t) => t.id === activeTableId)!;

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

  function updateActiveTable(updater: (t: TableState) => TableState) {
    setTables((prev) =>
      prev.map((t) => (t.id === activeTableId ? updater(t) : t)),
    );
  }

  function addItemToOrder(itemId: string) {
    updateActiveTable((t) => {
      const existing = t.order.find((l) => l.itemId === itemId);
      const order = existing
        ? t.order.map((l) =>
            l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l,
          )
        : [...t.order, { itemId, qty: 1 }];
      return { ...t, order, status: "active" };
    });
  }

  function changeQty(itemId: string, delta: number) {
    updateActiveTable((t) => {
      const order = t.order
        .map((l) =>
          l.itemId === itemId ? { ...l, qty: l.qty + delta } : l,
        )
        .filter((l) => l.qty > 0);
      return {
        ...t,
        order,
        status: order.length === 0 ? "free" : t.status,
      };
    });
  }

  function clearOrder() {
    updateActiveTable((t) => ({ ...t, order: [], status: "free" }));
  }

  function processPayment() {
    if (lines.length === 0) return;
    updateActiveTable((t) => ({ ...t, order: [], status: "free" }));
  }

  function clearMenu() {
    if (confirm("هل تريد مسح القائمة بالكامل؟")) setMenu([]);
  }

  function addMenuItem(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price <= 0) return;
    setMenu((m) => [
      ...m,
      {
        id: `m${Date.now()}`,
        name: newName.trim(),
        price,
        icon: newIcon,
      },
    ]);
    setNewName("");
    setNewPrice("");
  }

  const tableStatusColor: Record<TableStatus, string> = {
    free: "bg-secondary text-muted-foreground border-border",
    active: "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]",
    billing: "bg-warning text-warning-foreground border-warning",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">فليكس كاشير المطور</h1>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-success" />
                لوحة التحكم في المنتجات نشطة
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary px-4 py-2 font-mono text-lg tabular-nums">
            {now.toLocaleTimeString("ar-EG", { hour12: true })}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-12">
        {/* Left column: Tables + Menu + Add item */}
        <div className="space-y-6 lg:col-span-8">
          {/* Tables */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">🗺️ خريطة الطاولات الحية</h2>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <Legend dot="bg-secondary" label="فاضية" />
                <Legend dot="bg-primary" label="نشطة" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {tables.map((t) => {
                const isActive = t.id === activeTableId;
                const hasOrder = t.order.length > 0;
                const status: TableStatus = hasOrder ? "active" : "free";
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTableId(t.id)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 font-bold transition-all hover:scale-105 ${tableStatusColor[status]} ${isActive ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
                  >
                    <span className="text-2xl">🪑</span>
                    <span className="text-sm">طاولة {t.id}</span>
                    {hasOrder && (
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {t.order.reduce((s, l) => s + l.qty, 0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Menu */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">🍽️ قائمة الطعام التفاعلية</h2>
                <p className="text-xs text-muted-foreground">
                  الطاولة النشطة: <span className="text-accent font-semibold">طاولة {activeTableId}</span>
                </p>
              </div>
              <button
                onClick={clearMenu}
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                🗑️ مسح القائمة بالكامل
              </button>
            </div>
            {menu.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                لا توجد أصناف بعد. أضف وجبة جديدة بالأسفل.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {menu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItemToOrder(item.id)}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary p-4 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
                  >
                    <span className="text-4xl transition-transform group-hover:scale-110">{item.icon}</span>
                    <span className="text-sm font-semibold leading-tight">{item.name}</span>
                    <span className="text-sm font-bold text-primary">{item.price.toFixed(2)} ج.م</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Add item */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">➕ إضافة وجبة جديدة للقائمة</h2>
            <form onSubmit={addMenuItem} className="grid gap-4 md:grid-cols-2">
              <Field label="اسم الوجبة/المشروب">
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: شاورما لحم"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </Field>
              <Field label="السعر (ج.م)">
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
              <Field label="اختر الأيقونة البصرية">
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  💾 حفظ الوجبة في القائمة
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right column: order/checkout */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">طلب طاولة #{activeTableId}</h2>
                <p className="text-xs text-muted-foreground">تفاصيل العمليات والخدمات</p>
              </div>
              <button
                onClick={clearOrder}
                className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                تصفير الطلب
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {lines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  لا توجد أصناف في الطلب
                </p>
              ) : (
                lines.map((l) => (
                  <div
                    key={l.itemId}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3"
                  >
                    <span className="text-2xl">{l.item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{l.item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.item.price.toFixed(2)} ج.م
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <QtyBtn onClick={() => changeQty(l.itemId, -1)}>−</QtyBtn>
                      <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                      <QtyBtn onClick={() => changeQty(l.itemId, +1)}>+</QtyBtn>
                    </div>
                    <span className="w-20 text-left text-sm font-bold text-primary">
                      {(l.item.price * l.qty).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <Row label="المجموع الفرعي:" value={`${subtotal.toFixed(2)} ج.م`} />
              <Row label="الخدمة والضريبة (14%):" value={`${tax.toFixed(2)} ج.م`} />
              <Row
                label="الإجمالي المستحق:"
                value={`${total.toFixed(2)} ج.م`}
                emphasis
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                طريقة الدفع الحالية:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <PayBtn active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")}>💵 نقدًا</PayBtn>
                <PayBtn active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")}>💳 بطاقة</PayBtn>
                <PayBtn active={paymentMethod === "wallet"} onClick={() => setPaymentMethod("wallet")}>📱 محفظة</PayBtn>
              </div>
            </div>

            <button
              onClick={processPayment}
              disabled={lines.length === 0}
              className="w-full rounded-xl px-4 py-3 text-base font-bold text-accent-foreground transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "var(--gradient-accent)" }}
            >
              ✅ معالجة الدفع وإغلاق الحساب
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