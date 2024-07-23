interface IUser {
    _id?: string
    username: string
    password: string
    admin: boolean
}

// User without password for client
export type IUserInfo = Omit<IUser, "password">;

export default IUser