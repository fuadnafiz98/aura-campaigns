import * as React from "react";

const Plane = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <title>{"paper-plane"}</title>
    <g fill="none">
      <path
        fill="url(#a)"
        d="M21.678 4.185c.368-1.148-.716-2.231-1.863-1.863L2.277 7.96c-1.222.392-1.396 2.044-.293 2.689l7.18 4.187 2.094 3.59 10.42-14.24Z"
        data-glass="origin"
        mask="url(#b)"
      />
      <path
        fill="url(#a)"
        d="M21.678 4.185c.368-1.148-.716-2.231-1.863-1.863L2.277 7.96c-1.222.392-1.396 2.044-.293 2.689l7.18 4.187 2.094 3.59 10.42-14.24Z"
        clipPath="url(#d)"
        data-glass="clone"
        filter="url(#c)"
      />
      <path
        fill="url(#e)"
        d="m16.04 21.723 5.638-17.538a1.464 1.464 0 0 0-.375-1.512L9.164 14.835l4.188 7.179c.644 1.11 2.297.927 2.688-.291Z"
        data-glass="blur"
      />
      <path
        fill="url(#f)"
        d="M21.304 2.673c.376.368.56.932.374 1.511L16.04 21.722c-.391 1.218-2.044 1.401-2.688.291l-4.188-7.179 12.14-12.16ZM10.103 14.956l3.896 6.68.001.001a.73.73 0 0 0 1.326-.144l5.58-17.36-10.803 10.823Z"
      />
      <defs>
        <linearGradient
          id="a"
          x1={11.501}
          x2={11.501}
          y1={2.249}
          y2={18.424}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#575757" />
          <stop offset={1} stopColor="#151515" />
        </linearGradient>
        <linearGradient
          id="e"
          x1={15.458}
          x2={15.458}
          y1={2.673}
          y2={22.75}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3E3E5" stopOpacity={0.6} />
          <stop offset={1} stopColor="#BBBBC0" stopOpacity={0.6} />
        </linearGradient>
        <linearGradient
          id="f"
          x1={15.457}
          x2={15.457}
          y1={2.673}
          y2={14.3}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset={1} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id="d">
          <path
            fill="url(#e)"
            d="m16.04 21.723 5.638-17.538a1.464 1.464 0 0 0-.375-1.512L9.164 14.835l4.188 7.179c.644 1.11 2.297.927 2.688-.291Z"
          />
        </clipPath>
        <filter
          id="c"
          width="400%"
          height="400%"
          x="-100%"
          y="-100%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
        >
          <feGaussianBlur
            width="100%"
            height="100%"
            x="0%"
            y="0%"
            in="SourceGraphic"
            result="blur"
            stdDeviation={2}
          />
        </filter>
        <mask id="b">
          <rect width="100%" height="100%" fill="#FFF" />
          <path
            fill="#000"
            d="m16.04 21.723 5.638-17.538a1.464 1.464 0 0 0-.375-1.512L9.164 14.835l4.188 7.179c.644 1.11 2.297.927 2.688-.291Z"
          />
        </mask>
      </defs>
    </g>
  </svg>
);
export default Plane;
