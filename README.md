# ThinkTank-AI

ThinkTank AI is an interactive web application powered by Mistral NeMo, a research model developed by Mistral AI and trained on STEM data. This application is designed to provide cutting-edge STEM insights and research assistance through a user-friendly chat interface with advanced features.

## Features

1. **AI-Powered Chat**: Engage in conversations about STEM topics with Mistral NeMo, an advanced AI model specialized in STEM fields.

2. **Speech Recognition**: Use voice input to interact with the AI.

3. **Text-to-Speech**: Listen to AI responses with text-to-speech functionality.

4. **Theme Toggle**: Switch between light and dark modes for comfortable viewing.

5. **Suggestion List**: Quick access to predefined STEM-related questions.

6. **Chat History**: Automatically saves and loads chat history using local storage.

7. **Copy to Clipboard**: Easily copy AI responses with a single click.

8. **Responsive Design**: Optimized for both desktop and mobile devices.

## Usage

- Type your questions or use the microphone for voice input
- Click on suggested questions for quick interactions
- Toggle between light and dark themes using the theme button
- Use the speak icon to have the AI read responses aloud
- Copy AI responses using the copy icon

## Technical Details

- Frontend: HTML, CSS, and Vanilla JavaScript
- AI Integration: Mistral NeMo model accessed through a custom API endpoint (/api/chat)
- Styling: Custom CSS with responsive design
- Data Persistence: Local Storage for saving chat history and theme preference

## Future Improvements

- Implement user authentication for personalized experiences
- Expand the STEM topic coverage
- Enhance mobile responsiveness
- Add support for multiple languages

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in your Mistral AI API key
4. Run `npm start` to start the server

