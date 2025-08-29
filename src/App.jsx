import React, { useEffect, useMemo, useState } from "react";

// ===== Types & Constants =====
const CATEGORIES = {
  PROTEIN_RAW: "Raw protein (100g)",
  CARB_COOKED: "Carb cooked (100g)",
  FAT: "Fat (100g)",
  SUPP: "Supplement (serving)",
  VEG: "Vegetable (100g)",
};

const MEALS = [
  { key: "breakfast", label: "ຄາບເຊົ້າ (Breakfast)" },
  { key: "lunch", label: "ຄາບທ່ຽງ (Lunch)" },
  { key: "dinner", label: "ຄາບແລງ (Dinner)" },
];

const DAILY_TARGETS = {
  kcal: 1500,
  protein: 120, // g
  fat: 45,      // g
  carbs: 153,   // g
  sodium: 2000, // mg
  sugar: 14,    // g
};

const UNIT_TYPES = {
  PER_100G: "per100g",
  PER_SERVING: "perServing",
};

// ===== Base Database (editable) =====
const BASE_DB = [
  { id: "chicken_breast", name: "Chicken Breast (ເອິກໄກ່)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 165, protein: 31, fat: 3.6, carbs: 0, sodium: 74, sugar: 0 } },
  { id: "chicken_thigh", name: "Chicken Thigh (ສະໂພກໄກ່)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 209, protein: 26, fat: 10.9, carbs: 0, sodium: 89, sugar: 0 } },
  { id: "chicken_leg", name: "Chicken Leg (ຂາໄກ່ໃຫຍ່)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 215, protein: 27, fat: 11, carbs: 0, sodium: 90, sugar: 0 } },
  { id: "chicken_drumstick", name: "Chicken Drumstick (ຂາໄກ່)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 161, protein: 18, fat: 9.2, carbs: 0, sodium: 95, sugar: 0 } },
  { id: "pork", name: "Pork (ໝູ)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 242, protein: 27, fat: 14, carbs: 0, sodium: 62, sugar: 0 } },
  { id: "salmon", name: "Salmon", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 208, protein: 20, fat: 13, carbs: 0, sodium: 59, sugar: 0 } },
  { id: "egg", name: "Egg (ໄຂ່) – per 100g (~2 ໄຂ່)", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 155, protein: 13, fat: 11, carbs: 1.1, sodium: 124, sugar: 1.1 } },
  { id: "whole_wheat_bread", name: "Whole wheat bread (ເຂົ້າໜົມປັງ)", category: CATEGORIES.CARB_COOKED, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 247, protein: 13, fat: 4.2, carbs: 41, sodium: 430, sugar: 6 } },
  { id: "rice", name: "Rice (ເຂົ້າຈ້າວ) – cooked", category: CATEGORIES.CARB_COOKED, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 130, protein: 2.4, fat: 0.3, carbs: 28, sodium: 1, sugar: 0 } },
  { id: "sticky_rice", name: "Glutinous rice (ເຂົ້າໜຽວ) – cooked", category: CATEGORIES.CARB_COOKED, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 97, protein: 2, fat: 0.2, carbs: 21, sodium: 7, sugar: 0 } },
  { id: "soybean_oil", name: "Soybean Oil", category: CATEGORIES.FAT, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 884, protein: 0, fat: 100, carbs: 0, sodium: 0, sugar: 0 } },
  { id: "peanut_butter", name: "Creamy Peanut Butter (ເນີຍຖົ່ວ)", category: CATEGORIES.FAT, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 588, protein: 25, fat: 50, carbs: 20, sodium: 460, sugar: 9 } },
  { id: "iso_soy_protein", name: "Iso Soy Protein – 1 serving (40g)", category: CATEGORIES.SUPP, unitType: UNIT_TYPES.PER_SERVING, servingSize: 40, nutrients: { kcal: 150, protein: 30, fat: 0, carbs: 2, sodium: 540, sugar: 0 } },
  { id: "lettuce", name: "Lettuce (ສະລັດ)", category: CATEGORIES.VEG, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 15, protein: 1.4, fat: 0.2, carbs: 2.9, sodium: 28, sugar: 0.8 } },
  { id: "onion", name: "Onion (ຫອມໃຫຍ່)", category: CATEGORIES.VEG, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9.3, sodium: 4, sugar: 4.2 } },
  { id: "tomato", name: "Tomato", category: CATEGORIES.VEG, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9, sodium: 5, sugar: 2.6 } },
];

