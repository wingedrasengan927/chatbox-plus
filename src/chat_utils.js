import { clearEditor, getEditorMarkdown } from "./lexical_utils.js";

// Self-contained function to be executed in the target tab
function injectTextIntoChat(text) {
  const insertIntoContentEditable = (element, textToInsert) => {
    element.focus();
    const selection = window.getSelection();
    if (selection) {
      selection.selectAllChildren(element);
      selection.collapseToEnd();
    }
    const finalContent =
      (element.textContent.trim() ? "\n\n" : "") + textToInsert;
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", finalContent);
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });
    if (element.dispatchEvent(pasteEvent)) {
      document.execCommand("insertText", false, finalContent);
    }
  };

  const chatgptHandler = (text) => {
    const chatgptInput = document.querySelector("#prompt-textarea");
    if (chatgptInput) {
      if (
        chatgptInput.getAttribute("contenteditable") === "true" ||
        chatgptInput.tagName !== "TEXTAREA"
      ) {
        insertIntoContentEditable(chatgptInput, text);
        return { success: true };
      } else {
        chatgptInput.value = chatgptInput.value
          ? chatgptInput.value + "\n\n" + text
          : text;
        chatgptInput.dispatchEvent(new Event("input", { bubbles: true }));
        return { success: true };
      }
    }

    // Fallback for any standard textarea on the page
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.value = textarea.value ? textarea.value + "\n\n" + text : text;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      return { success: true };
    }

    return { success: false, error: "Input area not found on ChatGPT." };
  };

  const handlers = {
    "aistudio.google.com": (text) => {
      const textarea = document.querySelector(
        'textarea[formcontrolname="promptText"]',
      );
      if (textarea) {
        textarea.value = textarea.value ? textarea.value + "\n\n" + text : text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return { success: true };
      }
      return { success: false, error: "Textarea not found on AI Studio." };
    },
    "gemini.google.com": (text) => {
      // Gemini uses a rich-textarea element with a contenteditable div
      const richEditor = document.querySelector(
        'rich-textarea div[contenteditable="true"]',
      );
      if (richEditor) {
        insertIntoContentEditable(richEditor, text);
        return { success: true };
      }

      // Fallback for any standard textarea on the page
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = textarea.value ? textarea.value + "\n\n" + text : text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return { success: true };
      }

      return { success: false, error: "Input area not found on Gemini." };
    },
    "chatgpt.com": chatgptHandler,
    "chat.openai.com": chatgptHandler,
    "claude.ai": (text) => {
      // Claude uses a contenteditable div (ProseMirror-based editor)
      const claudeInput = document.querySelector('div[contenteditable="true"]');
      if (claudeInput) {
        insertIntoContentEditable(claudeInput, text);
        return { success: true };
      }

      // Fallback for any standard textarea on the page
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = textarea.value ? textarea.value + "\n\n" + text : text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return { success: true };
      }

      return { success: false, error: "Input area not found on Claude." };
    },
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
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injectTextIntoChat,
        args: [markdown],
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
