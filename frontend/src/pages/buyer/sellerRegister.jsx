import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Phone, MapPin, FileText, UploadCloud, X, Loader2,
  CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import api from "../../services/axios";

const STEPS = ["Restaurant Info", "Address", "Documents"];

const emptyShopInfo = { phone: "", shopname: "" };
const emptyAddress = { house: "", street: "", state: "", pincode: "", country: "india" };

export default function BecomeSellerPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState(null); // seller doc if one already exists

  const [step, setStep] = useState(0);
  const [shopInfo, setShopInfo] = useState(emptyShopInfo);
  const [address, setAddress] = useState(emptyAddress);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // response after a fresh submit

  useEffect(() => {
    checkExistingApplication();
  }, []);

  async function checkExistingApplication() {
    setChecking(true);
    try {
      const res = await api.get("/seller/profile");
      const seller = res.data?.data;
      setExisting(seller);
    } catch (err) {
      // 404 (no application yet) is the expected "clean" case — show the form
      setExisting(null);
    } finally {
      setChecking(false);
    }
  }

  function goNext() {
    setError("");
    if (step === 0) {
      if (!shopInfo.phone.trim() || !shopInfo.shopname.trim()) {
        setError("Phone number and restaurant name are required.");
        return;
      }
      if (!/^\d{10}$/.test(shopInfo.phone.trim())) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
    }
    if (step === 1) {
      const { house, street, state, pincode, country } = address;
      if (!house.trim() || !street.trim() || !state.trim() || !pincode.trim() || !country.trim()) {
        setError("Please fill in all address fields.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setError("");
    if (files.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("phone", shopInfo.phone.trim());
      formData.append("shopname", shopInfo.shopname.trim());
      formData.append("address", JSON.stringify(address));
      files.forEach((file) => formData.append("documents", file));

      const res = await api.post("/seller/apply", formData);
      console.log(res);
      setResult(res.data?.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Reset all local state and drop back into a fresh application form.
  // Used when a rejected application clicks "Reapply".
  function handleReapply() {
    setResult(null);
    setExisting(null);
    setStep(0);
    setShopInfo(emptyShopInfo);
    setAddress(emptyAddress);
    setFiles([]);
    setError("");
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
    );
  }

  // Just submitted -> use the fresh result (always "pending" right after apply)
  if (result) {
    return (
      <StatusScreen
        status={result.status}
        shopname={result.shopname}
        onGoDashboard={() => navigate("/seller/dashboard")}
        onReapply={handleReapply}
      />
    );
  }

  // Already has an application from before -> show its current status
  if (existing) {
    return (
      <StatusScreen
        status={existing.status}
        shopname={existing.shopname}
        rejectionReason={existing.rejectionReason}
        onGoDashboard={() => navigate("/seller/dashboard")}
        onReapply={handleReapply}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
          <Store className="text-brand-600" size={26} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register Your Restaurant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in a few details to start selling on coder.op
        </p>
      </div>

      <StepIndicator step={step} />

      <div className="border rounded-2xl p-6 sm:p-8 mt-6">
        {step === 0 && <ShopInfoStep data={shopInfo} onChange={setShopInfo} />}
        {step === 1 && <AddressStep data={address} onChange={setAddress} />}
        {step === 2 && <DocumentsStep files={files} onChange={setFiles} />}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-5">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Step indicator ---------------------------- */

function StepIndicator({ step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                i < step
                  ? "bg-brand-600 text-white"
                  : i === step
                  ? "bg-brand-600 text-white ring-4 ring-brand-100"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? "bg-brand-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Step 1: Shop ----------------------------- */

function ShopInfoStep({ data, onChange }) {
  function update(field, value) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <Store size={18} className="text-brand-600" />
        Restaurant Information
      </h2>

      <FormField label="Restaurant Name">
        <input
          type="text"
          value={data.shopname}
          onChange={(e) => update("shopname", e.target.value)}
          placeholder="e.g. Sharma General Store"
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </FormField>

      <FormField label="Phone Number">
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </FormField>
    </div>
  );
}

/* ----------------------------- Step 2: Address --------------------------- */

function AddressStep({ data, onChange }) {
  function update(field, value) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <MapPin size={18} className="text-brand-600" />
        Restaurant Address
      </h2>

      <FormField label="House / Building No.">
        <input
          type="text"
          value={data.house}
          onChange={(e) => update("house", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </FormField>

      <FormField label="Street">
        <input
          type="text"
          value={data.street}
          onChange={(e) => update("street", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="State">
          <input
            type="text"
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </FormField>
        <FormField label="Pincode">
          <input
            type="text"
            inputMode="numeric"
            value={data.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </FormField>
      </div>

      <FormField label="Country">
        <input
          type="text"
          value={data.country}
          onChange={(e) => update("country", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </FormField>
    </div>
  );
}

/* --------------------------- Step 3: Documents ---------------------------- */

function DocumentsStep({ files, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(newFiles) {
    const incoming = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    onChange([...files, ...incoming].slice(0, 5));
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
        <FileText size={18} className="text-brand-600" />
        Verification Documents
      </h2>
      <p className="text-sm text-gray-500">
        Upload photos of restaurant license, ID proof, or any relevant verification document (up to 5 images).
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 cursor-pointer transition-colors ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400"
        }`}
      >
        <UploadCloud size={28} className="text-brand-500" />
        <p className="text-sm text-gray-600">
          <span className="text-brand-600 font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400">PNG, JPG up to 5 images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
          {files.map((file, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- shared --------------------------------- */

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

/* ------------------------------ Status screen ---------------------------- */

// Unified screen for pending / approved / reject — used both right after a
// fresh submit and when the user revisits this page with an existing application.
function StatusScreen({ status, shopname, rejectionReason, onGoDashboard, onReapply }) {
  if (status === "approved") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="text-green-600" size={30} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">You're Approved! 🎉</h1>
        <p className="text-sm text-gray-500 mb-6">
          {shopname ? `${shopname} is` : "Your shop is"} live. You can now start managing your products and orders.
        </p>
        <button
          onClick={onGoDashboard}
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
        >
          Go to Seller Dashboard
        </button>
      </div>
    );
  }

  if (status === "reject") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="text-red-500" size={30} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h1>
        <p className="text-sm text-gray-500 mb-4">
          Unfortunately, your seller application{shopname ? ` for ${shopname}` : ""} was not approved.
        </p>

        {rejectionReason && (
          <div className="border border-red-100 bg-red-50/60 rounded-xl p-4 text-left text-sm text-red-700 mb-6">
            <span className="font-medium">Reason: </span>
            {rejectionReason}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReapply}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
          >
            Reapply
          </button>
          
          <a href="/support"
            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-lg"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // pending (default)
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
        <Clock className="text-amber-500" size={30} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h1>
      <p className="text-sm text-gray-500 mb-6">
        Thanks for applying{shopname ? `, ${shopname}` : ""}! Your seller application is under review.
        We'll notify you once it's approved.
      </p>

      <div className="border rounded-xl p-4 text-left text-sm space-y-2 mb-8">
        {shopname && (
          <div className="flex justify-between">
            <span className="text-gray-500">Restaurant Name</span>
            <span className="font-medium text-gray-900">{shopname}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className="inline-flex items-center gap-1 font-medium text-amber-600 capitalize">
            <Clock size={13} />
            Pending
          </span>
        </div>
      </div>

      
        <a href="/"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
      >
        Back to Home
      </a>
    </div>
  );
}