// ===== Helpers =====
const STORAGE_KEYS = { DB: "kcal_db_v1", LOG: "kcal_log_v1", TARGETS: "kcal_targets_v1" };
const safeUUID = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36));
const clone = (obj) => (typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)));
const blankRow = () => ({ id: safeUUID(), foodId: "", amount: "" });
const clampNumber = (v, min, max) => { const num = parseFloat(String(v).replace(",", ".")); return Number.isNaN(num) ? 0 : Math.min(Math.max(num, min), max); };
const fmt = (n, digits = 1) => (!Number.isFinite(n) ? 0 : parseFloat(n.toFixed(digits)));
const readLS = (k, fallback) => { try { const raw = localStorage.getItem(k); if (!raw) return fallback; const parsed = JSON.parse(raw); return parsed ?? fallback; } catch { return fallback; } };
const writeLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const todayISO = () => new Date().toISOString().slice(0, 10);

export function computeNutrients(food, amountInput) {
  if (!food) return { kcal: 0, protein: 0, fat: 0, carbs: 0, sodium: 0, sugar: 0 };
  const amount = clampNumber(amountInput, 0, 100000);
  if (food.unitType === UNIT_TYPES.PER_100G) {
    const factor = amount / 100;
    return {
      kcal: food.nutrients.kcal * factor,
      protein: food.nutrients.protein * factor,
      fat: food.nutrients.fat * factor,
      carbs: food.nutrients.carbs * factor,
      sodium: food.nutrients.sodium * factor,
      sugar: food.nutrients.sugar * factor,
    };
  }
  const factor = amount; // per serving
  return {
    kcal: food.nutrients.kcal * factor,
    protein: food.nutrients.protein * factor,
    fat: food.nutrients.fat * factor,
    carbs: food.nutrients.carbs * factor,
    sodium: food.nutrients.sodium * factor,
    sugar: food.nutrients.sugar * factor,
  };
}

export function sumNutri(rows, db) {
  return rows.reduce((acc, r) => {
    const f = db.find((d) => d.id === r.foodId);
    const n = computeNutrients(f, r.amount);
    acc.kcal += n.kcal; acc.protein += n.protein; acc.fat += n.fat; acc.carbs += n.carbs; acc.sodium += n.sodium; acc.sugar += n.sugar;
    return acc;
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0, sodium: 0, sugar: 0 });
}

export const pctOf = (val, target) => (target > 0 ? Math.min(100, (val / target) * 100) : 0);

