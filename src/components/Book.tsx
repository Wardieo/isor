import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import gcashExample from "../assets/example.jpeg";
import { supabase } from "../lib/supabase";

type Props = { navigate: (to: string) => void };
type BookingData = {
  package: { name: string; price: number; summary: string };
  addons: { id: string; label: string; price: number }[];
  total: number;
};
type CustomerData = {
  name: string;
  phone: string;
  email: string;
  notes: string;
};
type PaymentMethod = "cash" | "gcash";
const slots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const emptyCustomer: CustomerData = {
  name: "",
  phone: "",
  email: "",
  notes: "",
};

export default function Book({ navigate }: Props) {
  const booking = useMemo<BookingData | null>(() => {
    try {
      const value = sessionStorage.getItem("studio-booking");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerData>(emptyCustomer);
  const [confirmedCustomer, setConfirmedCustomer] =
    useState<CustomerData | null>(null);
  const [saving, setSaving] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const year = visibleMonth.getFullYear(),
    month = visibleMonth.getMonth();
  const cells = Array.from(
    {
      length:
        new Date(year, month, 1).getDay() +
        new Date(year, month + 1, 0).getDate(),
    },
    (_, index) =>
      index < new Date(year, month, 1).getDay()
        ? null
        : index - new Date(year, month, 1).getDay() + 1,
  );
  const changeMonth = (amount: number) =>
    setVisibleMonth(new Date(year, month + amount, 1));
  const displayDate = selectedDate.toLocaleDateString("en-PH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const now = new Date();
  const todayValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    let active = true;
    supabase
      .rpc("get_unavailable_times", { requested_date: dateValue })
      .then(({ data, error }) => {
        if (active && !error)
          setUnavailableTimes(
            (data ?? []).map(
              ({ appointment_time }: { appointment_time: string }) =>
                appointment_time.slice(0, 5),
            ),
          );
      });
    return () => {
      active = false;
    };
  }, [dateValue]);

  const timeValue = (time: string) => {
    const [clock, period] = time.split(" ");
    let [hours, minutes] = clock.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };
  const isPastDate = (day: number) =>
    new Date(year, month, day) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPastTime = (slot: string) => {
    if (dateValue !== todayValue) return false;
    const [hours, minutes] = timeValue(slot).split(":").map(Number);
    return hours * 60 + minutes <= now.getHours() * 60 + now.getMinutes();
  };

  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!booking || !selectedTime) return;
    const details = Object.fromEntries(
      Object.entries(customer).map(([key, value]) => [key, value.trim()]),
    ) as CustomerData;
    const reference = `ISORA-${dateValue.replaceAll("-", "")}-${selectedTime.replace(/[^0-9]/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    setSaving(true);
    setBookingError("");
    const { error } = await supabase.rpc("create_booking", {
      booking_reference: reference,
      booking_customer_name: details.name,
      booking_customer_phone: details.phone,
      booking_customer_email: details.email,
      booking_customer_notes: details.notes,
      booking_package: booking.package,
      booking_addons: booking.addons,
      booking_date: dateValue,
      booking_time: timeValue(selectedTime),
      booking_total: booking.total,
      booking_payment_method: paymentMethod,
    });
    setSaving(false);
    if (error) {
      setBookingError(
        error.code === "23505"
          ? "That appointment was just taken. Please select another time."
          : "We could not save your booking. Please try again.",
      );
      return;
    }
    sessionStorage.setItem("studio-customer", JSON.stringify(details));
    setCustomer(details);
    setConfirmedCustomer(details);
    setBookingReference(reference);
    setDetailsOpen(false);
    if (paymentMethod === "gcash") setPaymentOpen(true);
    else setConfirmationOpen(true);
  };

  return (
    <main className="book-page">
      <header className="select-header">
        <button
          onClick={() => navigate("/select-package")}
          aria-label="Go back"
        >
          ‹
        </button>
        <h1>Choose a date and time</h1>
      </header>
      <div className="book-layout">
        <section className="booking-panel">
          <h2>{booking?.package.name ?? "Studio Session"}</h2>
          <div className="booking-picker">
            <div className="calendar">
              <div className="calendar-title">
                <strong>
                  {monthNames[month]} <span>{year}</span>
                </strong>
                <div>
                  <button
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="weekdays">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="calendar-days">
                {cells.map((day, index) => (
                  <span key={index}>
                    {day && (
                      <button
                        disabled={isPastDate(day)}
                        className={
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === month
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setSelectedDate(new Date(year, month, day));
                          setSelectedTime(null);
                          setConfirmedCustomer(null);
                          setBookingReference("");
                        }}
                      >
                        {day}
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="time-slots">
              <strong>Available times for {displayDate}</strong>
              <div>
                {slots.map((slot) => {
                  const unavailable = unavailableTimes.includes(
                    timeValue(slot).slice(0, 5),
                  );
                  const past = isPastTime(slot);
                  return (
                    <button
                      disabled={unavailable || past}
                      className={`${selectedTime === slot ? "selected " : ""}${unavailable || past ? "unavailable" : ""}`}
                      onClick={() => {
                        setSelectedTime(slot);
                        setConfirmedCustomer(null);
                        setBookingReference("");
                      }}
                      key={slot}
                    >
                      {slot}
                      {unavailable ? " · Booked" : past ? " · Past" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <div className="book-sidebar">
          <aside className="studio-mini">
            <h2>Self-Photo Studio · Santa Monica</h2>
            <div>
              4.9 <span className="stars">★★★★★</span>
            </div>
            <p>Santa Monica (Sapao), Surigao del Norte</p>
          </aside>
          <aside className="booking-summary">
            <h2>Booking summary</h2>
            <div className="summary-package">
              <span>
                <strong>
                  {booking?.package.name ?? "No package selected"}
                </strong>
                <small>
                  {booking?.package.summary ?? "Return to package selection"}
                </small>
              </span>
              <b>₱{booking?.package.price ?? 0}</b>
            </div>
            {booking?.addons.map((addon) => (
              <div className="summary-addon" key={addon.id}>
                <span>{addon.label}</span>
                <b>₱{addon.price}</b>
              </div>
            ))}
            {selectedTime && (
              <div className="summary-appointment">
                <span>
                  <small>Appointment</small>
                  {displayDate}
                </span>
                <b>{selectedTime}</b>
              </div>
            )}
            {confirmedCustomer && (
              <div className="summary-customer">
                <span>
                  <small>Booked by</small>
                  <strong>{confirmedCustomer.name}</strong>
                  {confirmedCustomer.phone}
                </span>
                <button onClick={() => setDetailsOpen(true)}>Edit</button>
              </div>
            )}
            <div className="summary-total">
              <strong>Total amount</strong>
              <b>₱{booking?.total ?? 0}</b>
            </div>
            {confirmedCustomer ? (
              <div className="booking-actions">
                <button onClick={() => setPaymentOpen(true)}>
                  Continue to payment
                </button>
              </div>
            ) : (
              <button
                disabled={!booking || !selectedTime}
                onClick={() => setDetailsOpen(true)}
              >
                Continue
              </button>
            )}
          </aside>
        </div>
      </div>
      {detailsOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setDetailsOpen(false)
          }
        >
          <section
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-title"
          >
            <button
              className="modal-close"
              onClick={() => setDetailsOpen(false)}
              aria-label="Close customer details"
            >
              ×
            </button>
            <h2 id="customer-title">Who is making this booking?</h2>
            <p>
              Enter your details so the studio owner can identify and contact
              you about your appointment.
            </p>
            <form onSubmit={saveCustomer}>
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer({ ...customer, name: event.target.value })
                  }
                />
              </label>
              <label>
                Phone number
                <input
                  required
                  minLength={7}
                  type="tel"
                  autoComplete="tel"
                  value={customer.phone}
                  onChange={(event) =>
                    setCustomer({ ...customer, phone: event.target.value })
                  }
                />
              </label>
              <label>
                Email address <small>(optional)</small>
                <input
                  type="email"
                  autoComplete="email"
                  value={customer.email}
                  onChange={(event) =>
                    setCustomer({ ...customer, email: event.target.value })
                  }
                />
              </label>
              <label>
                Note for the owner <small>(optional)</small>
                <textarea
                  rows={3}
                  value={customer.notes}
                  onChange={(event) =>
                    setCustomer({ ...customer, notes: event.target.value })
                  }
                />
              </label>
              <fieldset className="payment-choice">
                <legend>Payment method</legend>
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />{" "}
                  Cash
                </label>
                <label>
                  <input
                    type="radio"
                    name="payment-method"
                    value="gcash"
                    checked={paymentMethod === "gcash"}
                    onChange={() => setPaymentMethod("gcash")}
                  />{" "}
                  GCash
                </label>
              </fieldset>
              {bookingError && (
                <p className="booking-error" role="alert">
                  {bookingError}
                </p>
              )}
              <button type="submit" disabled={saving}>
                {saving ? "Saving booking…" : "Save and review booking"}
              </button>
            </form>
          </section>
        </div>
      )}
      {paymentOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPaymentOpen(false)
          }
        >
          <section
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
          >
            <button
              className="modal-close"
              onClick={() => setPaymentOpen(false)}
              aria-label="Close payment"
            >
              ×
            </button>
            <h2 id="payment-title">Pay ₱{booking?.total ?? 0} with GCash</h2>
            <p>
              Scan the payment details below and complete your GCash payment.
            </p>
            <img
              className="gcash-example"
              src={gcashExample}
              alt="Example GCash payment details"
            />
            <a
              className="download-payment-image"
              href={gcashExample}
              download="gcash-payment-details.jpeg"
            >
              Download Image
            </a>
            <strong>
              After paying, reply on our Facebook page with your Name, Number,
              booking date and time, and payment receipt.
            </strong>
            <a
              className="facebook-payment-link"
              href="https://www.facebook.com/profile.php?id=61592382391254"
              target="_blank"
              rel="noreferrer"
            >
              Send proof on Facebook
            </a>
            <small>
              Your booking will be confirmed after the payment is verified.
            </small>
          </section>
        </div>
      )}
      {confirmationOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setConfirmationOpen(false)
          }
        >
          <section
            className="confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
          >
            <button
              className="modal-close"
              onClick={() => setConfirmationOpen(false)}
              aria-label="Close booking confirmation"
            >
              ×
            </button>
            <h2 id="confirmation-title">Booking confirmed</h2>
            <p className="confirmation-studio">with ISORA Self-Photo Studio</p>
            <div className="confirmation-details">
              <span>Date &amp; time</span>
              <strong>
                {displayDate}
                <small>{selectedTime}</small>
              </strong>
              <span>Booking ID</span>
              <strong>{bookingReference}</strong>
              <span>Package</span>
              <strong>
                {booking?.package.name}
                <small>₱{booking?.package.price.toLocaleString("en-PH")}</small>
              </strong>
              <span>Total to pay</span>
              <strong>₱{booking?.total.toLocaleString("en-PH")}</strong>
            </div>
            <p className="confirmation-note">
              Please pay the studio owner in cash when you arrive.
            </p>
            <button
              className="confirmation-action"
              onClick={() => navigate("/select-package")}
            >
              Book another package
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
