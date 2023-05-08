Feature: Repair a Censored Story

    Background: Story started
        Given "Greg" has created a game
        And the following players have all joined the game:
            | Jim | Billy | Bob |
        And "Greg" has started the game
        And "Jim" has started his story
        And "Billy" has started his story
        And "Billy" has censored his assigned story
        And "Bob" has started his story
        And "Bob" has filled in the censored words for his assigned story
        And "Bob" has censored his assigned story

    Scenario: Receive censored story to continue
        Given "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """
        And "Jim" has censored the following words:
            | 0 | 4 |
        When "Billy" fills in the censored words for his assigned story with:
            | Nothing | lamest |
        Then "Bob" should be continuing a story with the content:
            """
            Nothing will be the lamest story of all time.
            """

    Scenario: Continue censored story
        Given "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """
        And "Jim" has censored the following words:
            | 0 | 4 |
        And "Billy" has filled in the censored words for his assigned story with:
            | Nothing | lamest |
        When "Bob" continues his assigned story with:
            """
            I concurr.  No stories are lame.
            """
        Then "Bob" should be waiting for another story
    