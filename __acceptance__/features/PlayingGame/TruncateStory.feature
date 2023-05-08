Feature: Censor a Story

    Background: Game started
        Given "Greg" has created a game
        And the following players have all joined the game:
            | Jim | Billy | Bob |
        And "Greg" has started the game
        
    Scenario: Truncate words
        Given "Jim" has started his story
        And "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """
        When "Jim" truncates his assigned story
        Then "Jim" should be waiting for another story

    Scenario: Next story is already available
        Given "Greg" has started his story
        And "Bob" has started his story
        And "Greg" has censored his assigned story
        And "Jim" has started his story
        When "Jim" truncates his assigned story
        Then "Jim" should be repairing a story
