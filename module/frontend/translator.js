// should be called in the main.jsx of a react application using startTranslationObserver() or startTranslationObserver(server_url)

export default function startTranslationObserver(
  serverUrl = "http://127.0.0.1:8000",
  selectedPosition = "Bottom-Right", //posiiton should be one of "Bottom-Left", "Top-Left", "Top-Right", "Bottom-Right"
  languages //languages should be passed as an array of strings containing the codes that the user wants to support translation for within the iso 639.1 standard
) {
  const iso639_1_languageCodes = {
    "aa": "Afar", "ab": "Abkhazian", "ae": "Avestan", "af": "Afrikaans",
    "ak": "Akan", "am": "Amharic", "an": "Aragonese", "ar": "Arabic",
    "as": "Assamese", "av": "Avaric", "ay": "Aymara", "az": "Azerbaijani",
    "ba": "Bashkir", "be": "Belarusian", "bg": "Bulgarian", "bi": "Bislama",
    "bm": "Bambara", "bn": "Bengali", "bo": "Tibetan", "br": "Breton",
    "bs": "Bosnian", "ca": "Catalan", "ce": "Chechen", "ch": "Chamorro",
    "co": "Corsican", "cr": "Cree", "cs": "Czech", "cu": "Church Slavic",
    "cv": "Chuvash", "cy": "Welsh", "da": "Danish", "de": "German",
    "dv": "Divehi", "dz": "Dzongkha", "ee": "Ewe", "el": "Greek",
    "en": "English", "eo": "Esperanto", "es": "Spanish", "et": "Estonian",
    "eu": "Basque", "fa": "Persian", "ff": "Fulah", "fi": "Finnish",
    "fj": "Fijian", "fo": "Faroese", "fr": "French", "fy": "Western Frisian",
    "ga": "Irish", "gd": "Gaelic", "gl": "Galician", "gn": "Guarani",
    "gu": "Gujarati", "gv": "Manx", "ha": "Hausa", "he": "Hebrew",
    "hi": "Hindi", "ho": "Hiri Motu", "hr": "Croatian", "ht": "Haitian",
    "hu": "Hungarian", "hy": "Armenian", "hz": "Herero", "ia": "Interlingua",
    "id": "Indonesian", "ie": "Interlingue", "ig": "Igbo", "ii": "Sichuan Yi",
    "ik": "Inupiaq", "io": "Ido", "is": "Icelandic", "it": "Italian",
    "iu": "Inuktitut", "ja": "Japanese", "jv": "Javanese", "ka": "Georgian",
    "kg": "Kongo", "ki": "Kikuyu", "kj": "Kuanyama", "kk": "Kazakh",
    "kl": "Kalaallisut", "km": "Central Khmer", "kn": "Kannada", "ko": "Korean",
    "kr": "Kanuri", "ks": "Kashmiri", "ku": "Kurdish", "kv": "Komi",
    "kw": "Cornish", "ky": "Kirghiz", "la": "Latin", "lb": "Luxembourgish",
    "lg": "Ganda", "li": "Limburgan", "ln": "Lingala", "lo": "Lao",
    "lt": "Lithuanian", "lu": "Luba-Katanga", "lv": "Latvian", "mg": "Malagasy",
    "mh": "Marshallese", "mi": "Maori", "mk": "Macedonian", "ml": "Malayalam",
    "mn": "Mongolian", "mr": "Marathi", "ms": "Malay", "mt": "Maltese",
    "my": "Burmese", "na": "Nauru", "nb": "Bokmål, Norwegian", "nd": "Ndebele, North",
    "ne": "Nepali", "ng": "Ndonga", "nl": "Dutch", "nn": "Norwegian Nynorsk",
    "no": "Norwegian", "nr": "Ndebele, South", "nv": "Navajo", "ny": "Chichewa",
    "oc": "Occitan", "oj": "Ojibwa", "om": "Oromo", "or": "Oriya",
    "os": "Ossetian", "pa": "Panjabi", "pi": "Pali", "pl": "Polish",
    "ps": "Pushto", "pt": "Portuguese", "qu": "Quechua", "rm": "Romansh",
    "rn": "Rundi", "ro": "Romanian", "ru": "Russian", "rw": "Kinyarwanda",
    "sa": "Sanskrit", "sc": "Sardinian", "sd": "Sindhi", "se": "Northern Sami",
    "sg": "Sango", "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian",
    "sm": "Samoan", "sn": "Shona", "so": "Somali", "sq": "Albanian",
    "sr": "Serbian", "ss": "Swati", "st": "Sotho, Southern", "su": "Sundanese",
    "sv": "Swedish", "sw": "Swahili", "ta": "Tamil", "te": "Telugu",
    "tg": "Tajik", "th": "Thai", "ti": "Tigrinya", "tk": "Turkmen",
    "tl": "Tagalog", "tn": "Tswana", "to": "Tonga", "tr": "Turkish",
    "ts": "Tsonga", "tt": "Tatar", "tw": "Twi", "ty": "Tahitian",
    "ug": "Uighur", "uk": "Ukrainian", "ur": "Urdu", "uz": "Uzbek",
    "ve": "Venda", "vi": "Vietnamese", "vo": "Volapük", "wa": "Walloon",
    "wo": "Wolof", "xh": "Xhosa", "yi": "Yiddish", "yo": "Yoruba",
    "za": "Zhuang", "zh": "Chinese", "zu": "Zulu"
  }

  //if languages is passed it should be an array
  if (languages !== undefined && !Array.isArray(languages)) {
    throw new TypeError("languages must be an array of ISO639-1 codes");
  }

  const useTranslateMany = true;

  // MODULE SETUP
  const root = document.body;
  const temporarilyIgnoredNodes = new WeakSet();
  let activeTranslationCount = 0;
  let originalLang = document.documentElement.lang;
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

    const spinner = document.getElementById("module-language-spinner");
    const code = document.getElementById("module-language-code");
    //  show spinner and hide code when translating
    if (spinner && code) {
      spinner.style.display = isTranslating ? "block" : "none";
      code.style.display = isTranslating ? "none" : "block";
    }
    const wrapper = document.getElementById("injected-module-language-selector-wrapper");
    //  hide selector when translating so a new language cannot be selected before translation is finished
    if (wrapper) {
      wrapper.style.pointerEvents = isTranslating ? "none" : "auto";
    }
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
    let position;

    switch (selectedPosition) {
      case "Bottom-Left":
        position = "bottom: 20px; left: 20px;";
        break;
      case "Top-Left":
        position = "top: 20px; left: 20px;";
        break;
      case "Top-Right":
        position = "top: 20px; right: 20px;";
        break;
      case "Bottom-Right":
        position = "bottom: 20px; right: 20px;";
        break;
      default:
        position = "bottom: 20px; right: 20px;";
        break;
    }

    const html = `
    <div 
        id="injected-module-language-selector-wrapper"
        style="${position} position:fixed; z-index: 10000; cursor: pointer; font-family: sans-serif;"
      class="no-translate"
        onmouseenter="
          document.getElementById('module-language-selector-display').style.display='none'; 
          document.getElementById('module-language-selector-container').style.display='block';
        "
        onmouseleave="
          document.getElementById('module-language-selector-container').style.display='none'; 
          document.getElementById('module-language-selector-display').style.display='flex';
        "
    >
      <div 
        id="module-language-selector-display"
        class="no-translate"
        style="
          position: relative;
          background: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          width: 45px;
          height: 45px;
          font-size: 16px;
          user-select: none;
          display:flex;
          align-items:center;
          justify-content:center;
        "
      >
      <span id="module-language-code">${currentLang.toUpperCase()}</span>
      <div class="spinner-border" role="status" id="module-language-spinner" style="display:none; position: absolute; z-index:100000;">
        <span class="visually-hidden">Translating...</span>
      </div>
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
          width: 220px; 
          max-height: 268px; 
          overflow-y: auto; 
          overflow-x: hidden;
        "
      >
        <input id="module-language-search" type="text" placeholder="Search..." style="padding:4px; width:100%; margin-bottom:5px;"/>
        <div id="module-language-list"></div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML("beforeend", html);

    let supportedLanguages;
    //if languages is passed then filter the supported languages else keep them all
    if (languages && languages.length > 0) {
      supportedLanguages = Object.fromEntries(
        Object.entries(iso639_1_languageCodes).filter(entry => (languages.includes(entry[0]) || entry[0] === currentLang))
      );
    } else {
      supportedLanguages = iso639_1_languageCodes;
    }

    injectSelectOptionsHTML(supportedLanguages);
    setupSearch();
  }

  function injectSelectOptionsHTML(languages) {
    const container = document.getElementById("module-language-list");
    const searchInput = document.getElementById("module-language-search");
    const displayDiv = document.getElementById("module-language-selector-display");
    const langDisplay = document.getElementById("module-language-code");
    container.innerHTML = "";

    // sort languages so the originalLang is always first for easy access
    const sortedLanguages = Object.entries(languages).sort(([codeA], [codeB]) => {
      if (codeA === originalLang) return -1;
      if (codeB === originalLang) return 1;
      return languages[codeA].localeCompare(languages[codeB]); // alphabetical for the rest
    });

    for (const [code, name] of sortedLanguages) {
      const item = document.createElement("div");
      item.textContent = code === originalLang ? `${name} (Original)` : name;
      item.dataset.code = code;
      item.style.padding = "4px 8px";
      item.style.cursor = "pointer";
      if (code === currentLang) item.style.background = "#e0e0e0";

      //  on click set currentLang, isTranslating and translate
      item.addEventListener("click", async () => {
        searchInput.value = name;
        currentLang = code;
        document.getElementById("module-language-selector-container").style.display = "none";
        displayDiv.style.display = "flex";
        langDisplay.textContent = code.toUpperCase();

        if (currentLang === originalLang) {
          loadOriginalText();
        } else {
          if(useTranslateMany){
            await loadPageTranslated_translate_many();
          }else{
            await loadPageTranslated_translate_one();
          }
        }

        // Update highlight for selected language
        container.querySelectorAll('div').forEach(el => {
          el.style.background = el.dataset.code === currentLang ? "#e0e0e0" : "";
        });
      });

      container.appendChild(item);
    }

    // Set initial input and display
    searchInput.value = languages[currentLang] || currentLang;
    langDisplay.textContent = currentLang.toUpperCase();
  }


  function setupSearch() {
    const searchInput = document.getElementById("module-language-search");
    const container = document.getElementById("module-language-list");
    const items = Array.from(container.children);

    //  only show items that include input from user
    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();

      items.forEach(item => {
        item.hidden = !item.textContent.toLowerCase().includes(filter);
      });
    });
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
      if (!line.includes("->")) return Promise.resolve();

      const [indexOriginal, translatedText] = line.split("->");
      const originalText = textsToTranslate[parseInt(indexOriginal)];
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
