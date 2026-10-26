// One small line-icon set (24px grid, 1.75 stroke) so every glyph on the page matches.

function Icon({ size = 18, children, ...rest }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Scissors = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
  </Icon>
);

export const ArrowUpRight = (p) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
);

export const CornerDownRight = (p) => (
  <Icon {...p}>
    <path d="M15 10l5 5-5 5" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </Icon>
);

export const Speaker = (p) => (
  <Icon {...p}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </Icon>
);

export const SpeakerOff = (p) => (
  <Icon {...p}>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </Icon>
);

export const Sun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const Moon = (p) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);

export const Revive = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Icon>
);

export const Expand = (p) => (
  <Icon {...p}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </Icon>
);

export const Printer = (p) => (
  <Icon {...p}>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v8H6z" />
  </Icon>
);

export const Flame = (p) => (
  <Icon {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.6 1.4 2.8 2.5 2.8z" />
  </Icon>
);

export const Phone = (p) => (
  <Icon {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </Icon>
);

export const Monitor = (p) => (
  <Icon {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
);

export const Close = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);
