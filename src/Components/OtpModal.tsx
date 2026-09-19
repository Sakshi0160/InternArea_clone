import React, { useEffect, useState } from "react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  onVerify,
}) => {
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (isOpen) {
      setOtp("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl sm:p-6">

        {/* Heading */}
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Email Verification
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
          Enter the OTP sent to your email.
        </p>

        {/* OTP Input */}
        <div className="mt-5">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

              setOtp(value);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.3em] text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-300 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              console.log("Verify button clicked");
              onVerify(otp);
            }}
            disabled={otp.length !== 6}
            className={`w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition sm:w-auto ${
              otp.length === 6
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-blue-300"
            }`}
          >
            Verify OTP
          </button>

        </div>
      </div>
    </div>
  );
};

export default OtpModal;