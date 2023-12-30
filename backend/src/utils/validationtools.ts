export function verifyPassword(password: string): boolean {
    return password.match(/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-])(?=.*[A-Z])(?=.*[a-z]).{8,}$/) !== null;
}

export function verifyEmail(email: string): boolean {
    return email
    .toLowerCase()
    .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null;
}

export function verifyPhone(phone: string): boolean {
    return phone.match(/^\+48(?:\d{9}|\s\d{3}\s\d{3}\s\d{3}|\s\d{3}-\d{3}-\d{3}|-\d{3}-\d{3}-\d{3})$/) !== null;
}