import { Link } from 'react-router-dom';

type SnippexLogoProps = {
  to?: string;
  showText?: boolean;
  className?: string;
};

function SnippexLogoMark() {
  return (
    <svg
      className="logo__icon"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="3.5"
        width="18"
        height="21"
        rx="4"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M9 10.25L6.75 12.5L9 14.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.25 17.75H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5H18.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11 20.5H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.62"
      />
    </svg>
  );
}

export function SnippexLogo({ to = '/', showText = true, className = '' }: SnippexLogoProps) {
  const content = (
    <>
      <SnippexLogoMark />
      {showText && <span className="logo__text">snippex</span>}
    </>
  );

  const logoClassName = `logo ${className}`.trim();

  if (!to) {
    return (
      <span className={logoClassName} aria-label="Snippex">
        {content}
      </span>
    );
  }

  return (
    <Link to={to} className={logoClassName} aria-label="Snippex — página inicial">
      {content}
    </Link>
  );
}
