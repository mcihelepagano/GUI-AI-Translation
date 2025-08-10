// should be called in the main.jsx of a react application using startTranslationObserver() or startTranslationObserver(server_url)

export function startTranslationObserver(serverUrl = "http://127.0.0.1:8000") {
  const temporarilyIgnoredNodes = new WeakSet();
  let activeTranslationCount = 0;
  let cycleStartTime = null;
  let originalLang = document.documentElement.lang;
  if (!originalLang) {
    originalLang = (navigator.language || navigator.userLanguage).split('-')[0]; // default browser language
  }
  let currentLang = originalLang;

  injectLanguageDropdown();

  function injectLanguageDropdown() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "10000";
    container.style.backgroundColor = "#fff";
    container.style.border = "1px solid #ccc";
    container.style.borderRadius = "8px";
    container.style.padding = "10px";
    container.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    container.style.fontFamily = "sans-serif";
    container.classList.add("no-translate");

    const label = document.createElement("label");
    label.textContent = "Language:";
    label.style.marginRight = "8px";
    label.htmlFor = "language-selector";

    const select = document.createElement("select");
    select.id = "language-selector";
    select.style.padding = "4px";

    const languages = {
      fr: "Français",
      en: "English",
      es: "Español",
      de: "Deutsch",
      it: "Italiano",
      pt: "Português",
      zh: "中文",
      ja: "日本語",
      ru: "Русский",
    };

    for (const [code, name] of Object.entries(languages)) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      if (code === originalLang) {
        option.selected = true;
        option.textContent = name + " (Original)";
      }
      select.appendChild(option);
    }

    select.addEventListener("change", (e) => {
      currentLang = e.target.value;
      console.log(`Language changed to: ${currentLang}`);
      if (currentLang == originalLang) {
        location.reload();                // Non so se questo reload si può fare, perchè come dicevo se fai il reaload di una pagina si possono perdere le modifiche fatte dall'utente
        return;
      }

      loadPageTranslated_translate_many();
    });

    container.appendChild(label);
    container.appendChild(select);
    document.body.appendChild(container);
  }


  function getAllTextNodesTreeWalker(rootElement) {
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT,
      (node) => {
        return (
          node.nodeValue.trim().length > 0 &&
          node.parentElement.tagName !== "SCRIPT" &&
          node.parentElement.tagName !== "STYLE" &&
          !findNoTranslateParent(node) // <-- check if the parent has the no-translate class
        );
      });
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }

  function findNoTranslateParent(node) {
    let current = node;

    while (current) {
      if (
        current.classList &&
        current.classList.contains('no-translate')
      ) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  async function translateTextNodeSafely(node) {
    const found = findNoTranslateParent(node);
    if (found || node.parentElement.tagName === "SCRIPT" || node.parentElement.tagName === "STYLE") return;

    // Temporarly add node to the modified list 
    temporarilyIgnoredNodes.add(node);

    if (activeTranslationCount === 0) {
      cycleStartTime = performance.now();
    }
    activeTranslationCount++;

    try {
      const response = await fetch(
        `${serverUrl}/translate-one?text=${encodeURIComponent(node.textContent)}&lang=${encodeURIComponent(currentLang)}`
      );
      const data = await response.json();
      console.log(data.translation);
      node.textContent = data.translation;
    } catch (err) {
      console.log("Error retrieving translation", err);
    }

    // After this task completes, allow observing again on the node added to the temporarly modified list
    Promise.resolve().then(() => {
      temporarilyIgnoredNodes.delete(node); // <-- this weakset cleanup is queued after the MutationObserver callback so that the change is not detected fo the same loop
      activeTranslationCount--;

      if (activeTranslationCount === 0 && cycleStartTime !== null) {
        const duration = performance.now() - cycleStartTime;
        console.log(`Translation cycle complete in ${duration} ms`);
        cycleStartTime = null;
      }
    });
  }

  const observer = new MutationObserver((mutations) => {
    if (currentLang == originalLang) {
      return;
    }
    mutations.forEach((mutation) => {
      switch (mutation.type) {

        case "childList":
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) { // <-- added nodes that are text nodes
              if (!temporarilyIgnoredNodes.has(node)) {
                console.log("ADDED TEXT: ");
                console.log(node.parentElement);
                console.log(node.textContent);
                translateTextNodeSafely(node);
              }
            } else { // <-- if the added node is not a text node find all children that are text nodes
              const textNodes = getAllTextNodesTreeWalker(node);
              for (let textNode of textNodes) {
                if (!temporarilyIgnoredNodes.has(textNode)) {
                  console.log("ADDED TEXT TO CHILDREN: ");
                  console.log(textNode.parentElement);
                  console.log(textNode.textContent);
                  translateTextNodeSafely(textNode);
                }
              }
            }
          });
          break;

        case "characterData": // <-- modified text nodes
          const node = mutation.target;
          if (!temporarilyIgnoredNodes.has(node)) {
            console.log("MODIFIED NODE: ");
            console.log(node.parentElement);
            translateTextNodeSafely(node);
          }
          break;
      }
    });
  });


  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-i18n", "data-i18n-vars"],
  });



  // ON LOADING


  function loadPageTranslated_translate_one() {
    const initTextNodes = getAllTextNodesTreeWalker(document.body);
    for (let textNode of initTextNodes) {
      if (!temporarilyIgnoredNodes.has(textNode)) {
        console.log("ADDED TEXT TO CHILDREN: ");
        console.log(textNode.parentElement);
        console.log(textNode.textContent);
        translateTextNodeSafely(textNode);
      }
    }
  }




  function loadPageTranslated_translate_many() {
    const originalTextToNodesMap = new Map();
    const textsToTranslate = [];

    const initTextNodes = getAllTextNodesTreeWalker(document.body);

    for (let textNode of initTextNodes) {
      if (!temporarilyIgnoredNodes.has(textNode)) {
        const originalText = textNode.textContent;

        if (!originalTextToNodesMap.has(originalText)) {
          originalTextToNodesMap.set(originalText, []);
          textsToTranslate.push(originalText);
        }

        originalTextToNodesMap.get(originalText).push(textNode);
      }
    }

    translateWithStreaming(textsToTranslate, currentLang, (line) => {
      if (!line.includes(" ===== ")) return Promise.resolve();

      const [originalText, translatedText] = line.split(" ===== ");
      const nodes = originalTextToNodesMap.get(originalText);

      if (nodes && nodes.length > 0) {
        nodes.forEach(textNode => {
          if (textNode.textContent === originalText) {
            textNode.textContent = translatedText;
          }
        });
      } else {
        console.warn("Text nodes not found for original text:", originalText);
      }

      return Promise.resolve();
    });
  }


  async function translateWithStreaming(texts, lang, onLineReceived) {
    if (!texts || texts.length === 0) {
      console.error("No text provided for translation.");
      return Promise.resolve([]);;
    }

    const promises = [];
    try {

      const params = new URLSearchParams();
      params.append("lang", lang);
      const url = `${serverUrl}/translate-many?${params.toString()}`;
      const body = {
        texts: texts
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.body) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}: ${errorText}`);
        return Promise.reject(new Error("Response body is not a readable stream."));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Process any remaining text in the buffer
          if (buffer) {
            promises.push(onLineReceived(buffer));
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.substring(0, newlineIndex);
          promises.push(onLineReceived(line));
          buffer = buffer.substring(newlineIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error during streaming translation:", error);
      return Promise.reject(error);
    }
    return Promise.all(promises);
  }
}
