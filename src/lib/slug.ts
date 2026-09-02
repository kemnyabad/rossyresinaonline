export const slugify = (value: string, fallback = "producto") =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || fallback;

export const uniqueSlug = async (
  base: string,
  checkTaken: (slug: string) => Promise<boolean>,
  fallback = "producto"
) => {
  const clean = slugify(base, fallback);
  if (!(await checkTaken(clean))) return clean;
  let i = 2;
  while (await checkTaken(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
};
