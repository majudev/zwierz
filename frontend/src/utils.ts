const months = [
    "styczeń",
    "luty",
    "marzec",
    "kwiecień",
    "maj",
    "czerwiec",
    "lipiec",
    "sierpień",
    "wrzesień",
    "październik",
    "listopad",
    "grudzień",
];

export function predictedDateToString(predicted: Date) : string {
    return months[predicted.getMonth()] + " " + predicted.getFullYear();
}

export function stringToPredictedDate(predicted: string) : Date {
    const split = predicted.split(" ");
    return new Date(split[1] + "-" + (months.findIndex((v, i, a) => { return v == split[0] })+1) + "-01");
}

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