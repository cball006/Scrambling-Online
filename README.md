# Golf Scorecard App

This is a simple golf scorecard application built with React and TypeScript. The app allows users to input player names and scores, and it displays the scores in a scorecard format.

## Features

- Input player names and scores
- Display scores in a structured scorecard
- Calculate total scores and statistics

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Node.js (version 14 or later)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/golf-scorecard-app.git
   ```

2. Navigate to the project directory:

   ```
   cd golf-scorecard-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To start the application, run:

```
npm start
```

This will launch the app in your default web browser at `http://localhost:3000`.

## Usage

- Enter player names and their scores in the input fields.
- The scorecard will automatically update to reflect the entered scores.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.

---

## 🔐 Environment Variables

Create a `.env` file in the root of `golf-scorecard-app/` with the following variables:

```env
# This is your personal API key for the golf scorecard app.
REACT_APP_GOLF_API_KEY=

# Discord webhook used for score updates or alerts
REACT_APP_DISCORD_WEBHOOK_URL=
```
