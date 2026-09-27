export const createTypography = (surfaces) => ({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  allVariants: {
    color: surfaces.text.primary,
  },
  h1: { fontSize: "2.5rem", fontWeight: 500 },
  h2: { fontSize: "2rem", fontWeight: 500 },
  h3: { fontSize: "1.75rem", fontWeight: 500 },
  h4: { fontSize: "1.5rem", fontWeight: 500 },
  h5: { fontSize: "1.25rem", fontWeight: 500 },
  h6: { fontSize: "1rem", fontWeight: 500 },
  body1: { fontSize: "1rem" },
  body2: { fontSize: "0.875rem" },
  caption: { fontSize: "0.75rem", color: surfaces.text.secondary },
  subtitle1: { fontSize: "1rem", fontWeight: 500 },
  subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
});

export default createTypography;
