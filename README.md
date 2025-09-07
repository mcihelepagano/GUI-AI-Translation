<a id="readme-top"></a>
<!-- PROJECT -->
<br>
<div align="center">

  <h3 align="center">Real-Time Translation Module</h3>

  <br>

  <p align="center">
    A JavaScript module for real-time translation of text nodes in web applications
  </p>
</div>
<br>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#basic-integration">Basic Integration</a></li>
        <li><a href="#advanced-configuration">Advanced Configuration</a></li>
        <li><a href="#excluding-elements-from-translation">Excluding Elements from Translation</a></li>
        <li><a href="#supported-languages">Supported Languages</a></li>
      </ul>
    </li>
    <li>
      <a href="#test-web-application">Test Web Application</a>
      <ul>
        <li><a href="#test-application-features">Test Application Features</a></li>
        <li><a href="#running-the-test-application">Running the Test Application</a></li>
      </ul>
    </li>
    <li>
      <a href="#api-reference">API Reference</a>
      <ul>
        <li><a href="#frontend-api">Frontend API</a></li>
        <li><a href="#backend-api">Backend API</a></li>
      </ul>
    </li>
    <li>
      <a href="#translation-performance--accuracy">Translation Performance & Accuracy</a>
      <ul>
        <li><a href="#model-comparison-results">Model Comparison Results</a></li>
        <li><a href="#framework-comparison-ollama-vs-hugging-face">Framework Comparison: Ollama vs Hugging Face</a></li>
        <li><a href="#testing-scripts">Testing Scripts</a></li>
      </ul>  
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This Real-Time Translation Module is a JavaScript library that enables seamless, real-time translation of web page content without requiring page reloads or manual content replacement. It automatically detects and translates text nodes in the DOM while preserving the original formatting and structure of the web application.

This module is perfect for:
* Multi-language web applications that need dynamic content translation
* E-commerce sites serving international customers
* Content management systems with multi-language support
* Any web application requiring on-the-fly language switching

The module uses AI-powered translation through Ollama models, providing high-quality translations while maintaining good performance through intelligent caching and batch processing.

### Built With

This project is built using modern web technologies and AI translation capabilities:

* [![JavaScript][JavaScript.com]][JavaScript-url]
* [![React][React.js]][React-url]
* [![Python][Python.com]][Python-url]
* [![FastAPI][FastAPI.com]][FastAPI-url]
* [![Ollama][Ollama.com]][Ollama-url]

### Features

* **Real-time Translation**: Instantly translate web page content without page reloads
* **DOM Mutation Observation**: Automatically detects and translates new content as it's added to the page
* **Intelligent Caching**: Reduces Ollama API calls by caching previously translated content
* **Batch Translation**: Optimizes performance by processing multiple text elements simultaneously
* **Language Selector UI**: Built-in floating language selector with search functionality
* **Customizable Positioning**: Position the language selector in any corner of the screen
* **Format Preservation**: Maintains original text formatting, spacing, and punctuation
* **Selective Translation**: Exclude specific elements using CSS classes
* **Stream Processing**: Real-time streaming for large content translation

<!-- GETTING STARTED -->
## Getting Started

To get the translation module running in your project, follow these steps:

### Prerequisites

The project was tested with:

* **Node.js** (for frontend integration)
  ```sh
  node v22.14.0
  ```

* **Python 3.13.3** (for backend server)
  ```sh
  python 3.13.3
  ```

Additionally, you'll need Ollama and an Ollama LLM model:

* **Ollama** (for AI translation models)
  ```sh
  # Install Ollama from https://ollama.ai
  # Pull a translation model
  ollama pull gemma3:latest
  ```

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/mcihelepagano/GUI-AI-Translation.git
   cd module
   ```

2. **Set up the backend server**
   ```sh
   cd backend
   pip install fastapi ollama tiktoken uvicorn
   ```

3. **Configure the translation model**
   ```python
   # Edit app_conf.py
   model_name = "gemma3:latest"  # or your preferred Ollama model
   ```

4. **Start the translation server**
   ```sh
   python start.py
   ```

5. **Integrate the frontend module**
   
   For React applications:
   ```javascript
   // main.jsx
   import startTranslationObserver from './path/to/translator.js'
   
   startTranslationObserver("http://127.0.0.1:8000", "Bottom-Right", ["en", "fr", "es"]);
   ```
   
   For vanilla HTML:
   ```html
   <script type="module">
     import startTranslationObserver from './translator.js';
     startTranslationObserver("http://127.0.0.1:8000", "Bottom-Left", ["en", "fr"]);
   </script>
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

### Basic Integration

The simplest way to add translation to your web application:

```javascript
import startTranslationObserver from './translator.js';

// Start with default settings
startTranslationObserver();
```

### Advanced Configuration

```javascript
startTranslationObserver(
  "http://127.0.0.1:8000",           // Backend server URL
  "Top-Right",                       // UI position: "Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"
  ["en", "fr", "es", "de", "it"]     // Languages you want to support in your web app (ISO 639-1 codes)
);
```

### Excluding Elements from Translation

Add the `no-translate` class to parent elements so that their children will not be translated:

```html
<div class="no-translate">
  This content will not be translated
</div>

<script>
  // Script tags are automatically excluded (no class needed)
</script>

<style>
  /* Styles tags are automatically excluded (no class needed) */
</style>
```

### Supported Languages

The module supports translation to languages following the ISO 639-1 standard. Common ISO 639-1 codes include:

| Code | Language | Code | Language |
|------|----------|------|----------|
| en   | English  | fr   | French   |
| es   | Spanish  | de   | German   |
| it   | Italian  | pt   | Portuguese |
| zh   | Chinese  | ja   | Japanese |
| ru   | Russian  | ar   | Arabic   |

