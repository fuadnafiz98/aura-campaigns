import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
  className,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOnChange = (
    { target }: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { value } = target;
    const newOTP = [...otp];

    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    newOTP[index] = value.substring(value.length - 1);
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < length - 1) {
      setActiveOTPIndex(index + 1);
    }

    // Call onComplete when all fields are filled
    const otpValue = newOTP.join("");
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleOnKeyDown = (
    { key }: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (key === "Backspace") {
      const newOTP = [...otp];

      if (otp[index]) {
        // Clear current field if it has value
        newOTP[index] = "";
        setOtp(newOTP);
      } else if (index > 0) {
        // Move to previous field and clear it
        setActiveOTPIndex(index - 1);
        newOTP[index - 1] = "";
        setOtp(newOTP);
      }
    } else if (key === "ArrowLeft" && index > 0) {
      setActiveOTPIndex(index - 1);
    } else if (key === "ArrowRight" && index < length - 1) {
      setActiveOTPIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Only allow numeric paste
    if (!/^\d+$/.test(pastedData)) return;

    const newOTP = [...otp];
    const pastedDigits = pastedData.slice(0, length).split("");

    pastedDigits.forEach((digit, index) => {
      if (index < length) {
        newOTP[index] = digit;
      }
    });

    setOtp(newOTP);

    // Focus the next empty field or the last field
    const nextIndex = Math.min(pastedDigits.length, length - 1);
    setActiveOTPIndex(nextIndex);

    // Call onComplete if all fields are filled
    const otpValue = newOTP.join("");
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  useEffect(() => {
    inputRefs.current[activeOTPIndex]?.focus();
  }, [activeOTPIndex]);

  // Create hidden input for form submission
  const hiddenInputValue = otp.join("");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-center gap-2">
        {otp.map((_, index) => (
          <input
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            type="text"
            value={otp[index]}
            onChange={(e) => handleOnChange(e, index)}
            onKeyDown={(e) => handleOnKeyDown(e, index)}
            onPaste={handlePaste}
            onClick={() => setActiveOTPIndex(index)}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-xl font-semibold rounded-lg border-2 transition-colors",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              otp[index]
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-600",
              activeOTPIndex === index && "ring-2 ring-primary/20",
            )}
            maxLength={1}
            autoComplete="off"
          />
        ))}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name="code" value={hiddenInputValue} />
    </div>
  );
}
