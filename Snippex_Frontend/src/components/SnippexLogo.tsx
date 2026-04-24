export function SnippexLogo() {
  return (
    <a href="/" className="logo" aria-label="Snippex — página inicial">
      <svg
        className="logo__icon"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 14L10 8L4 2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 22H24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="logo__text">snippex</span>
    </a>
  );
}
