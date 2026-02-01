
/**
 * 
 * @param {*} parts 
 * @param {*} attachments 
 * @returns 
 * How it works:
 * - Recursively traverses the parts of an email message.
 * - Identifies parts that are attachments based on the presence of filename and attachmentId.
 * - Collects attachment metadata (attachmentId, filename, mimeType, size) into an array.
 * - If a part contains nested parts, the function calls itself recursively to extract attachments from those nested parts.
 *
 * Returns:
 * - An array of attachment metadata objects.
 */

export function extractAttachments(parts, attachments = []) {
    for (const part of parts) {
        if (part.filename && part.body && part.body.attachmentId) {
            attachments.push({
                attachmentId: part.body.attachmentId,
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body.size,
            });
        }
        if (part.parts && part.parts.length > 0) {
            extractAttachments(part.parts, attachments);
        }
    }
    return attachments;
}