<!-- TEST WEB APPLICATION -->
## Test Web Application

The repository includes a complete React web application built with Bootstrap that serves as a demonstration and testing environment for the translation module. This test application is located in the `web-app` folder and provides a real-world example of how the translation module integrates with a multi-page React application.

### Test Application Features

The test web app implements three main pages to showcase different types of content translation:

- **Home Page**: Features dynamic content, interactive elements, and various text components to demonstrate real-time translation capabilities
- **Article Page**: Contains long-form text content, perfect for testing translation performance with substantial amounts of text
- **Company Page**: Includes structured content like company information, team details, and contact information to test translation accuracy with business content

### Running the Test Application

1. **Navigate to the web app directory**
   ```sh
   cd testing_web-app
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the test application**
   ```sh
   npm run dev
   ```

4. **Ensure the translation backend is running**
   ```sh
   # In the module/backend directory
   python start.py
   ```

The test application will automatically initialize the translation module and provide an environment to test the translation module, including DOM mutation observation, language switching, and performance with different types of content.

<!-- API REFERENCE -->
## API Reference

### Frontend API

#### `startTranslationObserver(serverUrl, position, languages)`

Initializes the translation module and starts observing DOM changes.

**Parameters:**
- `serverUrl` (string, optional): Backend server URL. Default: `"http://127.0.0.1:8000"`
- `position` (string, optional): UI position. Options: `"Top-Left"`, `"Top-Right"`, `"Bottom-Left"`, `"Bottom-Right"`. Default: `"Bottom-Right"`
- `languages` (array, optional): Array of ISO 639-1 language codes to support. If not provided, all languages are available.

**Example:**
```javascript
startTranslationObserver("http://localhost:8000", "Top-Left", ["en", "fr", "es"]);
```

### Backend API

#### `GET /translate-one`

Translates a single text string.

**Query Parameters:**
- `text` (string, required): Text to translate
- `lang` (string, required): Target language code

**Response:**
```json
{
  "translation": "Translated text"
}
```

#### `POST /translate-many`

Translates multiple text strings with streaming response.

**Query Parameters:**
- `lang` (string, required): Target language code

**Request Body:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"]
}
```

**Response:** Streaming text with format `index->translation`

## Translation Performance & Accuracy

We conducted comprehensive testing to evaluate different LLM models for translation quality and performance. The testing used the Europarl parallel corpus with 1000 sentences, measuring BLEU scores and processing time. The results are summarized in the related [md file](./llm_testing\overall_results.md) and they are also reported down below.

### Model Comparison Results

#### English to Italian (en-it)
| Model                | BLEU Score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 19.73      | 15 m 2 s     |
| gemma3:4b            | 19.69      | 10 m 57 s    |
| nous-hermes2:10.7b   | 17.30      | 36 m 4 s     |
| llama3.2:3b          | 14.80      | 9 m 47 s     |
| mistral:7b           | 10.17      | 26 m 5 s     |

#### English to French (en-fr)  
| Model                | BLEU Score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 28.96      | 12 m 17 s    |
| gemma3:4b            | 28.90      | 10 m 44 s    |
| nous-hermes2:10.7b   | 27.48      | 25 m 1 s     |
| llama3.2:3b          | 23.18      | 9 m 11 s     |
| mistral:7b           | 23.04      | 24 m 34 s    |

#### English to German (en-de)
| Model                | BLEU Score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 17.18      | 11 m 46 s    |
| gemma3:4b            | 17.18      | 10 m 15 s    |
| nous-hermes2:10.7b   | 16.97      | 30 m 34 s    |
| llama3.2:3b          | 12.87      | 9 m 27 s     |
| mistral:7b           | 13.00      | 27 m 45 s    |

### Framework Comparison: Ollama vs Hugging Face

We tested both Ollama and Hugging Face Transformers using TinyLlama-1.1B-Chat-v0.6 with fp16 (models in these two frameworks are not exactly the same):

| Framework    | Language | BLEU Score | Time Taken |
|--------------|----------|------------|------------|
| **Ollama**   | Italian  | 3.47       | 12 m 35 s  |
|              | French   | 6.47       | 10 m 59 s  |
|              | German   | 3.08       | 10 m 42 s  |
| **HuggingFace** | Italian  | 5.41       | 15 m 49 s  |
|              | French   | 10.90      | 15 m 14 s  |
|              | German   | 5.30       | 15 m 24 s  |

**Why We Chose Ollama:** Despite slightly lower BLEU scores with smaller models, Ollama provides faster response times and significantly easier deployment and integration, making it ideal for real-time web applications.

### Testing Scripts

The repository includes comprehensive testing scripts:

- **Ollama Testing**: [`llm_testing/ollama_testing/bleu_score.py`](./llm_testing/ollama_testing/bleu_score.py)
- **Hugging Face Testing**: [`llm_testing/huggingface_testing/bleu_score.py`](./llm_testing/huggingface_testing/bleu_score.py)
- **Complete Results**: [`llm_testing/overall_results.md`](./llm_testing/overall_results.md)

the actual translations generated by the various models are also available in the directories [`llm_testing/ollama_testing/results`](./llm_testing/ollama_testing/results) and [`llm_testing/huggingface_testing/results`](./llm_testing/huggingface_testing/results) 

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot]: images/screenshot.png
[JavaScript.com]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Python.com]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://python.org/
[FastAPI.com]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com/
[Ollama.com]: https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white
[Ollama-url]: https://ollama.ai/