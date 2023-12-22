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