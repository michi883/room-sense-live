# Room Sense Live

Room Sense Live is an AI-native performance lab for comedians. It provides different modes of real-time, interactive feedback on comedy sets using the Gemini Live API for audio-based conversational AI and visual feedback.

## Features

The application consists of three main modes:

### 1. Performance Mode
A full-screen immersive room designed for live performance feedback. 
- Minimal UI with environmental feedback and subtitles.
- Features a crowd reaction bot that listens to the audio stream and triggers specific sound effects (laughs, oofs, claps, awws) using tool calling.
- Dynamically adjusts video appearance (brightness, contrast, sepia, scale, shake) and energy band based on the performer's energy and triggered sound effects.

### 2. Analysis Mode
A live face grid featuring 4 different personas.
- Each face has an independent Gemini Live channel.
- Personas (Comedy Nerd, ESL Listener, HR Manager, Traditionalist) analyze the performance through their unique perspectives.
- Agents produce spoken reactions that are transcribed and presented as staggered thought bubbles.
- Allows direct conversation with individual personas by clicking on their face cards.

### 3. Compare Mode
Side-by-side persona rooms.
- Uses the same microphone feed across different personas.
- Each room operates its own independent Gemini Live channel.
- Produces spoken reactions shown as scattered text bubbles that overlap for a dense feedback effect.

## Technical Details

- **Backend**: Node.js with Express.js for serving static files, providing configuration, and exposing a Master Analysis endpoint (`/api/analyze`).
- **AI Integration**: Uses Gemini 2.5 Flash (`gemini-2.5-flash-native-audio-preview-12-2025`) for real-time streaming audio interactions and (`gemini-2.5-flash-preview-05-20`) for structured JSON master analysis of comedy sets.
- **Audio Processing**: Custom `AudioEngine` for microphone capture and `AudioStreamer` for playback.
- **Visuals**: Features dynamic interactions with video loops that start playing automatically across all modes on load. Real-time visual filters and CSS styling react to audio and performance energy levels.

## Setup and Running

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your web browser.

### Deployment

The project is designed to be deployed with a split architecture:
- **Backend**: Hosted on **Google Cloud Run**.
- **Frontend**: Hosted on **Firebase Hosting**.

#### 1. Backend Deployment (Cloud Run)

Ensure you have the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and billing enabled on your project.

```bash
gcloud run deploy room-sense-backend --source . --region us-central1 --allow-unauthenticated --set-env-vars GEMINI_API_KEY=your_api_key_here
```

#### 2. Frontend Deployment (Firebase Hosting)

Install the [Firebase CLI](https://firebase.google.com/docs/cli).

```bash
firebase deploy --only hosting
```

> [!NOTE]
> The `firebase.json` is configured to proxy all `/api/**` requests to the Cloud Run backend.

## Project Structure

- `server.js`: The Express server and master analysis generation endpoint.
- `Procfile`: Configures the entry point for Cloud Run.
- `firebase.json` & `.firebaserc`: Configuration for Firebase Hosting.
- `public/`: Frontend assets (HTML, CSS, JS).
  - `js/engines/`: Audio, Energy, SFX, and Gemini Live integration logic.
  - `js/modes/`: Implementations for Performance, Analysis, and Compare modes.
  - `config/`: Configurations for personas and sound effects.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
