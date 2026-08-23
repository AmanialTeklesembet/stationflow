"use client";

import { useMemo, useState } from "react";

type ShiftStatus = "shift" | "off" | "absence" | "open";
type TemplateKey = "1" | "2" | "5" | "7" | "11" | "N" | "F" | "U" | "V" | "L";

type ShiftTemplate = {
  code: TemplateKey;
  name: string;
  time: string;
  tone: string;
  dot: string;
  status: ShiftStatus;
};

type Employee = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

type Day = {
  key: string;
  label: string;
  date: string;
  weekday: string;
  weekend?: boolean;
};

type ScheduleCell = {
  employeeId: string;
  dayKey: string;
  code: TemplateKey;
  note?: string;
  handover?: string;
};

const templates: Record<TemplateKey, ShiftTemplate> = {
  "1": {
    code: "1",
    name: "Morgen",
    time: "05:45-13:00",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
    dot: "bg-emerald-500",
    status: "shift"
  },
  "2": {
    code: "2",
    name: "Dag",
    time: "12:00-17:00",
    tone: "border-sky-200 bg-sky-50 text-sky-950",
    dot: "bg-sky-500",
    status: "shift"
  },
  "5": {
    code: "5",
    name: "Kveld",
    time: "14:00-22:15",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
    dot: "bg-amber-500",
    status: "shift"
  },
  "7": {
    code: "7",
    name: "Kortvakt",
    time: "17:00-22:15",
    tone: "border-orange-200 bg-orange-50 text-orange-950",
    dot: "bg-orange-500",
    status: "shift"
  },
  "11": {
    code: "11",
    name: "Lang dag",
    time: "08:00-16:00",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-950",
    dot: "bg-cyan-500",
    status: "shift"
  },
  N: {
    code: "N",
    name: "Natt",
    time: "22:00-06:00",
    tone: "border-indigo-200 bg-indigo-50 text-indigo-950",
    dot: "bg-indigo-500",
    status: "shift"
  },
  F: {
    code: "F",
    name: "Fri",
    time: "Fri",
    tone: "border-slate-200 bg-white text-slate-500",
    dot: "bg-slate-300",
    status: "off"
  },
  U: {
    code: "U",
    name: "Ulønnet fri",
    time: "Fravær",
    tone: "border-rose-200 bg-rose-50 text-rose-950",
    dot: "bg-rose-500",
    status: "absence"
  },
  V: {
    code: "V",
    name: "Ferie",
    time: "Ferie",
    tone: "border-teal-200 bg-teal-50 text-teal-950",
    dot: "bg-teal-500",
    status: "absence"
  },
  L: {
    code: "L",
    name: "Ledig vakt",
    time: "Åpen",
    tone: "border-dashed border-fuchsia-300 bg-fuchsia-50 text-fuchsia-950",
    dot: "bg-fuchsia-500",
    status: "open"
  }
};

const employees: Employee[] = [
  { id: "amanial", name: "Amanial", role: "Skiftleder", initials: "AT" },
  { id: "adam", name: "Adam", role: "Ansatt", initials: "AM" },
  { id: "jonas", name: "Jonas", role: "Ansatt", initials: "JS" },
  { id: "alf", name: "Alf", role: "Deltid", initials: "AF" },
  { id: "mariam", name: "Mariam", role: "Ansatt", initials: "MA" },
  { id: "sara", name: "Sara", role: "Deltid", initials: "SA" }
];

const days: Day[] = [
  { key: "2026-08-24", label: "24", date: "24. aug", weekday: "Man" },
  { key: "2026-08-25", label: "25", date: "25. aug", weekday: "Tir" },
  { key: "2026-08-26", label: "26", date: "26. aug", weekday: "Ons" },
  { key: "2026-08-27", label: "27", date: "27. aug", weekday: "Tor" },
  { key: "2026-08-28", label: "28", date: "28. aug", weekday: "Fre" },
  { key: "2026-08-29", label: "29", date: "29. aug", weekday: "Lør", weekend: true },
  { key: "2026-08-30", label: "30", date: "30. aug", weekday: "Søn", weekend: true },
  { key: "2026-08-31", label: "31", date: "31. aug", weekday: "Man" },
  { key: "2026-09-01", label: "1", date: "1. sep", weekday: "Tir" },
  { key: "2026-09-02", label: "2", date: "2. sep", weekday: "Ons" },
  { key: "2026-09-03", label: "3", date: "3. sep", weekday: "Tor" },
  { key: "2026-09-04", label: "4", date: "4. sep", weekday: "Fre" },
  { key: "2026-09-05", label: "5", date: "5. sep", weekday: "Lør", weekend: true },
  { key: "2026-09-06", label: "6", date: "6. sep", weekday: "Søn", weekend: true }
];

