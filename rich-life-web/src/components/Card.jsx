export default function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg ${className}`}
    >
      {children}
    </section>
  );
}