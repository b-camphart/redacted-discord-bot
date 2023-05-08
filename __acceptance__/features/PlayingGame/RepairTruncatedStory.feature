Feature: Repair a Truncated Story

    Background: Story started
        Given "Greg" has created a game
        And the following players have all joined the game:
            | Jim | Billy | Bob |
        And "Greg" has started the game
        And "Jim" has started his story
        And "Billy" has started his story
        And "Billy" has censored his assigned story
        And "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """

    Scenario: Receive censored story to repair
        When "Jim" truncates 5 words
        Then "Billy" should be repairing a story with the content:
            """
            This will be the ___________________________
            """
        And "Billy" should be repairing a story with a truncation to fill in

    Scenario: Repair censored words
        Given "Jim" has truncated 5 words
        When "Billy" completes the truncation for his assigned story
        Then "Billy" should be waiting for another story