function Pill({ children, tone = "stone" }) {
  const tones = {
    green: "bg-gray-100 text-gray-700 ring-1 ring-gray-300",
    red: "bg-red-100 text-red-700 ring-1 ring-red-300",
    stone: "bg-gray-100 text-gray-700 ring-1 ring-gray-300",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone]}`}>{children}</span>;
}

function SectionCard({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm p-4 md:p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-black">{title}</h2>
        {subtitle && <Pill>{subtitle}</Pill>}
      </div>
      {children}
    </section>
  );
}

function NumberCell({ value }) { return <span className="tabular-nums">{fmt(value)}</span>; }

function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full h-2 rounded bg-gray-200 ring-1 ring-gray-300 overflow-hidden">
      <div className="h-full bg-gray-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export default function App() {
  const [date, setDate] = useState(todayISO());
  const [db, setDb] = useState(() => readLS(STORAGE_KEYS.DB, BASE_DB));
  const [targets, setTargets] = useState(() => readLS(STORAGE_KEYS.TARGETS, DAILY_TARGETS));
  const [log, setLog] = useState(() => readLS(STORAGE_KEYS.LOG, {}));
  const [newFood, setNewFood] = useState({ name: "", category: CATEGORIES.PROTEIN_RAW, unitType: UNIT_TYPES.PER_100G, servingSize: 100, nutrients: { kcal: "", protein: "", fat: "", carbs: "", sodium: "", sugar: "" } });

  useEffect(() => {
    setLog((prev) => {
      const next = { ...prev };
      if (!next[date]) next[date] = { breakfast: [blankRow()], lunch: [blankRow()], dinner: [blankRow()] };
      return next;
    });
  }, [date]);

  useEffect(() => writeLS(STORAGE_KEYS.DB, db), [db]);
  useEffect(() => writeLS(STORAGE_KEYS.TARGETS, targets), [targets]);
  useEffect(() => writeLS(STORAGE_KEYS.LOG, log), [log]);

  const dayLog = log[date] ?? { breakfast: [blankRow()], lunch: [blankRow()], dinner: [blankRow()] };

  const totals = {
    breakfast: sumNutri(dayLog.breakfast, db),
    lunch: sumNutri(dayLog.lunch, db),
    dinner: sumNutri(dayLog.dinner, db),
  };
  const dayTotal = {
    kcal: totals.breakfast.kcal + totals.lunch.kcal + totals.dinner.kcal,
    protein: totals.breakfast.protein + totals.lunch.protein + totals.dinner.protein,
    fat: totals.breakfast.fat + totals.lunch.fat + totals.dinner.fat,
    carbs: totals.breakfast.carbs + totals.lunch.carbs + totals.dinner.carbs,
    sodium: totals.breakfast.sodium + totals.lunch.sodium + totals.dinner.sodium,
    sugar: totals.breakfast.sugar + totals.lunch.sugar + totals.dinner.sugar,
  };

  const doSetRows = (mealKey, rows) => setLog((prev) => ({ ...prev, [date]: { ...dayLog, [mealKey]: rows } }));
  const addRow = (mealKey) => doSetRows(mealKey, [...dayLog[mealKey], blankRow()]);
  const removeRow = (mealKey, rowId) => doSetRows(mealKey, dayLog[mealKey].filter((r) => r.id !== rowId));
  const updateRow = (mealKey, rowId, patch) => doSetRows(mealKey, dayLog[mealKey].map((r) => (r.id === rowId ? { ...r, ...patch } : r)));

  const groupedDb = useMemo(() => {
    const map = new Map();
    db.forEach((f) => { if (!map.has(f.category)) map.set(f.category, []); map.get(f.category).push(f); });
    map.forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [db]);

  const resetAll = () => { if (!confirm("Reset everything for this date?")) return; setLog((prev) => ({ ...prev, [date]: { breakfast: [blankRow()], lunch: [blankRow()], dinner: [blankRow()] } })); };
  const deleteFood = (foodId) => { if (!confirm("Delete this food from database?")) return; setDb((prev) => prev.filter((f) => f.id !== foodId)); };
  const addFood = () => {
    try {
      const nf = clone(newFood);
      if (!nf.name.trim()) return alert("Please enter food name");
      const id = nf.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") + "_" + Math.random().toString(36).slice(2, 6);
      const nutrients = Object.fromEntries(Object.entries(nf.nutrients).map(([k, v]) => [k, clampNumber(v, 0, 100000)]));
      const item = { id, name: nf.name.trim(), category: nf.category, unitType: nf.unitType, servingSize: clampNumber(nf.servingSize, 1, 100000), nutrients };
      setDb((prev) => [...prev, item]);
      setNewFood({ name: "", category: nf.category, unitType: nf.unitType, servingSize: nf.unitType === UNIT_TYPES.PER_100G ? 100 : 1, nutrients: { kcal: "", protein: "", fat: "", carbs: "", sodium: "", sugar: "" } });
    } catch (e) {
      console.error(e); alert("Failed to add food. Please check inputs.");
    }
  };

  const renderMeal = (mealKey, label, totalsForMeal) => (
    <SectionCard key={mealKey} title={label} subtitle={<span className="text-xs">ຕໍ່ 100g ຫຼື ຕໍ່ Servings</span>}>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="sticky top-0">
            <tr className="bg-gray-50 text-gray-800">
              <th className="text-left p-3">Food</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-right p-3">Kcal</th>
              <th className="text-right p-3">Protein(g)</th>
              <th className="text-right p-3">Fat(g)</th>
              <th className="text-right p-3">Carb(g)</th>
              <th className="text-right p-3">Sodium(mg)</th>
              <th className="text-right p-3">Sugar(g)</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {dayLog[mealKey].map((row) => {
              const food = db.find((f) => f.id === row.foodId);
              const n = computeNutrients(food, row.amount);
              return (
                <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-2">
                    <select className="w-52 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg p-2 text-gray-900" value={row.foodId} onChange={(e) => updateRow(mealKey, row.id, { foodId: e.target.value })}>
                      <option value="">— Select food —</option>
                      {[...groupedDb.keys()].map((cat) => (
                        <optgroup key={cat} label={cat}>
                          {groupedDb.get(cat).map((f) => (
                            <option key={f.id} value={f.id}>{f.name}{f.unitType === UNIT_TYPES.PER_SERVING ? " (per serving)" : ""}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <input inputMode="decimal" placeholder={food?.unitType === UNIT_TYPES.PER_SERVING ? "servings" : "grams"} className="w-24 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg p-2 text-gray-900" value={row.amount} onChange={(e) => updateRow(mealKey, row.id, { amount: e.target.value })} />
                      <span className="text-gray-500 text-xs">{food ? (food.unitType === UNIT_TYPES.PER_SERVING ? `servings (1 = ${food.servingSize}g)` : "g") : ""}</span>
                    </div>
                  </td>
                  <td className="p-2 text-right"><NumberCell value={n.kcal} /></td>
                  <td className="p-2 text-right"><NumberCell value={n.protein} /></td>
                  <td className="p-2 text-right"><NumberCell value={n.fat} /></td>
                  <td className="p-2 text-right"><NumberCell value={n.carbs} /></td>
                  <td className="p-2 text-right"><NumberCell value={n.sodium} /></td>
                  <td className="p-2 text-right"><NumberCell value={n.sugar} /></td>
                  <td className="p-2 text-center"><button onClick={() => removeRow(mealKey, row.id)} className="px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-800 text-white" title="Remove row">✕</button></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-300 bg-gray-50/80">
              <td className="p-3"><button onClick={() => addRow(mealKey)} className="px-3 py-2 rounded-xl bg-gray-700 text-white font-medium hover:bg-gray-800">+ Add item</button></td>
              <td className="p-3 text-right font-semibold text-gray-800">Totals</td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.kcal} /></td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.protein} /></td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.fat} /></td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.carbs} /></td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.sodium} /></td>
              <td className="p-3 text-right font-semibold text-gray-800"><NumberCell value={totalsForMeal.sugar} /></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SectionCard>
  );

  return (
    <div className="min-h-screen bg-white text-black antialiased">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 ring-1 ring-gray-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gray-700" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">ອາຫານKcal – Food Kcal</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Date</label>
            <input type="date" className="bg-white ring-1 ring-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
            <button onClick={resetAll} className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white">Reset meals</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <SectionCard title="Daily Targets (ຄ່າອ້າງອີງ)" subtitle={<span className="text-xs">Editable</span>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              {Object.entries(targets).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <label className="capitalize text-sm text-gray-700 w-20">{k}</label>
                  <div className="flex items-center gap-1">
                    <input inputMode="decimal" className="w-24 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1" value={v} onChange={(e) => setTargets({ ...targets, [k]: clampNumber(e.target.value, 0, 100000) })} />
                    <span className="text-xs text-gray-500">{k === "kcal" ? "kcal" : k === "sodium" ? "mg" : "g"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[["kcal","Kcal"],["protein","Protein (g)"],["fat","Fat (g)"],["carbs","Carb (g)"],["sodium","Sodium (mg)"],["sugar","Sugar (g)"]].map(([k, label]) => (
                <div key={k} className="p-3 rounded-xl bg-white ring-1 ring-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{label}</span>
                    <Pill tone={dayTotal[k] > targets[k] ? "red" : "stone"}>{fmt(dayTotal[k])} / {targets[k]}</Pill>
                  </div>
                  <div className="mt-2"><ProgressBar value={pctOf(dayTotal[k], targets[k])} /></div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {MEALS.map((m) => renderMeal(m.key, m.label, totals[m.key]))}

        <SectionCard title="ສະຫຼຸບ 1 ມື້ (Daily Total)">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-800">
                  <th className="text-left p-3">Metric</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-right p-3">Target</th>
                  <th className="text-right p-3">% of target</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries({
                  kcal: [dayTotal.kcal, targets.kcal, "kcal"],
                  protein: [dayTotal.protein, targets.protein, "g"],
                  fat: [dayTotal.fat, targets.fat, "g"],
                  carbs: [dayTotal.carbs, targets.carbs, "g"],
                  sodium: [dayTotal.sodium, targets.sodium, "mg"],
                  sugar: [dayTotal.sugar, targets.sugar, "g"],
                }).map(([k, [val, tgt, unit]]) => (
                  <tr key={k} className="border-t border-gray-200">
                    <td className="p-2 capitalize">{k}</td>
                    <td className="p-2 text-right">{fmt(val)} {unit}</td>
                    <td className="p-2 text-right">{fmt(tgt)} {unit}</td>
                    <td className="p-2 text-right">{fmt(pctOf(val, tgt), 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Food Database (ໂຕຂໍ້ມູນອາຫານ)" subtitle={<span className="text-xs">Add / Delete / View</span>}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Add new food</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1 text-sm" placeholder="Name" value={newFood.name} onChange={(e)=>setNewFood({...newFood, name: e.target.value})} />
                <select className="bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1 text-sm w-36" value={newFood.category} onChange={(e)=>setNewFood({...newFood, category: e.target.value})}>
                  {Object.values(CATEGORIES).map((c)=> <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1 text-sm w-32" value={newFood.unitType} onChange={(e)=>setNewFood({...newFood, unitType: e.target.value, servingSize: e.target.value === UNIT_TYPES.PER_100G ? 100 : 1})}>
                  <option value={UNIT_TYPES.PER_100G}>per 100g</option>
                  <option value={UNIT_TYPES.PER_SERVING}>per serving</option>
                </select>
                <input className="bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1 text-sm w-24" inputMode="decimal" value={newFood.servingSize} onChange={(e)=>setNewFood({...newFood, servingSize: e.target.value})} placeholder="Size (g)" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {["kcal","protein","fat","carbs","sodium","sugar"].map((k)=> (
                  <div key={k} className="flex items-center gap-1">
                    <label className="w-16 capitalize text-gray-700 text-sm">{k}</label>
                    <div className="flex items-center gap-1">
                      <input className="w-20 bg-white ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-lg px-2 py-1 text-sm" inputMode="decimal" value={newFood.nutrients[k]} onChange={(e)=>setNewFood({...newFood, nutrients: {...newFood.nutrients, [k]: e.target.value}})} />
                      <span className="text-xs text-gray-500">{k === "kcal" ? "kcal" : k === "sodium" ? "mg" : "g"}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addFood} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 text-sm">Add food</button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Current foods</h3>
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="min-w-[640px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-800">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-right p-2">kcal</th>
                      <th className="text-right p-2">P</th>
                      <th className="text-right p-2">F</th>
                      <th className="text-right p-2">C</th>
                      <th className="text-right p-2">Na</th>
                      <th className="text-right p-2">Sugar</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.map((f)=> (
                      <tr key={f.id} className="border-t border-gray-200">
                        <td className="p-2 text-sm">{f.name}</td>
                        <td className="p-2 text-xs text-gray-600">{f.category}</td>
                        <td className="p-2 text-xs">{f.unitType === UNIT_TYPES.PER_SERVING ? `per serving (${f.servingSize}g)` : "per 100g"}</td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.kcal} /></td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.protein} /></td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.fat} /></td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.carbs} /></td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.sodium} /></td>
                        <td className="p-2 text-right"><NumberCell value={f.nutrients.sugar} /></td>
                        <td className="p-2 text-center"><button onClick={()=>deleteFood(f.id)} className="px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-800 text-white text-xs">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>

        <footer className="text-center text-gray-500 text-xs py-6">Built for mobile-first. Tip: on phone, swipe left/right on tables to view all columns.</footer>
      </main>
    </div>
  );
}
