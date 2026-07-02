import 'lexical-medium-editor-js/style.css';
import "./style.css";
import { clearEditor, pasteMarkdown } from "./lexical_utils.js";
import { addToChat } from "./chat_utils.js";
import { initializeEditor } from "lexical-medium-editor-js";

const editorRef = document.getElementById("lexical-editor");
const editor = initializeEditor(editorRef);

document
  .getElementById("footer-clear")
  .addEventListener("click", () => clearEditor(editor));

document
  .getElementById("footer-paste-markdown")
  .addEventListener("click", () => pasteMarkdown(editor));

document
  .getElementById("footer-add-to-chat")
  .addEventListener("click", () => addToChat(editor));
