import { useState } from "react";
import logo from "../assets/logo.png";

type Props = { navigate: (to: string) => void };
const packages = [
  {
    name: "iSOLO PACKAGE - Student Rate",
    price: 189,
    summary: "1 Pax · 7 mins Photoshoot",
    details: [
      "7 mins Photo Selection",
      "12 Edited Soft Copy Photos",
      "1 Polaroid Print",
      "1 Backdrop Color Selection",
    ],
  },
  {
    name: "iDUO PACKAGE - Adult Rate",
    price: 329,
    summary: "1–2 Pax · 10 mins Photoshoot",
    details: [
      "10 mins Photo Selection",
      "20 Edited Soft Copy Photos",
      "1 Polaroid + 1 Film Strip Print",
      "1 Backdrop Color Selection",
    ],
  },
  {
    name: "iTRIO PACKAGE - Any Age Session",
    price: 699,
    summary: "1–3 Pax · 20 mins Photoshoot",
    details: [
      "15 mins Photo Selection",
      "30 Edited Soft Copy Photos",
      "3 Polaroids + 1 Film Strip Prints",
      "1 Backdrop Color Selection",
    ],
  },
  {
    name: "iQUAD PACKAGE - Any Age Session",
    price: 899,
    summary: "1–5 Pax · 25 mins Photoshoot",
    details: [
      "20 mins Photo Selection",
      "40 Edited Soft Copy Photos",
      "3 Polaroid Prints + 2 Film Strip Prints",
      "2 Backdrops Color Selection",
    ],
  },
  {
    name: "iFAMILY PACKAGE",
    price: 1399,
    summary: "1–7 Pax · 30 mins Photoshoot",
    details: [
      "15 mins Photo Selection",
      "All Edited Soft Copy Photos",
      "5 Polaroid Prints + 4 Film Strip Prints",
      "3 Backdrops Color Selection",
    ],
  },
];
const addonGroups = [
  {
    name: "Additional Pax",
    items: [
      { label: "Adult", price: 149 },
      { label: "Student", price: 99 },
      { label: "0–4 years old", price: 79 },
      { label: "Pet", price: 99 },
    ],
  },
  {
    name: "Additional Shooting Time / Photo Selection",
    items: [{ label: "5 minutes", price: 99 }],
  },
  { name: "Additional Backdrop", items: [{ label: "Per color", price: 129 }] },
  {
    name: "Extra Prints",
    items: [
      { label: "Polaroid / Film Strip Print", price: 79 },
      { label: "4R Print", price: 79 },
    ],
  },
];

export default function SelectPackage({ navigate }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const chosenPackage = packages.find((item) => item.name === selectedPackage);
  const addonItems = addonGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, id: `${group.name}-${item.label}` })),
  );
  const total =
    (chosenPackage?.price ?? 0) +
    addonItems
      .filter((item) => selectedAddons.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  const toggleAddon = (id: string) =>
    setSelectedAddons((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const continueToBooking = () => {
    if (!chosenPackage) return;
    const chosenAddons = addonItems.filter((item) =>
      selectedAddons.includes(item.id),
    );
    sessionStorage.setItem(
      "studio-booking",
      JSON.stringify({ package: chosenPackage, addons: chosenAddons, total }),
    );
    navigate("/book");
  };

  return (
    <main className="select-page">
      <header className="select-header">
        <button onClick={() => navigate("/")} aria-label="Go back">
          ‹
        </button>
        <h1>Select a Package</h1>
      </header>
      <div className="select-layout">
        <section className="selection-panel">
          <div className="selection-heading">
            <h2>Package</h2>
            <p>Select one package to continue with your booking.</p>
          </div>
          <div className="select-package-list">
            {packages.map((item) => {
              const selected = selectedPackage === item.name;
              return (
                <button
                  className={`select-package-row ${selected ? "selected" : ""}`}
                  key={item.name}
                  onClick={() => setSelectedPackage(item.name)}
                >
                  <img src={logo} alt="" />
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.summary} · <b>₱{item.price}</b>
                    </small>
                    {selected && (
                      <ul>
                        {item.details.map((detail) => (
                          <li key={detail}>✓ {detail}</li>
                        ))}
                      </ul>
                    )}
                  </span>
                  <i>{selected ? "✓" : "›"}</i>
                </button>
              );
            })}
          </div>

          <div className="select-addons">
            <div className="selection-heading">
              <h2>Add-ons</h2>
              <p>Optional extras—select as many as you need.</p>
            </div>
            {addonGroups.map((group) => (
              <div className="select-addon-group" key={group.name}>
                <h3>{group.name}</h3>
                {group.items.map((item) => {
                  const id = `${group.name}-${item.label}`;
                  return (
                    <label key={id}>
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(id)}
                        onChange={() => toggleAddon(id)}
                      />
                      <span>{item.label}</span>
                      <strong>+ ₱{item.price}</strong>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="select-summary">
          <h2>Self-Photo Studio</h2>
          <h3>Santa Monica</h3>
          <div className="rating">
            4.9 <span className="stars">★★★★★</span>
          </div>
          <a
            href="https://maps.app.goo.gl/AkJJ4gjHCqPKwnz49"
            target="_blank"
            rel="noreferrer"
          >
            Santa Monica (Sapao), Surigao del Norte
          </a>
          <div className="order-summary">
            <span>{chosenPackage?.name ?? "No package selected"}</span>
            {chosenPackage && <strong>₱{chosenPackage.price}</strong>}
            {selectedAddons.length > 0 && (
              <small>
                {selectedAddons.length} add-on
                {selectedAddons.length > 1 ? "s" : ""} selected
              </small>
            )}
            <div>
              <span>Total</span>
              <b>₱{total}</b>
            </div>
          </div>
          <button
            className="continue-button"
            disabled={!chosenPackage}
            onClick={continueToBooking}
          >
            Continue to booking
          </button>
        </aside>
      </div>
    </main>
  );
}
