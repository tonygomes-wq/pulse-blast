export const Logo = ({ className, fill }: { className?: string; fill?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill={fill || "currentColor"}
  >
    <path d="M88.2,0H11.8C5.3,0,0,5.3,0,11.8v50.5C0,68.7,5.3,74,11.8,74h15.1v14.2c0,3.3,3.8,5.2,6.4,3.1l18.2-14.5  c1.2-0.9,2.8-1.5,4.4-1.5h32.3c6.5,0,11.8-5.3,11.8-11.8V11.8C100,5.3,94.7,0,88.2,0z" />
  </svg>
);