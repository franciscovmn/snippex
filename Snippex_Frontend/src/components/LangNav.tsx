import { useState } from "react";

type Lang = "pt" | "en" | "es";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "BR", label: "PT" },
  { code: "en", flag: "US", label: "EN" },
  { code: "es", flag: "ES", label: "ES" },
];

export function LangNav() {
  const [active, setActive] = useState<Lang>("pt");

  return (
    <nav className="lang-nav" aria-label="Selecionar idioma">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          className={`lang-nav__item${active === code ? " lang-nav__item--active" : ""}`}
          onClick={() => setActive(code)}
          aria-current={active === code ? "true" : undefined}
          lang={code}
          type="button"
        >
          <abbr title={flag}>{flag}</abbr> {label}
        </button>
      ))}
    </nav>
  );
}
