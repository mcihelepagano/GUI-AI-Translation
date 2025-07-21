
/*********************
* TO BE MODULARIZED  *
*********************/


const SERVER_URL = "http://127.0.0.1:8000";

function getAllTextNodesTreeWalker(rootElement) {
    const walker = document.createTreeWalker(
        rootElement, 
        NodeFilter.SHOW_TEXT,
        (node => {return node.nodeValue.trim().length>0 && node.parentElement.tagName !== "SCRIPT" && node.parentElement.tagName !== "STYLE"})
    );

    let node;
    let textNodes = [];

    while(node = walker.nextNode()) {
        textNodes.push(node);
    }

    return textNodes;
}

const temporarilyIgnoredNodes = new WeakSet();

async function translateTextNodeSafely(node) {
  // Temporarly add node to the modified list 
  temporarilyIgnoredNodes.add(node);
  await fetch(`${SERVER_URL}/translate?text=${encodeURIComponent(node.textContent)}&lang=Italiano`)
    .then(response => response.json())
    .then(data => {
      console.log(data.translation);
      node.textContent = data.translation;
    })
    .catch(err => {
      console.log("Error retreiving translation");
    });

  // After this task completes, allow observing again on the node added to the temporarly modified list
  Promise.resolve().then(() => {
    temporarilyIgnoredNodes.delete(node); // <-- this weakset cleanup is queued after the MutationObserver callback so that the change is not detected fo the same loop
  });
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    switch (mutation.type) {
      case 'childList':
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) { // <-- added nodes that are text nodes
            const parent = node.parentElement;
            if (!temporarilyIgnoredNodes.has(node)) {
              console.log("ADDED TEXT: ");
              console.log(parent);
              console.log(node.textContent);
              translateTextNodeSafely(node);
            }
          } else {
            const textNodeElements = API.getAllTextNodesTreeWalker(node); // <-- if the added node is not a text node find all children that are text nodes
            for (let textNode of textNodeElements) {
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

      case 'characterData':
        const parent = mutation.target.parentElement; // <-- modified text nodes
        if (!temporarilyIgnoredNodes.has(mutation.target)) {
          console.log("MODIFIED NODE: ");
          console.log(parent);
          translateTextNodeSafely(mutation.target);
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
  attributeFilter: ['data-i18n', 'data-i18n-vars'], // Only watch these attributes for performance
});
