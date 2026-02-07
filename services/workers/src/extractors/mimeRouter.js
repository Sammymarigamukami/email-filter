export function resolveExtracter(mimeType) {
    if (!mimeType) {
        throw new Error('MIME type is required to resolve extractor');
    }

    if (mimeType === 'application/pdf') {
        return "pdf";
    }

    if (mimeType === "application/msword" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return "docx";
    }

    if (mimeType.startsWith("image/")) {
        return "image";
    }

    throw new Error(`No extractor found for MIME type: ${mimeType}`);
}