import { CLEAR_EDITOR_COMMAND } from "lexical";
import { $convertToMarkdownString, $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import {
  HR_TRANSFORMER,
  IMAGE_TRANSFORMER,
  MATH_INLINE_TRANSFORMER,
  MATH_BLOCK_SINGLE_LINE_TRANSFORMER,
  MATH_BLOCK_MULTILINE_TRANSFORMER,
} from "lexical-medium-editor-js";

export function clearEditor(editor) {
  editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
}

export function getEditorMarkdown(editor) {
  let markdown = "";
  editor.read(() => {
    markdown = $convertToMarkdownString([
      HR_TRANSFORMER,
      MATH_INLINE_TRANSFORMER,
      MATH_BLOCK_SINGLE_LINE_TRANSFORMER,
      MATH_BLOCK_MULTILINE_TRANSFORMER,
      IMAGE_TRANSFORMER,
      ...TRANSFORMERS,
    ]);
  });
  return markdown;
}

export async function pasteMarkdown(editor) {
  try {
    const markdown = await navigator.clipboard.readText();
    // Sanitize linebreaks
    const sanitizedMarkdown = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    editor.update(() => {
      // Note: This replaces all existing editor content
      $convertFromMarkdownString(sanitizedMarkdown, [
        HR_TRANSFORMER,
        MATH_INLINE_TRANSFORMER,
        MATH_BLOCK_SINGLE_LINE_TRANSFORMER,
        MATH_BLOCK_MULTILINE_TRANSFORMER,
        IMAGE_TRANSFORMER,
        ...TRANSFORMERS,
      ]);
    });
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}
