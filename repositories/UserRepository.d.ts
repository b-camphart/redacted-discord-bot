import { User } from "../entities/User";

export type UserWithId = User & { id: string };

export interface ReadOnlyUserRepository {
    get(userId: string): Promise<UserWithId | undefined>;
}
