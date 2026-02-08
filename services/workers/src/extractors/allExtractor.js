import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

/**
 * 
 * @param {*} attachmentId 
 * @returns 
 */

export async function extractPdf(attachmentId) {
    const data = await pdfParse(attachmentId);
    return {
        text: data.text,
        info: data.info,
        metadata: data.metadata,
        numpages: data.numpages,
        numrender: data.numrender,
        version: data.version,
    };
}

export async function extractDocx(attachmentId) {
    const result = await mammoth.extractRawText({ buffer: attachmentId });
    return {
        text: result.value,
        messages: result.messages,
    };
}

export async function extractImage(attachmentId) {
    const data = await Tesseract.recognize(attachmentId, 'eng');
    return {
        text: data.text,
        confidence: data.confidence,
        words: data.words,
    };
}