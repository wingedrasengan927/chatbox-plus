import { $getRoot } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $convertToMarkdownString } from "@lexical/markdown";
import {
  initializeEditor,
  MEDIUM_TRANSFORMERS,
  MARKDOWN_PASTE_COMMAND
} from "lexical-medium-editor-js";

export function clearEditor(editor) {
  editor.update(() => {
    const root = $getRoot();
    root.clear();
  });
}

export function getEditorMarkdown(editor) {
  let markdown = "";
  let unescapedMarkdown = ""
  editor.read(() => {
    markdown = $convertToMarkdownString(MEDIUM_TRANSFORMERS);
    unescapedMarkdown = unescapeMarkdown(markdown);
  });
  return unescapedMarkdown;
}

// Reverses the character escaping that @lexical/markdown applies on export.
// It only strips a backslash when it precedes a markdown special char it
// would have escaped, so legitimate text is preserved.
function unescapeMarkdown(markdown) {
  const lines = markdown.split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(/\\([*_`~\\])/g, "$1");
    })
    .join("\n");
}

// Self-contained function to be executed in the target tab
function injectTextIntoChat(text) {
  const handlers = {
    "aistudio.google.com": (text) => {
      const textarea = document.querySelector('textarea[formcontrolname="promptText"]');
      if (textarea) {
        textarea.value = textarea.value ? textarea.value + '\n\n' + text : text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return { success: true };
      }
      return { success: false, error: "Textarea not found on AI Studio." };
    },
    "gemini.google.com": (text) => {
      // Gemini uses a rich-textarea element with a contenteditable div
      const richEditor = document.querySelector('rich-textarea div[contenteditable="true"]');
      if (richEditor) {
        richEditor.focus();
        // Move cursor to the end
        const selection = window.getSelection();
        if (selection) {
          selection.selectAllChildren(richEditor);
          selection.collapseToEnd();
        }
        // Insert the text using document.execCommand to trigger framework event listeners
        document.execCommand('insertText', false, (richEditor.textContent.trim() ? '\n\n' : '') + text);
        return { success: true };
      }
      
      // Fallback for any standard textarea on the page
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = textarea.value ? textarea.value + '\n\n' + text : text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return { success: true };
      }
      
      return { success: false, error: "Input area not found on Gemini." };
    }
  };

  const hostname = window.location.hostname;
  for (const [domain, handler] of Object.entries(handlers)) {
    if (hostname.includes(domain)) {
      return handler(text);
    }
  }
  return { success: false, error: "Website not supported." };
}

export async function addToChat(editor) {
  const markdown = getEditorMarkdown(editor);
  if (!markdown.trim()) return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injectTextIntoChat,
        args: [markdown]
      });

      const response = results[0]?.result;
      if (response && response.success) {
        clearEditor(editor);
      } else {
        const errMsg = response?.error || "Unknown error";
        console.error("Failed to add to chat:", errMsg);
        alert("Could not add to chat: " + errMsg);
      }
    }
  } catch (error) {
    console.error("Error sending message to tab:", error);
    alert("Error communicating with tab: " + error.message);
  }
}

export async function pasteMarkdown(editor) {
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (!clipboardText) return;

    const syntheticEvent = {
      preventDefault: () => {},
      clipboardData: {
        getData: () => clipboardText,
      },
    };

    editor.dispatchCommand(MARKDOWN_PASTE_COMMAND, syntheticEvent);
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}
