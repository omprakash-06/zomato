import { CheckCircle2, ChefHat, Bike, PackageCheck, XCircle } from "lucide-react";

const STAGES = [
  { key: "pending", label: "Order Placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Preparing", icon: ChefHat },
  { key: "shipped", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

/**
 * status: one of "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
 * (matches backend orderModel.js orderStatus enum)
 */
export default function OrderStatusStepper({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600 font-medium text-sm py-4">
        <XCircle size={20} />
        Order was cancelled
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start justify-between relative py-4">
      <div className="absolute top-[26px] left-0 right-0 h-0.5 bg-gray-200 mx-6" />
      <div
        className="absolute top-[26px] left-0 h-0.5 bg-brand-500 mx-6 transition-all duration-500"
        style={{
          width: currentIndex >= 0 ? `calc(${(currentIndex / (STAGES.length - 1)) * 100}% - 3rem + ${currentIndex === 0 ? "0px" : "3rem"})` : "0%",
        }}
      />
      {STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const reached = currentIndex >= i;
        return (
          <div key={stage.key} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                reached ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-gray-200 text-gray-300"
              }`}
            >
              <Icon size={16} />
            </div>
            <span className={`text-[11px] text-center font-medium ${reached ? "text-gray-900" : "text-gray-400"}`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
