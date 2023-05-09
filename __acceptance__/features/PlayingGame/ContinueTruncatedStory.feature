Feature: Continue a Truncated Story

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

    Scenario: Receive truncated story to continue
        Given "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """
        And "Jim" has truncated the last 4 words
        When "Billy" completes the truncation for his assigned story with:
            """
            thing ever written.
            """
        Then "Bob" should be continuing a story with the content:
            """
            This will be the greatest thing ever written.
            """

    Scenario: Continue truncated story
        Given "Greg" has started his story with:
            """
            This will be the greatest story of all time.
            """
        And "Jim" has truncated the last 4 words
        And "Billy" has completed the truncation for his assigned story with:
            """
            thing ever written.
            """
        When "Bob" continues his assigned story with:
            """
            I just hope I don't mess it up.
            """
        Then "Bob" should be waiting for another story
