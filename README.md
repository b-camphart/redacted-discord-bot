# Redacted

This is a recreation of the game Redacted created by [Meshiest](https://github.com/Meshiest/outofcontext) with some additional features (coming soon!)

## Contexts

### Discord Bot

The intention is to add a discord bot that would allow friends within a discord server to easily create a game, play online, and have the finished stories be automatically posted to a designated channel within the server.

### Http

The game can be played entirely through the web with no authetication whatsoever. Keep your game code secret!

# Contributing

## Setup

### Prerequisites

Before you get started, make sure you have the following installed on your system:

-   Node.js
-   Git
-   NPM

### Steps

1. Fork this repository to your own account by clicking the "Fork" button in the top-right corner of this page.
2. Clone your forked repository to your local machine using git clone https://github.com/your-username/project-name.git.
3. Navigate to the project directory by running cd project-name.
4. Install the project dependencies by running `npm install`.

## Running

To run the server locally, run `npm start` (type Ctrl+C to stop it)
To run the tests, run `npm test`

## Architecture

-   The `__tests__` directory is where the tests are located, which follows the same structure as the root folder. Tests for `usecases`, for example, are located in the `__tests__/usecases` folder.
-   The `doubles` directory contains test doubles, such as Dummies, Stubs, Spys, Mocks, and Fakes. This is also where factories, to decouple the production classes from the tests, are located, as well as any contracts that need to be written.
-   The `entites` directory contains the domain objects for the Redacted game. Things like a "Story" a "Game" and a "Player." They exist completely separate from the _environment_ in which they are used - thus **absolutely NO persistence code** is found within them. They only exist as ways to abstract the concepts of the game.
-   The `repositories` directory contains the top-level definitions for the types of repositories that exist. The types of errors that specific repositories might throw are located here as well.
-   The `usecases` directory contains all the logic for the Redacted game. Creating a new game, players joining and leaving, stories being told, etc. This is all _game logic_ that exists regardless of the _environment_ the game is being run within.
-   Finally, the `environments` diretory. This is where _environment-specific_ code is located. Here, you'll find the directories and files that would be expected for an http server. Also, the discord bot. You'll find repository implementations located within this folder as well.

At the top level of the project, the `server.js` file (to be renamed) is where all the dependencies are pulled together and injected.
