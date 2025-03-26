export const formatDateForInput = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getNextYearExpirationDate = () => {
    const today = new Date();
    const nextYear = new Date(today);

    // Add one year
    nextYear.setFullYear(today.getFullYear() + 1);

    // Subtract one day
    nextYear.setDate(nextYear.getDate() - 1);

    return formatDateForInput(nextYear);
};

export const getEarliestDate = (
    ...dates: (string | Date | null | undefined)[]
): string | null => {
    const validDates = dates
        .map(date => (date ? new Date(date) : null))
        .filter(
            (date): date is Date =>
                date instanceof Date && !isNaN(date.getTime())
        )
        .map(date => date.toISOString().split('T')[0]); // Extract only the date part

    return validDates.length ? validDates.sort()[0] : null;
};