const scheduleSeed: Record<string, TemplateKey[]> = {
  amanial: ["1", "1", "F", "5", "5", "7", "F", "11", "11", "F", "5", "5", "F", "N"],
  adam: ["5", "5", "5", "F", "1", "1", "7", "F", "2", "2", "U", "5", "5", "F"],
  jonas: ["F", "1", "1", "1", "5", "F", "F", "5", "5", "5", "F", "1", "7", "7"],
  alf: ["2", "F", "5", "5", "5", "1", "1", "F", "F", "11", "11", "L", "F", "F"],
  mariam: ["V", "V", "V", "F", "2", "2", "F", "1", "1", "1", "5", "F", "N", "N"],
  sara: ["L", "2", "F", "7", "F", "5", "5", "2", "F", "F", "1", "1", "7", "F"]
};

const notes: Record<string, Pick<ScheduleCell, "note" | "handover">> = {
  "amanial-2026-08-27": {
    note: "Ansvar for kasseoppgjør og varelevering.",
    handover: "Kasse 2 må følges opp. Kortterminalen henger litt."
  },
  "alf-2026-09-04": {
    note: "Ledig vakt som kan tas av deltid.",
    handover: "Lite Red Bull og melk i kjøl. Bestillingsliste ligger klar."
  },
  "mariam-2026-09-06": {
    note: "Nattvakt med drivstoffrunde.",
    handover: "Pumpe 4 er sperret til tekniker har vært innom."
  }
};

const schedule: ScheduleCell[] = employees.flatMap((employee) =>
  days.map((day, index) => {
    const key = `${employee.id}-${day.key}`;
    return {
      employeeId: employee.id,
      dayKey: day.key,
      code: scheduleSeed[employee.id][index],
      ...notes[key]
    };
  })
);

const checklistItems = [
  "Sjekk kaffe og bakst før rush",
  "Temperatur kjøl/frys registrert",
  "Uteområde og pumper kontrollert",
  "Søppel og toalett tatt før vaktskifte"
];

function getCell(employeeId: string, dayKey: string) {
  return schedule.find((item) => item.employeeId === employeeId && item.dayKey === dayKey);
}

function countHours(cells: ScheduleCell[]) {
  return cells.reduce((sum, cell) => {
    const template = templates[cell.code];
    if (template.status !== "shift") {
      return sum;
    }
    if (cell.code === "2" || cell.code === "7") {
      return sum + 5;
    }
    if (cell.code === "N") {
      return sum + 8;
    }
    return sum + 7.5;
  }, 0);
}

