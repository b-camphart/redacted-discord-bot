Feature: Join a Game

    Background: Game created
        Given "Greg" has created a game

    Scenario: Join a pending game
        When "Jim" joins the game
        Then "Jim" should be waiting for the game to start

    Scenario: Join the game twice
        Given "Jim" has joined the game
        When "Jim" joins the game
        Then "Jim" should have received the "Already in the game" message

    Scenario: Join the game late
        Given 3 more players have joined the game
        And "Greg" has started the game
        When "Jim" joins the game
        Then "Jim" should have received the "Game already in progress" message