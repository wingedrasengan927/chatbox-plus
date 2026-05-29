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
      inlineMath: [["$", "$"], ["\\(", "\\)"]],
      displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    },
    chtml: {
      displayOverflow: "scroll",
      linebreaks: { inline: true },
    },
    startup: {
      typeset: false,
    },
  };