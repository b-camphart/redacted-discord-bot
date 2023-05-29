export interface Redacted
	extends UseCases.GameCreation,
		UseCases.GameJoining,
		UseCases.GameStart,
		UseCases.StoryStart,
		UseCases.StoryCensorship,
		UseCases.StoryTruncation,
		UseCases.CensoredStoryRepair,
		UseCases.TruncatedStoryRepair,
		UseCases.StoryContinuation {}
