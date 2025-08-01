// should be called in the main.jsx of a react application using startTranslationObserver() or startTranslationObserver(server_url)

export function startTranslationObserver(serverUrl = "http://127.0.0.1:8000") {
  const temporarilyIgnoredNodes = new WeakSet();
  let activeTranslationCount = 0;
  let cycleStartTime = null;

  function getAllTextNodesTreeWalker(rootElement) {
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT,
      (node) => {
        return (
          node.nodeValue.trim().length > 0 &&
          node.parentElement.tagName !== "SCRIPT" &&
          node.parentElement.tagName !== "STYLE"
        );
      });
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }

  async function translateTextNodeSafely(node) {
    if (el.classList.contains("no-translate") || el.tagName === "SCRIPT" || el.tagName === "STYLE") return;

    // Temporarly add node to the modified list 
    temporarilyIgnoredNodes.add(node);

    if (activeTranslationCount === 0) {
      cycleStartTime = performance.now();
    }
    activeTranslationCount++;

    try {
      const response = await fetch(
        `${serverUrl}/translate-one?text=${encodeURIComponent(node.textContent)}&lang=fr`
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
  //loadPageTranslated_translate_one()




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

    translateWithStreaming(textsToTranslate, "eng", (line) => {
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

  loadPageTranslated_translate_many()


  async function translateWithStreaming(texts, lang, onLineReceived) {
    if (!texts || texts.length === 0) {
      console.error("No text provided for translation.");
      return Promise.resolve([]);;
    }

    const params = new URLSearchParams();
    texts.forEach(text => params.append("text", text));
    params.append("lang", lang);

    const url = `${serverUrl}/translate-many?${params.toString()}`;
    const promises = [];
    try {
      const response = await fetch(url);

      if (!response.body) {
        console.error("The response body is not a readable stream.");
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
