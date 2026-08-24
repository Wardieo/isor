import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import logo from "../assets/logo.png";
import cover from "../assets/cover.png";
import { supabase } from "../lib/supabase";

type HomeProps = { navigate: (to: string) => void };

const packages = [
  {
    title: "iSOLO PACKAGE - Student Rate",
    time: "7 mins",
    pax: "1 Pax",
    price: "₱189",
    details: [
      "7 mins Photoshoot",
      "7 mins Photo Selection",
      "12 Edited Soft Copy Photos",
      "1 Polaroid Print",
      "1 Backdrop Color Selection",
    ],
  },
  {
    title: "iDUO PACKAGE - Adult Rate",
    time: "10 mins",
    pax: "1–2 Pax",
    price: "₱329",
    details: [
      "10 mins Photoshoot",
      "10 mins Photo Selection",
      "20 Edited Soft Copy Photos",
      "1 Polaroid + 1 Film Strip Print",
      "1 Backdrop / Color Selection",
    ],
  },
  {
    title: "iTRIO PACKAGE - Any Age Session",
    time: "20 mins",
    pax: "1–3 Pax",
    price: "₱699",
    details: [
      "20 mins Photoshoot",
      "15 mins Photo Selection",
      "30 Edited Soft Copy Photos",
      "3 Polaroids + 1 Film Strip Prints",
      "1 Backdrop / Color Selection",
    ],
  },
  {
    title: "iQUAD PACKAGE - Any Age Session",
    time: "25 mins",
    pax: "1–5 Pax",
    price: "₱899",
    details: [
      "25 mins Photoshoot",
      "20 mins Photo Selection",
      "40 Edited Soft Copy Photos",
      "3 Polaroid Prints + 2 Film Strip Prints",
      "2 Backdrops / Color Selection",
    ],
  },
  {
    title: "iFAMILY PACKAGE",
    time: "30 mins",
    pax: "1–7 Pax",
    price: "₱1,399",
    details: [
      "30 mins Photoshoot",
      "15 mins Photo Selection",
      "All Edited Soft Copy Photos",
      "5 Polaroid Prints + 4 Film Strip Prints",
      "3 Backdrops / Color Selection",
    ],
  },
];
const addons = [
  {
    name: "Additional Pax",
    items: [
      ["Adult", "₱149"],
      ["Student", "₱99"],
      ["0–4 years old", "₱79"],
      ["Pet", "₱99"],
    ],
  },
  {
    name: "Additional Shooting Time / Photo Selection",
    items: [["5 minutes", "₱99"]],
  },
  { name: "Additional Backdrop", items: [["Per color", "₱139"]] },
  {
    name: "Extra Prints",
    items: [
      ["Polaroid / Film Strip Print", "₱79"],
      ["4R Print", "₱79"],
    ],
  },
];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
type Review = {
  id: string;
  name: string;
  rating: number;
  description: string;
  created_at: string;
};
const reviewsPerPage = 5;

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`site-header ${menuOpen ? "menu-open" : ""}`}>
      <a className="brand" href="#top" aria-label="Studio home">
        <img src={logo} alt="Studio logo" />
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="main-navigation"
        className="nav-links"
        aria-label="Main navigation"
      >
        <a href="#packages" onClick={() => setMenuOpen(false)}>
          Package
        </a>
        <a href="#about" onClick={() => setMenuOpen(false)}>
          About
        </a>
        <a href="#reviews" onClick={() => setMenuOpen(false)}>
          Reviews
        </a>
        <a href="#address" onClick={() => setMenuOpen(false)}>
          Address
        </a>
      </nav>
    </header>
  );
}

