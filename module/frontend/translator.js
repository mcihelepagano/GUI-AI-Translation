// should be called in the main.jsx of a react application using startTranslationObserver() or startTranslationObserver(server_url)

export default function startTranslationObserver(
  serverUrl = "http://127.0.0.1:8000",
  languageCodes = ['fr', 'en', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru'],
  selectPosition = "position: fixed; bottom: 20px; right: 20px;",
) {

  // MODULE SETUP
  const root = document.body;
  const temporarilyIgnoredNodes = new WeakSet();
  let activeTranslationCount = 0;
  let originalLang = document.documentElement.lang;
  if (!originalLang) {
    originalLang = (navigator.language || navigator.userLanguage).split('-')[0]; // default browser language
  }
  let currentLang = originalLang;

  function evalShouldTranslate() {
    return currentLang !== originalLang;
  }


  const textNodeToStringAll = new Map();   // TextNode => string content all page
  const stringToTextNodes = new Map();  // string content => [TextNodes]

  let isDomChanging = true;
  function waitForDomStable() {
    return new Promise((resolve) => {
      function checkDom() {
        if (!isDomChanging) {
          resolve();
        } else {
          console.log("Waiting for DOM changes to finish...");
          setTimeout(checkDom, 100);
        }
      }
      checkDom();
    });
  }


  let isTranslating = false;

  function setIsTranslating(value) {
    isTranslating = value;
    document.getElementById("module-language-selector").disabled = value;
  }

  document.addEventListener("DOMContentLoaded", () => {
    addTextNodes(root, evalShouldTranslate());
    injectSelectHTML();

    isDomChanging = false;
    console.log("Initial scan complete. Observing for changes...");
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-i18n", "data-i18n-vars"],
    });
  });


  // MODULE HTML INJECTION

  function injectSelectHTML() {
    const html = `
      <div 
        id="injected-module-language-selector-wrapper"
        style="${selectPosition} z-index: 10000; cursor: pointer; font-family: sans-serif;"
        class="no-translate"
        onmouseenter="
          document.getElementById('module-language-selector-display').style.display='none'; 
          document.getElementById('module-language-selector-container').style.display='block';
        "
        onmouseleave="
          document.getElementById('module-language-selector-container').style.display='none'; 
          document.getElementById('module-language-selector-display').style.display='block';
        "
      >
        <div 
          id="module-language-selector-display"
          class="no-translate" 
          style="
            background: white; 
            border: 1px solid #ccc; 
            border-radius: 8px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.2); 
            width: 40px; 
            height: 40px; 
            line-height: 40px; 
            font-size: 20px; 
            text-align: center;
            user-select: none;
          "
        >
          🌐
        </div>
        <div 
          id="module-language-selector-container"
          class="no-translate" 
          style="
            display: none;
            background: white; 
            border: 1px solid #ccc; 
            border-radius: 8px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            padding: 10px;
            white-space: nowrap;
          "
        >
          <label for="module-language-selector" style="margin-right: 8px;">Language:</label>
          <select id="module-language-selector" style="padding: 4px;"></select>
        </div>
      </div>
      `;
    document.body.insertAdjacentHTML("beforeend", html);

    injectSelectOptionsHTML();

    document.getElementById("module-language-selector").addEventListener("change", async (e) => {
      currentLang = e.target.value;
      console.log(`Language changed to: ${currentLang}`);
      if (currentLang === originalLang) {
        loadOriginalText();
      } else {
        await loadPageTranslated_translate_one();

        injectSelectOptionsHTML();
      }
    });
  }

  function injectSelectOptionsHTML() {
    const displayNames = new Intl.DisplayNames([currentLang], { type: 'language' });

    const languages = {};
    for (const code of languageCodes) {
      languages[code] = displayNames.of(code);
    }
    let optionsHTML = "";
    for (const [code, name] of Object.entries(languages)) {
      let text = name;
      let selected = "";
      if (code === originalLang) {
        text += " (Original)";
      }
      if (code === currentLang) {
        selected = " selected";
      }
      optionsHTML += `<option value="${code}"${selected}>${text}</option>`;
    }

    document.getElementById("module-language-selector").innerHTML = optionsHTML;
  }


  function isTranslateIgnore(node) {
    if (!node.parentElement) return false;
    if (node.tagName === "SCRIPT" || node.tagName === "STYLE") return true;
    let current = node;
    while (current) {
      if (
        current.classList &&
        current.classList.contains("no-translate")
      ) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  // Add a text node to both maps if not ignored 
  function addTextNodes(node, shouldTranslate) {
    if (isTranslateIgnore(node)) return;
    if (node.nodeType !== Node.TEXT_NODE) {
      node.childNodes.forEach(child => addTextNodes(child, shouldTranslate));
    }

    const text = node.nodeValue;
    if (!text || text.trim().length === 0) return;

    textNodeToStringAll.set(node, text);
    if (shouldTranslate) {
      translateTextNodeSafely(node);
    }

    if (!stringToTextNodes.has(text)) {
      stringToTextNodes.set(text, []);
    }
    stringToTextNodes.get(text).push(node);
  }

  // Remove a text node from both maps
  function removeTextNodes(node) {
    if (isTranslateIgnore(node)) return;
    if (node.nodeType !== Node.TEXT_NODE) {
      node.childNodes.forEach(removeTextNodes);
    }

    const oldText = textNodeToStringAll.get(node);
    textNodeToStringAll.delete(node);

    if (oldText !== undefined) {
      const arr = stringToTextNodes.get(oldText);
      if (arr) {
        const index = arr.indexOf(node);
        if (index > -1) {
          arr.splice(index, 1);
          if (arr.length === 0) {
            stringToTextNodes.delete(oldText);
          }
        }
      }
    }
  }


  // Update a text node's string content in both maps
  function updateTextNode(node, newText, shouldTranslate) {
    if (temporarilyIgnoredNodes.has(node)) {
      temporarilyIgnoredNodes.delete(node);
      return;
    }

    if (node.nodeType !== Node.TEXT_NODE) return;
    if (isTranslateIgnore(node)) return;

    const oldText = textNodeToStringAll.get(node);
    if (oldText === newText) return; // no change

    // Remove from old stringToTextNodes entry
    if (oldText !== undefined) {
      const oldArr = stringToTextNodes.get(oldText);
      if (oldArr) {
        const index = oldArr.indexOf(node);
        if (index > -1) {
          oldArr.splice(index, 1);
          if (oldArr.length === 0) {
            stringToTextNodes.delete(oldText);
          }
        }
      }
    }

    // Add to new stringToTextNodes entry
    if (!stringToTextNodes.has(newText)) {
      stringToTextNodes.set(newText, []);
    }
    stringToTextNodes.get(newText).push(node);

    // Update map with new text
    textNodeToStringAll.set(node, newText);
    if (shouldTranslate)
      translateTextNodeSafely(node)
  }

  const observer = new MutationObserver(mutations => {
    let shouldTranslate = evalShouldTranslate();
    isDomChanging = true;
    mutations.forEach(mutation => {
      switch (mutation.type) {

        case "childList":
          mutation.addedNodes.forEach(node => {
            if (!temporarilyIgnoredNodes.has(node)) {
              addTextNodes(node, shouldTranslate);
            }
          });
          mutation.removedNodes.forEach(node => {
            if (!temporarilyIgnoredNodes.has(node)) {
              removeTextNodes(node);
            }
          });
          break;

        case "characterData":
          if (!temporarilyIgnoredNodes.has(mutation.target)) {
            updateTextNode(mutation.target, mutation.target.nodeValue, shouldTranslate);
          }
          break;
      }
    });

    isDomChanging = false;
    console.log(`Found ${textNodeToStringAll.size} text nodes.`, textNodeToStringAll);
  });




  async function loadOriginalText() {
    setIsTranslating(true);
    await waitForDomStable();
    textNodeToStringAll.forEach((text, node) => {
      temporarilyIgnoredNodes.add(node);
      node.nodeValue = text;
      Promise.resolve().then( () => {
        temporarilyIgnoredNodes.delete(node); // <-- this weakset cleanup is queued after the MutationObserver callback is queued so that the change is not detected fo the same loop
      });
    });
    setIsTranslating(false);
  }

  function loadPageTranslated_translate_one() {
    const initTextNodes = getAllTextNodesTreeWalker(document.body);
    for (let textNode of initTextNodes) {
      if (!temporarilyIgnoredNodes.has(textNode)) {
        translateTextNodeSafely(textNode);
      }
    }
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
        current.classList.contains("no-translate")
      ) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }


  async function loadPageTranslated_translate_many() {
    setIsTranslating(true);
    const textsToTranslate = Array.from(stringToTextNodes.keys());

    const ret = await translateWithStreaming(textsToTranslate, currentLang, (line) => {
      if (!line.includes(" ===== ")) return Promise.resolve();

      const [originalText, translatedText] = line.split(" ===== ");
      const nodes = stringToTextNodes.get(originalText);

      if (nodes && nodes.length > 0) {
        nodes.forEach(textNode => {
          if (textNode.textContent === originalText) {
            temporarilyIgnoredNodes.add(textNode);
            textNode.textContent = translatedText;
          }
        });
      } else {
        console.warn("Text nodes not found for original text:", originalText);
      }

      return Promise.resolve();
    });

    setIsTranslating(false);
    return ret;
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

  async function translateTextNodeSafely(node) {
    temporarilyIgnoredNodes.add(node);
    if (activeTranslationCount === 0) {
      setIsTranslating(true);
    }
    activeTranslationCount++;
    const originalText = textNodeToStringAll.get(node);
    try {
      const response = await fetch(
        `${serverUrl}/translate-one?text=${encodeURIComponent(originalText)}&lang=${encodeURIComponent(currentLang)}`
      );
      const data = await response.json();
      node.textContent = data.translation;
    } catch (err) {
      console.log("Error retrieving translation", err);
    }

    // After this task completes, allow observing again on the node added to the temporarly modified list
    Promise.resolve().then( () => {
      temporarilyIgnoredNodes.delete(node); // <-- this weakset cleanup is queued after the MutationObserver callback is queued so that the change is not detected fo the same loop
      activeTranslationCount--;

      if (activeTranslationCount === 0) {
        setIsTranslating(false);
        console.log("<<<<<<<<<<<<<<<<<<<Translation Completed>>>>>>>>>>>>>>>>>>>>")
      }
    });
  }


}
