import { ILogin } from "../contracts/login.interface";

export class LoginModel implements ILogin {
    username: string;
    password: string;
    rememberMe: boolean;
    constructor(username: string, password: string, rememberMe: boolean = false) {
        this.username = username;
        this.password = password;
        this.rememberMe = rememberMe;
    }
}