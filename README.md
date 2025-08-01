# Translation Module

A Node.js Express server that processes text files for translation using OpenAI API. The system breaks down large text files into manageable chunks, translates them, and reassembles the results.

## Features

- Reads text files from an `input` folder
- Breaks down text into 50-line chunks for processing
- Uses OpenAI API for translation
- Customizable translation prompts via `prompt.txt`
- Saves translated files to an `output` folder
- RESTful API endpoints for processing and status

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `env.example` to `.env`
   - Add your OpenAI API key to `.env`:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

3. **Customize the prompt:**
   - Edit `prompt.txt` with your specific translation instructions

## Usage

1. **Start the server:**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

2. **Add text files to translate:**
   - Place your `.txt` files in the `input` folder
   - The system will process all `.txt` files in this folder

3. **Trigger translation:**
   - Send a POST request to `http://localhost:3000/process`
   - Or use the API endpoint to start processing

4. **Check status:**
   - GET `http://localhost:3000/status` to see input/output files

5. **Get results:**
   - Translated files will be saved in the `output` folder
   - Files are prefixed with `translated_`

## API Endpoints

- `GET /` - API information
- `POST /process` - Start translation process
- `GET /status` - Get current status and file lists

## File Structure

```
Translation_module/
├── input/              # Place your .txt files here
├── output/             # Translated files are saved here
├── prompt.txt          # Customize translation instructions
├── server.js           # Main server file
├── package.json        # Dependencies
└── env.example         # Environment template
```

## Configuration

- **Chunk Size**: Currently set to 50 lines per chunk (modifiable in `server.js`)
- **Model**: Uses GPT-3.5-turbo (modifiable in `server.js`)
- **Rate Limiting**: 1-second delay between chunks to avoid API limits

## Example Usage

1. Create a text file with 1400 lines in the `input` folder
2. Customize `prompt.txt` with your translation requirements
3. Start the server: `npm start`
4. Send POST request to `/process`
5. Check the `output` folder for translated files

## Notes

- The system processes all `.txt` files in the input folder
- Each file is split into 50-line chunks for translation
- A 1-second delay is added between chunks to respect API rate limits
- If translation fails for a chunk, the original text is preserved
- The prompt file is read for each translation session 