function StudioCard({ navigate }: HomeProps) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <aside className="studio-card" aria-label="Studio booking information">
      <h2>Self-Photo Studio</h2>
      <h3>Santa Monica</h3>
      <div className="rating">
        <strong>4.9</strong> <span className="stars">★★★★★</span>{" "}
        <span>Lovely moments</span>
      </div>
      <button className="book-pill" onClick={() => navigate("/select-package")}>
        Book
      </button>
      <div className="open-line">
        <span>◷</span>
        <strong>Open · Closes at 10 PM</strong>
      </div>
      <div className="schedule">
        {days.map((day) => (
          <div className="schedule-row" key={day}>
            <span>{day}</span>
            <strong>8 AM – 10 PM</strong>
          </div>
        ))}
      </div>
      <p className="timezone">Time zone (Philippine Standard Time)</p>
      <div className="card-address">
        <span>⌖</span>
        <a
          href="https://maps.app.goo.gl/AkJJ4gjHCqPKwnz49"
          target="_blank"
          rel="noreferrer"
        >
          Brgy. Mabuhay, Purok 2, Santa Monica (Sapao), Surigao del Norte
        </a>
      </div>
      <div className={`card-contact ${contactOpen ? "open" : ""}`}>
        <button
          type="button"
          className="contact-toggle"
          onClick={() => setContactOpen(!contactOpen)}
          aria-expanded={contactOpen}
        >
          Contact us <span>⌄</span>
        </button>
        {contactOpen && (
          <div className="contact-details">
            <a href="mailto:salvalozajrisagani@gmail.com">
              ✉ &nbsp; salvalozajrisagani@gmail.com
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Home({ navigate }: HomeProps) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewAverage, setReviewAverage] = useState<number | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = reviewModalOpen ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && setReviewModalOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [reviewModalOpen]);

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewError("");
      const from = (reviewPage - 1) * reviewsPerPage;
      const [{ data, error, count }, { data: stats }] = await Promise.all([
        supabase
          .from("reviews")
          .select("id, name, rating, description, created_at", {
            count: "exact",
          })
          .eq("is_visible", true)
          .order("created_at", { ascending: false })
          .range(from, from + reviewsPerPage - 1),
        supabase.rpc("get_review_stats"),
      ]);
      if (!active) return;
      if (error) setReviewError("Reviews could not be loaded right now.");
      else {
        setReviews((data ?? []) as Review[]);
        setReviewCount(count ?? 0);
        const summary = stats?.[0] as
          | { review_count: number; average_rating: number | null }
          | undefined;
        setReviewAverage(
          summary?.average_rating == null
            ? null
            : Number(summary.average_rating),
        );
      }
      setReviewsLoading(false);
    };
    void loadReviews();
    return () => {
      active = false;
    };
  }, [reviewPage]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating) return;
    setSubmittingReview(true);
    setReviewSubmitError("");
    const { error } = await supabase.from("reviews").insert({
      name: fullName.trim(),
      rating,
      description: description.trim(),
    });
    setSubmittingReview(false);
    if (error) {
      setReviewSubmitError(
        "Your review could not be submitted. Please try again.",
      );
      return;
    }
    setRating(0);
    setFullName("");
    setDescription("");
    setReviewModalOpen(false);
    if (reviewPage === 1) {
      const { data, count } = await supabase
        .from("reviews")
        .select("id, name, rating, description, created_at", { count: "exact" })
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .range(0, reviewsPerPage - 1);
      setReviews((data ?? []) as Review[]);
      setReviewCount(count ?? 0);
      setReviewAverage((current) =>
        current == null
          ? rating
          : (current * reviewCount + rating) / (reviewCount + 1),
      );
    } else setReviewPage(1);
  };

  const reviewPages = Math.ceil(reviewCount / reviewsPerPage);
  const averageRating = reviewAverage == null ? "—" : reviewAverage.toFixed(1);

  return (
    <main id="top" className="booking-home">
      <Header />
      <div className="cover-wrap">
        <img src={cover} alt="Photo studio cover" />
      </div>
      <div className="booking-layout">
        <div className="booking-main">
          <section className="content-section package-section" id="packages">
            <h2>Package</h2>
            <p className="section-note">
              CHOOSE THE SESSION THAT FITS YOUR STORY. EACH PACKAGE INCLUDES A
              PRIVATE STUDIO EXPERIENCE.
            </p>
            <div className="birthday-banner">
              <strong>Birthday discounts available!</strong>
              <span>
                30% off on your birthday · 10% off during your birth month
              </span>
            </div>
            <div className="package-list">
              {packages.map((item) => {
                const open = expandedPackage === item.title;
                return (
                  <article
                    className={`package-accordion ${open ? "open" : ""}`}
                    key={item.title}
                  >
                    <button
                      className="package-row"
                      onClick={() =>
                        setExpandedPackage(open ? null : item.title)
                      }
                      aria-expanded={open}
                    >
                      <img src={logo} alt="" />
                      <span className="package-copy">
                        <strong>{item.title}</strong>
                        <small>
                          {item.pax} &nbsp;·&nbsp; {item.time} photoshoot
                          &nbsp;·&nbsp; <u>Details</u> &nbsp;·&nbsp;{" "}
                          <b>{item.price}</b>
                        </small>
                      </span>
                      <span className="chevron">⌄</span>
                    </button>
                    {open && (
                      <div className="package-expanded">
                        <div>
                          <p>Package inclusions</p>
                          <ul>
                            <li>✓ {item.pax}</li>
                            {item.details.map((detail) => (
                              <li key={detail}>✓ {detail}</li>
                            ))}
                          </ul>
                        </div>
                        <button onClick={() => navigate("/select-package")}>
                          Book {item.title.toLowerCase()}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="home-addons">
              <div className="addons-heading">
                <div>
                  <h3>Add-ons</h3>
                  <p>Optional extras for your session</p>
                </div>
                <span>Price</span>
              </div>
              <div className="home-addons-grid">
                {addons.map((addon) => (
                  <article key={addon.name}>
                    <strong>{addon.name}</strong>
                    <div className="addon-items">
                      {addon.items.map(([label, price]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <b>{price}</b>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="content-section" id="about">
            <h2>About</h2>
            <h3>
              Your comfortable, go-to self-photography studio in Santa Monica.
            </h3>
            <div className="about-columns">
              <div>
                <strong>Contact us</strong>
                <a href="mailto:salvalozajrisagani@gmail.com">
                  ✉ &nbsp;salvalozajrisagani@gmail.com
                </a>
              </div>
              <div>
                <strong>Good to know</strong>
                <button type="button">▣ &nbsp;Booking policy</button>
              </div>
            </div>
          </section>

          <section className="content-section" id="reviews">
            <div className="review-title">
              <h2>Reviews</h2>
              <div className="review-actions">
                <span>
                  {reviewCount
                    ? `${averageRating} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                    : "Be the first to review"}
                </span>
                <button onClick={() => setReviewModalOpen(true)}>
                  Add a review
                </button>
              </div>
            </div>
            <div className="rating-summary">
              <div>
                <b>{averageRating}</b>
                <span className="stars">★★★★★</span>
                <small>Guest rating</small>
              </div>
              <p>
                Warm light, a private space, and photos you will want to keep.
              </p>
            </div>
            <div className="review-list">
              {reviewsLoading && (
                <p className="reviews-message">Loading reviews…</p>
              )}
              {!reviewsLoading && reviewError && (
                <p className="reviews-message review-load-error">
                  {reviewError}
                </p>
              )}
              {!reviewsLoading && !reviewError && reviews.length === 0 && (
                <p className="reviews-message">
                  No reviews yet. Share your experience with the studio.
                </p>
              )}
              {reviews.map((review) => (
                <article key={review.id}>
                  <strong>{review.name}</strong>
                  <span>
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)} ·{" "}
                    {new Date(review.created_at).toLocaleDateString("en-PH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <p>{review.description}</p>
                </article>
              ))}
            </div>
            {reviewPages > 1 && (
              <nav className="review-pagination" aria-label="Review pages">
                <button
                  disabled={reviewPage === 1}
                  onClick={() => setReviewPage((page) => page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {reviewPage} of {reviewPages}
                </span>
                <button
                  disabled={reviewPage === reviewPages}
                  onClick={() => setReviewPage((page) => page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </section>

          <section className="content-section" id="address">
            <h2>Address</h2>
            <a
              className="address-link"
              href="https://maps.app.goo.gl/AkJJ4gjHCqPKwnz49"
              target="_blank"
              rel="noreferrer"
            >
              ⌖ &nbsp;Brgy. Mabuhay, Purok 2, Santa Monica (Sapao), Surigao del
              Norte
            </a>
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.971839820965!2d126.03875359999999!3d10.0191824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33041b0004a9e13f%3A0xa70ca570feb45e92!2sBarangay%20Mabuhay!5e0!3m2!1sen!2sph!4v1786693909284!5m2!1sen!2sph"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Studio location in Barangay Mabuhay"
              />
            </div>
          </section>
        </div>
        <div className="booking-sidebar">
          <StudioCard navigate={navigate} />
        </div>
      </div>
      <footer className="site-footer">
        © 2026 Self-Photo Studio · Santa Monica, Surigao del Norte
      </footer>
      {reviewModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setReviewModalOpen(false)
          }
        >
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setReviewModalOpen(false)}
              aria-label="Close review form"
            >
              ×
            </button>
            <p className="eyebrow">Share your experience</p>
            <h2 id="review-modal-title">Add a review</h2>
            <form onSubmit={submitReview}>
              <fieldset>
                <legend>Your rating</legend>
                <div
                  className="star-picker"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= (hoveredRating || rating) ? "selected" : ""
                      }
                      onMouseEnter={() => setHoveredRating(star)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      aria-pressed={rating === star}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating === 0 && <small>Please choose a star rating.</small>}
              </fieldset>
              <label>
                Full name
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
              <label>
                Description
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tell us about your studio experience"
                />
              </label>
              {reviewSubmitError && (
                <p className="review-form-error" role="alert">
                  {reviewSubmitError}
                </p>
              )}
              <button
                className="review-submit"
                type="submit"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
