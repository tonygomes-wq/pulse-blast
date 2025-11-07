export const Logo = ({ className, fill }: { className?: string; fill?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill={fill || "currentColor"}
  >
    <path d="M50 0C22.4 0 0 22.4 0 50C0 62 4.7 72.8 12.3 79.9L5.4 94.6L20.1 87.7C27.2 95.3 38 100 50 100C77.6 100 100 77.6 100 50S77.6 0 50 0Z" />
  </svg>
);