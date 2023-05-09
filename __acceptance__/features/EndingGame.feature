Feature: Ending the Game
    The game is over once all the stories have been completed.

    Background: Start the Game
        Given "Greg" has created a game
        And the following players have all joined the game:
            | Jim | Billy | Bob |
        And "Greg" has started the game with 2 entries per story

    Scenario: Complete the Game
        When all the stories have been finished
        Then the game should be completed

    Scenario: Read the Finished Stories
        Given "Greg" has started his story with:
            """
            This will be the greatest story ever.
            """
        And "Jim" has censored the following words in the story started by "Greg":
            | 4 |
        And "Billy" has filled in the censored words in the story started by "Greg" with:
            | lamest |
        And "Bob" has continued the story started by "Greg":
            """
            Mainly because it's so short.
            """
        And "Greg" has truncated the last 2 words in the story started by "Greg"
        And "Jim" has completed the truncation in the story started by "Greg" with:
            """
            a little too meta.
            """
        When all the stories have been finished
        Then every player should see a story with:
            | content                                | redactions |
            | This will be the lamest story ever.    | [[17, 23]] |
            | Mainly because it's a little too meta. | [[29, 47]] |