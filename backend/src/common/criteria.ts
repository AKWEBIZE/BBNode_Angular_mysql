/**
 * Java: core/product/utils/CriteriaUtils.
 *
 * Prisma's `contains` interpolates the search text into a LIKE pattern without
 * escaping, so `%` or `_` typed by a user would act as wildcards. MySQL treats
 * backslash as the default LIKE escape character even with no ESCAPE clause,
 * so pre-escaping here restores the Java behaviour.
 *
 * Note: this relies on backslash escaping, which the NO_BACKSLASH_ESCAPES
 * sql_mode disables. Hostinger's MySQL does not set it by default.
 */
const ESCAPE_CHAR = '\\';

export function escapeForLike(input: string): string;
export function escapeForLike(input: null | undefined): null;
export function escapeForLike(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  return input
    .split('\\')
    .join(`${ESCAPE_CHAR}${ESCAPE_CHAR}`) // backslash first, or it would double-escape the rest
    .split('_')
    .join(`${ESCAPE_CHAR}_`)
    .split('%')
    .join(`${ESCAPE_CHAR}%`);
}

/** Java: CriteriaUtils.formatSearchText — escapes backslash and underscore only. */
export function formatSearchText(searchText: string): string {
  return searchText
    .split('\\')
    .join('\\\\')
    .split('_')
    .join('\\_');
}

/** Java used Objects.toString(x, "").equals("") to decide whether a filter applies. */
export function isBlank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value === '';
}
