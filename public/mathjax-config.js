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
    ready() {
      MathJax.startup.defaultReady();
      const font = MathJax.startup.document.outputJax.font;
      if (font) {
        const dynamicFiles = font.dynamicFiles || (font.constructor && font.constructor.dynamicFiles);
        if (dynamicFiles) {
          // Disable all dynamic font loading from CDN to comply with Content Security Policy
          for (const key of Object.keys(dynamicFiles)) {
            delete dynamicFiles[key];
          }
        }
      }
    }
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
