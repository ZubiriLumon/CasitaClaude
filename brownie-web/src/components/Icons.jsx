/**
 * Hand-drawn line icon set.
 *
 * Every icon shares one geometry language so the app reads as drawn by one
 * hand: 24×24 box, 1.8 stroke, round caps and joins, currentColor, and paths
 * that lean slightly off-true rather than sitting on perfect geometry.
 */

function Icon({ children, size = 22, strokeWidth = 1.8, fill = 'none', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* ── Money & reporting ── */

export const IconCoins = p => (
  <Icon {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="2.8" />
    <path d="M3 7v4.2c0 1.5 2.7 2.8 6 2.8s6-1.3 6-2.8V7" />
    <path d="M15 11.4c2.9.3 6 1.5 6 3.1 0 1.6-2.7 2.8-6 2.8-1.3 0-2.5-.2-3.4-.5" />
    <path d="M9 17.6c-3.3 0-6-1.3-6-2.8" />
    <path d="M9 21c-3.3 0-6-1.3-6-2.8v-3.4" />
    <path d="M21 14.5v3.7c0 1.5-2.7 2.8-6 2.8-1.9 0-3.6-.4-4.7-1.1" />
  </Icon>
)

export const IconTrendUp = p => (
  <Icon {...p}>
    <path d="M3.2 16.9l5.6-5.9 4.1 3.7 7.3-8" />
    <path d="M14.6 6.4h5.9v5.7" />
  </Icon>
)

export const IconTrendDown = p => (
  <Icon {...p}>
    <path d="M3.2 7.1l5.6 5.9 4.1-3.7 7.3 8" />
    <path d="M14.6 17.6h5.9v-5.7" />
  </Icon>
)

export const IconCalculator = p => (
  <Icon {...p}>
    <path d="M5.4 3.2h13.2c.9 0 1.6.8 1.5 1.7l-1 15c-.1.8-.7 1.4-1.5 1.4H6.4c-.8 0-1.4-.6-1.5-1.4l-1-15c-.1-.9.6-1.7 1.5-1.7z" />
    <path d="M7.4 6.6h9.2v3.1H7.4z" />
    <path d="M8 13.2h.01M12 13.2h.01M16 13.2h.01M8 17h.01M12 17h.01M16 17h.01" strokeWidth="2.6" />
  </Icon>
)

export const IconPieSlice = p => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.9" />
    <path d="M12 3.1v8.9h8.9" />
  </Icon>
)

/* ── Commerce ── */

export const IconCart = p => (
  <Icon {...p}>
    <path d="M2.6 3.4h2.3c.5 0 .9.35 1 .84l.4 2.1" />
    <path d="M6.3 6.34h14.3l-1.7 7.2c-.12.5-.56.86-1.08.86H8.4c-.5 0-.94-.34-1.06-.83L6.3 6.34z" />
    <circle cx="9.4" cy="19" r="1.6" />
    <circle cx="17.6" cy="19" r="1.6" />
  </Icon>
)

export const IconBasket = p => (
  <Icon {...p}>
    <path d="M3 8.6h18l-1.8 9.6c-.15.8-.85 1.4-1.67 1.4H6.47c-.82 0-1.52-.6-1.67-1.4L3 8.6z" />
    <path d="M8.2 8.6L10.4 3.4M15.8 8.6L13.6 3.4" />
    <path d="M9 12.2l.5 4M15 12.2l-.5 4M12 12.2v4" strokeOpacity="0.45" />
  </Icon>
)

export const IconBox = p => (
  <Icon {...p}>
    <path d="M12 2.9l8.6 4.3v9.6L12 21.1 3.4 16.8V7.2L12 2.9z" />
    <path d="M3.4 7.2L12 11.5l8.6-4.3" />
    <path d="M12 11.5v9.6" />
    <path d="M7.7 5l8.6 4.3v3" strokeOpacity="0.4" />
  </Icon>
)

export const IconReceipt = p => (
  <Icon {...p}>
    <path d="M5.4 2.8h13.2v18.4l-2.2-1.5-2.2 1.5-2.2-1.5-2.2 1.5-2.2-1.5-2.2 1.5V2.8z" />
    <path d="M8.6 7.6h6.8M8.6 11.4h6.8M8.6 15.2h4.2" />
  </Icon>
)

export const IconTag = p => (
  <Icon {...p}>
    <path d="M11.2 2.9H20a1.1 1.1 0 011.1 1.1v8.8a1.6 1.6 0 01-.47 1.13l-7.4 7.4a1.5 1.5 0 01-2.12 0l-8.05-8.05a1.5 1.5 0 010-2.12l7.4-7.4a1.6 1.6 0 011.13-.47z" />
    <circle cx="16.6" cy="7.4" r="1.5" />
  </Icon>
)

/* ── Production ── */

export const IconChefHat = p => (
  <Icon {...p}>
    <path d="M6.2 13.4c-2 0-3.5-1.6-3.5-3.6 0-1.9 1.4-3.4 3.2-3.6.5-2 2.3-3.5 4.5-3.5 1.4 0 2.7.6 3.5 1.6a4 4 0 011.6-.3c2.2 0 4 1.7 4 3.9 0 .5-.1 1-.3 1.5 1.1.6 1.8 1.7 1.8 3 0 1.7-1.4 3-3.2 3H6.2z" />
    <path d="M6.6 13.4v5.4c0 1.1.9 2 2 2h6.8c1.1 0 2-.9 2-2v-5.4" />
    <path d="M9.6 16.8h4.8" strokeOpacity="0.45" />
  </Icon>
)

export const IconFlame = p => (
  <Icon {...p}>
    <path d="M12 2.6c.4 3-1.3 4.2-2.8 5.6C7.5 9.8 6 11.4 6 14.2A6 6 0 0018 14.4c0-3.4-2-5-3.4-7-.9-1.3-1.6-2.9-2.6-4.8z" />
    <path d="M12 20.5a2.9 2.9 0 01-2.9-2.9c0-1.6 1.3-2.4 2-3.6.6 1 2.2 1.9 2.6 3.2a2.9 2.9 0 01-1.7 3.3z" strokeOpacity="0.55" />
  </Icon>
)

export const IconClipboard = p => (
  <Icon {...p}>
    <path d="M9 3.8H7.2c-1 0-1.8.8-1.8 1.8v13.8c0 1 .8 1.8 1.8 1.8h9.6c1 0 1.8-.8 1.8-1.8V5.6c0-1-.8-1.8-1.8-1.8H15" />
    <path d="M9.4 2.4h5.2c.5 0 .9.4.9.9v1.5c0 .5-.4.9-.9.9H9.4a.9.9 0 01-.9-.9V3.3c0-.5.4-.9.9-.9z" />
    <path d="M8.6 11.2h6.8M8.6 15.4h4.6" />
  </Icon>
)

/* ── Status & feedback ── */

export const IconAlert = p => (
  <Icon {...p}>
    <path d="M10.3 3.5L2.5 17.2c-.7 1.2.2 2.7 1.6 2.7h15.8c1.4 0 2.3-1.5 1.6-2.7L13.7 3.5a2 2 0 00-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 16.6h.01" strokeWidth="2.6" />
  </Icon>
)

export const IconSparkle = p => (
  <Icon {...p}>
    <path d="M12 2.8c.6 4 2.6 6 6.6 6.6-4 .6-6 2.6-6.6 6.6-.6-4-2.6-6-6.6-6.6 4-.6 6-2.6 6.6-6.6z" />
    <path d="M18.4 15.6c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3z" />
  </Icon>
)

export const IconCrown = p => (
  <Icon {...p}>
    <path d="M3.2 7.6l3.2 3.1 3.2-5.4 2.4 4 2.4-4 3.2 5.4 3.2-3.1-1.7 11.2H4.9L3.2 7.6z" />
    <path d="M4.9 18.8h14.2" />
  </Icon>
)

export const IconCheck = p => (
  <Icon {...p}>
    <path d="M4.4 12.6l4.9 4.8L19.8 6.6" />
  </Icon>
)

export const IconPlus = p => (
  <Icon {...p}>
    <path d="M12 4.6v14.8M4.6 12h14.8" />
  </Icon>
)

export const IconRefresh = p => (
  <Icon {...p}>
    <path d="M20.6 11.4a8.7 8.7 0 00-15-4.6L2.9 9.4" />
    <path d="M2.6 4.4v5.2h5.2" />
    <path d="M3.4 12.6a8.7 8.7 0 0015 4.6l2.7-2.6" />
    <path d="M21.4 19.6v-5.2h-5.2" />
  </Icon>
)

export const IconPencil = p => (
  <Icon {...p}>
    <path d="M16.4 3.5a2.1 2.1 0 013 3L8.2 17.7l-4 1 1-4L16.4 3.5z" />
    <path d="M14.8 5.2l3 3" />
  </Icon>
)

export const IconTrash = p => (
  <Icon {...p}>
    <path d="M3.8 6.2h16.4" />
    <path d="M8.6 6.2V4.4c0-.8.7-1.5 1.5-1.5h3.8c.8 0 1.5.7 1.5 1.5v1.8" />
    <path d="M5.8 6.2l1 13.2c.06.9.8 1.6 1.7 1.6h7c.9 0 1.64-.7 1.7-1.6l1-13.2" />
    <path d="M10.2 10.4v6.4M13.8 10.4v6.4" strokeOpacity="0.5" />
  </Icon>
)

export const IconHome = p => (
  <Icon {...p}>
    <path d="M3.4 10.2L12 3.2l8.6 7v9.4c0 .8-.7 1.5-1.5 1.5H4.9c-.8 0-1.5-.7-1.5-1.5v-9.4z" />
    <path d="M9.2 20.9v-6.4h5.6v6.4" />
  </Icon>
)

export const IconChart = p => (
  <Icon {...p}>
    <path d="M3.4 20.6h17.2" />
    <path d="M6.6 20.6v-6.2M11 20.6V7.4M15.4 20.6v-9M19.8 20.6V4.2" />
  </Icon>
)
