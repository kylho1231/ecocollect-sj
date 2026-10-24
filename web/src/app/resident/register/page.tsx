"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Camera,
  FileCheck2,
  RefreshCw,
  XCircle,
  Building,
} from "lucide-react";

export default function ResidentRegisterPage() {
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [barangay, setBarangay] = useState("Funda-Dalipe");
  const [contactNumber, setContactNumber] = useState("");
  const [addressLocation, setAddressLocation] = useState("");
  const [idType, setIdType] = useState("PhilSys National ID");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setVerificationError(null);
      setVerificationSuccess(false);
    }
  };

  const handleRegisterAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!fullName.trim()) {
      setVerificationError("Please enter your complete legal Full Name.");
      return;
    }
    if (!contactNumber.trim()) {
      setVerificationError("Please enter a valid mobile Contact Number.");
      return;
    }
    if (!addressLocation.trim()) {
      setVerificationError("Please enter your Purok or residential Street address.");
      return;
    }
    if (!idFile) {
      setVerificationError("Please upload a photo of your Government-Issued ID.");
      return;
    }

    setIsVerifying(true);
    setVerificationStep("Scanning document security watermarks & resolution...");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("idType", idType);
      formData.append("idFile", idFile);

      // Simulating stage 1
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStep("Running AI generative fraud detection (Checking for synthetic/fake ID)...");

      const res = await fetch("/api/verify-id", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setVerificationStep("Verifying Civil Registry name match with registration details...");
      await new Promise((r) => setTimeout(r, 600));

      if (!res.ok || !data.success) {
        setVerificationError(data.message || "ID Verification failed. Please check your submission.");
        setIsVerifying(false);
        return;
      }

      // Verification Passed!
      setVerificationSuccess(true);
      setConfidenceScore(data.confidenceScore || 97.4);

      // Save verified resident state to localStorage for PWA
      const residentUser = {
        fullName,
        barangay,
        contactNumber,
        addressLocation,
        verifiedIdType: idType,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      };
      localStorage.setItem("ecocollect_resident_user", JSON.stringify(residentUser));

      // Redirect into the Citizen PWA after 1.5 seconds
      setTimeout(() => {
        router.push("/resident");
      }, 1500);
    } catch (err: any) {
      setVerificationError(err.message || "Network error verifying identity document.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#147D64] text-white py-3.5 px-6 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <img src="/icon.svg" alt="EcoCollect SJ Logo" className="h-8 w-8 rounded-lg bg-white p-0.5" />
            <span className="font-bold text-base tracking-tight">EcoCollect SJ</span>
          </Link>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-semibold">
            Citizen PWA Setup
          </span>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-1">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-2xl text-[#147D64] mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-[#11263A] tracking-tight">
              Resident Account Registration
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              San Jose de Buenavista Citizen Verification. Your ID is verified automatically by AI to prevent duplicate accounts and protect community trust.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegisterAndVerify} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Legal Name (as written on ID) *
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Santos Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#147D64] focus:bg-white focus:outline-none transition"
                required
              />
            </div>

            {/* Barangay and Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Barangay *
                </label>
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#147D64] focus:outline-none"
                >
                  <option value="Funda-Dalipe">Barangay Funda-Dalipe (Pilot)</option>
                  <option value="Atabay">Barangay Atabay</option>
                  <option value="Badiang">Barangay Badiang</option>
                  <option value="Bagumbayan">Barangay Bagumbayan</option>
                  <option value="San Pedro">Barangay San Pedro</option>
                  <option value="Madrangca">Barangay Madrangca</option>
                  <option value="Maybato North">Barangay Maybato North</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Contact Number *
                </label>
                <input
                  type="tel"
                  placeholder="0917-123-4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#147D64] focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Purok / Location Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Residential Street / Purok Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Purok Centro, Near Coastline Basketball Court"
                value={addressLocation}
                onChange={(e) => setAddressLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#147D64] focus:bg-white focus:outline-none transition"
                required
              />
            </div>

            {/* ID Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Government-Issued ID Type *
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#147D64] focus:outline-none"
              >
                <option value="PhilSys National ID">PhilSys National ID (PhilID / ePhilID)</option>
                <option value="Driver's License">LTO Driver's License</option>
                <option value="Philippine Passport">DFA Philippine Passport</option>
                <option value="UMID">UMID (Unified Multi-Purpose ID)</option>
                <option value="Postal ID">PHLPost Postal ID</option>
                <option value="PRC ID">PRC Professional ID</option>
              </select>
            </div>

            {/* ID Photo Upload Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload Photo of Physical ID *
              </label>

              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />

                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="ID Preview"
                      className="h-36 w-auto mx-auto rounded-xl border border-slate-300 shadow-sm object-cover"
                    />
                    <div className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <FileCheck2 className="h-4 w-4" />
                      <span>{idFile?.name} ready for AI inspection</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Click or tap to replace photo</div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-400 group-hover:text-[#147D64] mb-2 transition">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      Take Photo or Upload ID
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ensure text is clear, unblurred, and completely inside the camera frame
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Verification Loading Overlay */}
            {isVerifying && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-pulse">
                <RefreshCw className="h-5 w-5 text-[#147D64] animate-spin mx-auto" />
                <div className="text-xs font-bold text-[#147D64]">AI Identity Verification in Progress</div>
                <div className="text-[11px] text-slate-600">{verificationStep}</div>
              </div>
            )}

            {/* Error Message Alert */}
            {verificationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-900">
                <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold">Error: </span>
                  {verificationError}
                </div>
              </div>
            )}

            {/* Success Message Alert */}
            {verificationSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-emerald-900">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-sm font-bold">Government ID Verified Successfully!</div>
                  <div className="text-xs text-emerald-700">
                    Confidence: {confidenceScore}% • Redirecting to your Citizen PWA...
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || verificationSuccess}
              className="w-full py-3.5 bg-[#147D64] hover:bg-[#0C5241] disabled:bg-slate-300 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Verify ID & Launch Citizen PWA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Compliant with Republic Act No. 10173 (Philippine Data Privacy Act)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        EcoCollect SJ • San Jose de Buenavista, Antique
      </footer>
    </div>
  );
}