export function StationFlowApp() {
  const [view, setView] = useState<"leder" | "ansatt">("leder");
  const [range, setRange] = useState<"uke" | "maned">("uke");
  const [selected, setSelected] = useState<ScheduleCell>(() => schedule[3]);
  const visibleDays = range === "uke" ? days.slice(0, 7) : days;
  const selectedEmployee = employees.find((employee) => employee.id === selected.employeeId)!;
  const selectedDay = days.find((day) => day.key === selected.dayKey)!;
  const selectedTemplate = templates[selected.code];

  const myShifts = useMemo(
    () =>
      schedule
        .filter((cell) => cell.employeeId === "amanial" && templates[cell.code].status === "shift")
        .slice(0, 6),
    []
  );

  return (
    <main className="min-h-screen px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              StationFlow
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              Shell Hønefoss vaktplan
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Digital versjon av månedsplanen med koder, tider, fri, fravær og ledige vakter.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                view === "leder"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setView("leder")}
            >
              Leder
            </button>
            <button
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                view === "ansatt"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => setView("ansatt")}
            >
              Ansatt
            </button>
          </div>
        </header>

        {view === "leder" ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-soft">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Vaktplan</h2>
                  <p className="text-sm text-slate-600">Uke 35 / august 2026</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      range === "uke"
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() => setRange("uke")}
                  >
                    Uke
                  </button>
                  <button
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      range === "maned"
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() => setRange("maned")}
                  >
                    Måned
                  </button>
                  <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Kopier uke
                  </button>
                  <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                    Legg til vakt
                  </button>
                </div>
              </div>

              <div className="schedule-scroll overflow-x-auto">
                <table className="w-full min-w-[980px] border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 w-48 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-bold uppercase text-slate-500">
                        Ansatt
                      </th>
                      {visibleDays.map((day) => (
                        <th
                          key={day.key}
                          className={`border-b border-r border-slate-200 px-2 py-3 text-center ${
                            day.weekend ? "bg-stone-50" : "bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase text-slate-500">
                            {day.weekday}
                          </div>
                          <div className="text-base font-bold text-slate-950">{day.label}</div>
                        </th>
                      ))}
                      <th className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right text-xs font-bold uppercase text-slate-500">
                        Timer
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => {
                      const employeeCells = visibleDays
                        .map((day) => getCell(employee.id, day.key))
                        .filter(Boolean) as ScheduleCell[];
                      return (
                        <tr key={employee.id}>
                          <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-3 text-left">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                                {employee.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-950">{employee.name}</div>
                                <div className="text-xs text-slate-500">{employee.role}</div>
                              </div>
                            </div>
                          </th>
                          {visibleDays.map((day) => {
                            const cell = getCell(employee.id, day.key)!;
                            const template = templates[cell.code];
                            const isSelected =
                              selected.employeeId === cell.employeeId && selected.dayKey === cell.dayKey;
                            return (
                              <td
                                key={day.key}
                                className={`border-b border-r border-slate-200 p-2 align-top ${
                                  day.weekend ? "bg-stone-50/70" : "bg-white"
                                }`}
                              >
                                <button
                                  className={`min-h-20 w-full rounded-md border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                                    template.tone
                                  } ${isSelected ? "ring-2 ring-slate-900" : ""}`}
                                  onClick={() => setSelected(cell)}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="rounded bg-white/70 px-1.5 py-0.5 text-xs font-black">
                                      {template.code}
                                    </span>
                                    <span className={`h-2.5 w-2.5 rounded-full ${template.dot}`} />
                                  </div>
                                  <div className="mt-2 text-sm font-bold">{template.time}</div>
                                  <div className="mt-1 text-xs font-medium opacity-80">{template.name}</div>
                                </button>
                              </td>
                            );
                          })}
                          <td className="border-b border-slate-200 bg-white px-3 py-3 text-right text-sm font-bold">
                            {countHours(employeeCells)} t
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Valgt vakt</h2>
                    <p className="text-sm text-slate-600">
                      {selectedDay.weekday} {selectedDay.date}
                    </p>
                  </div>
                  <span className={`rounded-md border px-2 py-1 text-sm font-black ${selectedTemplate.tone}`}>
                    {selectedTemplate.code}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-sm text-slate-500">Ansatt</div>
                  <div className="font-bold">{selectedEmployee.name}</div>
                  <div className="mt-3 text-sm text-slate-500">Tid</div>
                  <div className="font-bold">{selectedTemplate.time}</div>
                  <div className="mt-3 text-sm text-slate-500">Type</div>
                  <div className="font-bold">{selectedTemplate.name}</div>
                </div>
                <div className="mt-4 space-y-3">
                  <button className="w-full rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                    Rediger vakt
                  </button>
                  <button className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Send bytteforespørsel
                  </button>
                </div>
                {(selected.note || selected.handover) && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                    <div className="font-bold">Vaktoverlevering</div>
                    <p className="mt-1 leading-5">{selected.handover ?? selected.note}</p>
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
                <h2 className="text-lg font-bold">Vaktmaler</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.values(templates).map((template) => (
                    <button
                      key={template.code}
                      className={`rounded-md border p-2 text-left ${template.tone}`}
                      onClick={() => setSelected({ ...selected, code: template.code })}
                    >
                      <div className="text-xs font-black">{template.code}</div>
                      <div className="text-sm font-bold">{template.name}</div>
                      <div className="text-xs opacity-80">{template.time}</div>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 font-bold text-white">
                  AT
                </div>
                <div>
                  <h2 className="text-lg font-bold">Amanial</h2>
                  <p className="text-sm text-slate-600">Skiftleder</p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-800">Neste vakt</div>
                <div className="mt-1 text-2xl font-black text-emerald-950">Man 24. aug</div>
                <div className="mt-1 font-bold text-emerald-950">05:45-13:00</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="rounded-md bg-slate-950 px-3 py-3 text-sm font-semibold text-white">
                  Stemple inn
                </button>
                <button className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                  Meld fravær
                </button>
              </div>
            </aside>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Mine vakter</h2>
                  <p className="text-sm text-slate-600">Kommende vakter og oppgaver</p>
                </div>
                <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  Be om vaktbytte
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {myShifts.map((cell) => {
                  const day = days.find((item) => item.key === cell.dayKey)!;
                  const template = templates[cell.code];
                  return (
                    <button
                      key={`${cell.employeeId}-${cell.dayKey}`}
                      className={`rounded-lg border p-4 text-left ${template.tone}`}
                      onClick={() => {
                        setSelected(cell);
                        setView("leder");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold">
                          {day.weekday} {day.date}
                        </div>
                        <span className="rounded bg-white/70 px-2 py-1 text-xs font-black">
                          {template.code}
                        </span>
                      </div>
                      <div className="mt-3 text-xl font-black">{template.time}</div>
                      <div className="mt-1 text-sm font-semibold">{template.name}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold">Oppgaver på neste vakt</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {checklistItems.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm font-medium"
                    >
                      <input className="h-4 w-4 accent-emerald-600" type="checkbox" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
