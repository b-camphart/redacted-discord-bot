Feature: Repair a Censored Story

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
        When "Jim" censors the following words:
            | 0 | 4 |
        Then "Billy" should be repairing a story with the content:
            """
            ____ will be the ________ story of all time.
            """
        And "Billy" should be repairing a story with 2 censored words to fill in

    Scenario: Repair censored words
        Given "Jim" has censored the following words:
            | 0 | 4 |
        When "Billy" fills in the censored words for his assigned story
        Then "Billy" should be waiting for another story

    