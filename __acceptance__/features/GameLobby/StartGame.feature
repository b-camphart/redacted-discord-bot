Feature: Start a Game

    Background: Game created
        Given "Greg" has created a game

    Scenario: Start the game early
        When "Greg" starts the game
        Then "Greg" should have received the "Not enough players" message

    Scenario: Start the game
        Given 3 more players have joined the game
        When "Greg" starts the game
        Then "Greg" should be starting a story