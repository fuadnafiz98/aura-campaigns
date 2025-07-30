export default function Avatar({ char }: { char?: string }) {
  return (
    <div className="relative flex shrink-0 overflow-hidden items-center justify-center h-[24px] w-[24px]">
      <div className="relative flex min-h-[24px] min-w-[24px] w-full h-full items-center justify-center text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          className="w-full h-full absolute top-0 left-0 saturate-150"
        >
          <g clipPath="url(#avatar-team-fallback-clip)">
            <rect width="20" height="20" fill="#151515" rx="5.5"></rect>
            <rect
              width="20"
              height="20"
              fill="url(#avatar-team-fallback-gradient)"
              fillOpacity="0.4"
              rx="5.5"
            ></rect>
            <g filter="url(#avatar-team-fallback-blur-1)" opacity="0.3">
              <circle
                cx="16"
                cy="17"
                r="6"
                fill="#575757"
                fillOpacity="0.8"
              ></circle>
            </g>
            <g filter="url(#avatar-team-fallback-blur-2)" opacity="0.2">
              <circle
                cx="16"
                cy="16"
                r="6"
                fill="#BBBBC0"
                fillOpacity="0.6"
              ></circle>
            </g>
            <g filter="url(#avatar-team-fallback-blur-3)" opacity="0.25">
              <circle
                cx="17"
                cy="19"
                r="6"
                fill="#575757"
                fillOpacity="0.7"
              ></circle>
            </g>
            <rect
              width="20"
              height="20"
              fill="url(#avatar-secondary-gradient)"
              fillOpacity="0.15"
              rx="5.5"
            ></rect>
            <g style={{ mixBlendMode: "hard-light" }}>
              <rect
                width="20"
                height="20"
                fill="#E3E3E5"
                fillOpacity="0.08"
                rx="5.5"
              ></rect>
            </g>
          </g>
          <rect
            width="19"
            height="19"
            x="0.5"
            y="0.5"
            stroke="url(#avatar-border-gradient)"
            strokeOpacity="0.5"
            rx="5"
          ></rect>
          <defs>
            <filter
              id="avatar-team-fallback-blur-1"
              width="32"
              height="32"
              x="0"
              y="1"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                result="effect1_foregroundBlur_5_17"
                stdDeviation="5"
              ></feGaussianBlur>
            </filter>
            <filter
              id="avatar-team-fallback-blur-2"
              width="22"
              height="22"
              x="5"
              y="5"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                result="effect1_foregroundBlur_5_17"
                stdDeviation="2.5"
              ></feGaussianBlur>
            </filter>
            <filter
              id="avatar-team-fallback-blur-3"
              width="22"
              height="22"
              x="6"
              y="8"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                result="effect1_foregroundBlur_5_17"
                stdDeviation="2.5"
              ></feGaussianBlur>
            </filter>
            <linearGradient
              id="avatar-team-fallback-gradient"
              x1="10"
              x2="10"
              y1="0"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#575757"></stop>
              <stop offset="1" stopColor="#151515" stopOpacity="0.4"></stop>
            </linearGradient>
            <linearGradient
              id="avatar-secondary-gradient"
              x1="0"
              x2="20"
              y1="0"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#E3E3E5"></stop>
              <stop offset="1" stopColor="#BBBBC0"></stop>
            </linearGradient>
            <linearGradient
              id="avatar-border-gradient"
              x1="0"
              x2="20"
              y1="0"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BBBBC0"></stop>
              <stop offset="1" stopColor="#575757"></stop>
            </linearGradient>
            <clipPath id="avatar-team-fallback-clip">
              <rect width="20" height="20" fill="#ffffff" rx="5.5"></rect>
            </clipPath>
          </defs>
        </svg>
        <span className="relative font-bold uppercase text-white z-[2] mt-[1px]">
          {char ? char : "L"}
        </span>
      </div>
    </div>
  );
}
