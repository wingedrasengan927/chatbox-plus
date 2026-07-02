window.MathJax = {
  options: {
    enableMenu: false,
    menuOptions: {
      settings: {
        speech: false,
        braille: false,
        enrich: false,
        assistiveMml: false,
      },
    },
  },
  loader: {
    load: [],
  },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
  output: {
    displayOverflow: "linebreak",
    linebreaks: {
      inline: true,
      width: "100%",
      lineleading: 0.6,
    },
  },
  startup: {
    typeset: false,
  },
};

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (window.MathJax && MathJax.startup && MathJax.startup.document) {
      MathJax.startup.document.state(100);
      MathJax.startup.document.render();
    }
  }, 200); // 200ms debounce to prevent layout thrashing
});
