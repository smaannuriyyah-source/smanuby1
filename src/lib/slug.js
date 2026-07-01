/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending number if conflict
 */
export async function generateUniqueSlug(db, baseName, existingId = null) {
  let slug = generateSlug(baseName);
  if (!slug) slug = 'laporan';

  const checkSlug = async (s) => {
    const result = await db.execute({
      sql: 'SELECT id FROM data_laporan WHERE slug = ?',
      args: [s]
    });
    if (result.rows.length === 0) return true;
    // If updating same item, allow same slug
    if (existingId && result.rows[0].id === existingId) return true;
    return false;
  };

  let uniqueSlug = slug;
  let counter = 1;

  while (!(await checkSlug(uniqueSlug))) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
