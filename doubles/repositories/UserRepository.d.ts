import { User } from "../../entities/User";

export type UserWithId = User & { id: string };

export interface UserRepository {
    get(userId: string): Promise<UserWithId | undefined>;
}
