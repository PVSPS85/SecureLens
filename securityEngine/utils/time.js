class TimeUtils {
  static nowISO() {
    return new Date().toISOString();
  }

  static getDifferenceInDays(date1, date2 = new Date()) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffTime = Math.abs(d2 - d1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

module.exports = TimeUtils;
