const DEFAULT_CUISINES = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Pizza",
  "Burgers",
  "Biryani",
  "Desserts",
  "Beverages",
];

export default function CuisineChips({ selected, onSelect, options = DEFAULT_CUISINES }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <Chip label="All" active={!selected} onClick={() => onSelect("")} />
      {options.map((c) => (
        <Chip key={c} label={c} active={selected === c} onClick={() => onSelect(c)} />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-brand-500 border-brand-500 text-white"
          : "bg-white border-gray-200 text-gray-600 hover:border-brand-300"
      }`}
    >
      {label}
    </button>
  );
}
