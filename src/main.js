import "lexical-medium-editor-js/style.css";
import "./style.css";
import { clearEditor, addToChat } from "./utils.js";
import { initializeEditor } from "lexical-medium-editor-js";

const editorRef = document.getElementById("lexical-editor");
const editor = initializeEditor(editorRef, undefined, {
  isHeadingOneFirst: true,
  fontSize: "medium",
  disableImage: true,
});

document
  .getElementById("footer-clear")
  .addEventListener("click", () => clearEditor(editor));

document
  .getElementById("footer-add-to-chat")
  .addEventListener("click", () => addToChat(editor));
