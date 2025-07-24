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
    // Temporarly add node to the modified list 
    temporarilyIgnoredNodes.add(node);

    if (activeTranslationCount === 0) {
      cycleStartTime = performance.now();
    }
    activeTranslationCount++;

    try {
      const response = await fetch(
        `${serverUrl}/translate?text=${encodeURIComponent(node.textContent)}&lang=fr`
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
