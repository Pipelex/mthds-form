/**
 * A story's stand-in for a host's upload: the picked or dropped file becomes
 * a local `blob:` link, where a real upload becomes a stored reference, and
 * the value written is the `{ url, filename }` a file field holds
 * (docs/upload-seam.md). The link is never revoked: a story's page is
 * short-lived, and the file card may still be showing it.
 */
export function standInUpload(file: File): { url: string; filename: string } {
  return { url: URL.createObjectURL(file), filename: file.name };
}
