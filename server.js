const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration
const INPUT_FOLDER = 'input';
const OUTPUT_FOLDER = 'output';
const PROMPT_FILE = 'prompt.txt';
const CHUNK_SIZE = 50;

// Ensure folders exist
async function ensureFolders() {
  try {
    await fs.mkdir(INPUT_FOLDER, { recursive: true });
    await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
  } catch (error) {
    console.error('Error creating folders:', error);
  }
}

// Read prompt file
async function readPrompt() {
  try {
    const promptPath = path.join(__dirname, PROMPT_FILE);
    const prompt = await fs.readFile(promptPath, 'utf8');
    return prompt.trim();
  } catch (error) {
    console.error('Error reading prompt file:', error);
    return 'Translate the following text to English:';
  }
}

// Split text into chunks
function splitIntoChunks(text, chunkSize) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const chunks = [];
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize).join('\n'));
  }
  
  return chunks;
}

// Translate chunk using OpenAI
async function translateChunk(text, prompt) {
  try {
    const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: prompt
              },
              {
                role: "user",
                content: text
              }
            ],
            temperature: 0.7,
        });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error translating chunk:', error);
    return text; // Return original text if translation fails
  }
}

// Process all text files in input folder
async function processInputFiles() {
  try {
    const files = await fs.readdir(INPUT_FOLDER);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
      console.log('No .txt files found in input folder');
      return;
    }

    const prompt = await readPrompt();
    
    for (const file of txtFiles) {
      console.log(`Processing file: ${file}`);
      
      // Read input file
      const inputPath = path.join(INPUT_FOLDER, file);
      const content = await fs.readFile(inputPath, 'utf8');
      
      // Split into lines
      const lines = content.split('\n').filter(line => line.trim() !== '');
      console.log(`Processing ${lines.length} lines`);
      
      // Translate each line
      const translatedLines = [];
      for (let i = 0; i < lines.length; i++) {
        console.log(`Translating line ${i + 1}/${lines.length}`);
        const translatedLine = await translateChunk(lines[i], prompt);
        translatedLines.push(translatedLine);
        
        // Add delay to avoid rate limiting if needed
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Combine translated lines
      const translatedText = translatedLines.join('\n');
      
      // Save to output folder
      const outputPath = path.join(OUTPUT_FOLDER, `exported_${file}`);
      await fs.writeFile(outputPath, translatedText, 'utf8');
      
      console.log(`Translation completed: ${outputPath}`);
    }
    
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Translation Module API',
    endpoints: {
      '/process': 'Process all .txt files in input folder',
      '/status': 'Get processing status'
    }
  });
});

app.post('/process', async (req, res) => {
  try {
    console.log('Starting translation process...');
    
    // Start processing in background
    processInputFiles().then(() => {
      console.log('Translation process completed');
    }).catch(error => {
      console.error('Translation process failed:', error);
    });
    
    res.json({ 
      message: 'Translation process started',
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/status', async (req, res) => {
  try {
    const inputFiles = await fs.readdir(INPUT_FOLDER);
    const outputFiles = await fs.readdir(OUTPUT_FOLDER);
    
    res.json({
      inputFiles: inputFiles.filter(f => f.endsWith('.txt')),
      outputFiles: outputFiles.filter(f => f.endsWith('.txt')),
      inputFolder: INPUT_FOLDER,
      outputFolder: OUTPUT_FOLDER
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await ensureFolders();
  
  app.listen(PORT, () => {
    console.log(`Translation server running on port ${PORT}`);
    console.log(`Input folder: ${INPUT_FOLDER}`);
    console.log(`Output folder: ${OUTPUT_FOLDER}`);
    console.log(`Prompt file: ${PROMPT_FILE}`);
    console.log(`Chunk size: ${CHUNK_SIZE} lines`);
    
    // Automatically start translation process when server starts
    console.log('\nStarting translation process automatically...');
    processInputFiles().then(() => {
      console.log('Translation process completed');
    }).catch(error => {
      console.error('Translation process failed:', error);
    });
  });
}

startServer(); 