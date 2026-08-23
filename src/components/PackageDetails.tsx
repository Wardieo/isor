import logo from "../assets/logo.png";

type Props = { navigate: (to: string) => void };
const packages = [
  {
    name: "iSOLO PACKAGE",
    price: 149,
    summary: "1 Pax · 7 mins Photoshoot",
    details: [
      "7 mins Photo Selection",
      "12 Edited Soft Copy Photos",
      "1 Polaroid Print",
      "1 Backdrop Color Selection",
    ],
  },
  {
    name: "iDUO PACKAGE",
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
    name: "iTRIO PACKAGE",
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
    name: "iQUAD PACKAGE",
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
const addons = [
  {
    name: "Additional Pax",
    items: [
      ["Adult", 149],
      ["Student", 99],
      ["0–4 years old", 79],
      ["Pet", 99],
    ],
  },
  {
    name: "Additional Shooting Time / Photo Selection",
    items: [["5 minutes", 99]],
  },
  { name: "Additional Backdrop", items: [["Per color", 129]] },
  {
    name: "Extra Prints",
    items: [
      ["Polaroid / Film Strip Print", 79],
      ["4R Print", 79],
    ],
  },
];

export default function PackageDetails({ navigate }: Props) {
  return (
    <main className="details-page">
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate("/")}
          aria-label="Back home"
        >
          <img src={logo} alt="Studio logo" />
        </button>
        <button className="details-back" onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </header>
      <div className="details-container">
        <section className="birthday-promo">
          <p className="eyebrow">Celebrate your special day with us</p>
          <h1>Birthday discounts available here!</h1>
          <p>
            Your birthday deserves an extra treat. Enjoy exclusive savings on
            all of our packages.
          </p>
          <div className="discounts">
            <div>
              <strong>30% OFF</strong>
              <span>when you visit on your actual birthday</span>
            </div>
            <div>
              <strong>10% OFF</strong>
              <span>anytime during your birth month</span>
            </div>
          </div>
          <small>
            Bring a valid government or school ID to claim your discount.
          </small>
        </section>
        <section className="details-section">
          <p className="eyebrow">Studio sessions</p>
          <h2>Choose your package</h2>
          <div className="details-grid">
            {packages.map((item) => (
              <article className="details-card" key={item.name}>
                <div className="details-card-title">
                  <h3>{item.name}</h3>
                  <strong>₱{item.price}</strong>
                </div>
                <ul>
                  {item.details.map((detail) => (
                    <li key={detail}>
                      ✓ <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/book")}>
                  Book this package
                </button>
              </article>
            ))}
          </div>
        </section>
        <section className="details-section addons-section">
          <p className="eyebrow">Customize your session</p>
          <h2>Available add-ons</h2>
          <div className="addons-grid">
            {addons.map((addon) => (
              <article className="addon-card" key={addon.name}>
                <h3>{addon.name}</h3>
                {addon.items.map(([label, price]) => (
                  <div className="addon-row" key={label}>
                    <span>{label}</span>
                    <strong>₱{price}</strong>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>
      </div>
      <footer className="site-footer">
        © 2026 Self-Photo Studio · Santa Monica, Surigao del Norte
      </footer>
    </main>
  );
}
