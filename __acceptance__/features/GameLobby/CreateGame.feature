Feature: Create a Game

    Scenario: Create a Game
        When "Greg" creates a new game
        Then "Greg" should be waiting for the game to start