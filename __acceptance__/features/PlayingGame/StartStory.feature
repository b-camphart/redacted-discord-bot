Feature: Start a Story

    Background: Game started
        Given "Greg" has created a game
        And the following players have all joined the game:
            | Jim | Billy | Bob |
        And "Greg" has started the game

    Scenario: Start the first story
        When "Greg" starts his story
        Then "Greg" should be waiting for another story

    Scenario: The next player starts their story
        Given "Greg" has started his story
        When "Jim" starts his story
        Then "Jim" should be redacting a story

    Scenario: The next player has already started their story
        Given "Jim" has started his story
        When "Greg" starts his story
        Then "Jim" should be redacting a story