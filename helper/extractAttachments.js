

export function extractAttachments(parts = []) {
    let attachments = [];

    for (const part of parts) {  // Iterate through each part of the email
        if (part.filename && part.body?.attachmentId) {   // Check if the part is an attachment
            attachments.push({    // Store relevant attachment info
                filename: part.filename,
                attachmentId: part.body.attachmentId,
                mimeType: part.mimeType,
                size: part.body.size,
            });
        }

        if (part.parts) {
            attachments = attachments.concat(extractAttachments(part.parts));    // Recursively extract attachments from nested parts
        }
    }
    return attachments;
}