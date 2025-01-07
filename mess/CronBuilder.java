public class CronBuilder {
    private String seconds = null;
    private String minutes = null;
    private String hours = null;
    private String dayOfMonth = null;
    private String month = null;
    private String dayOfWeek = null;
    private String timeZone = TimeZone.getDefault().getID(); // 默认为系统时区

    public CronBuilder setSeconds(String seconds) {
        this.seconds = validate(seconds, 0, 59);
        return this;
    }

    public CronBuilder setMinutes(String minutes) {
        this.minutes = validate(minutes, 0, 59);
        return this;
    }

    public CronBuilder setHours(String hours) {
        this.hours = validate(hours, 0, 23);
        return this;
    }

    public CronBuilder setDayOfMonth(String dayOfMonth) {
        this.dayOfMonth = validate(dayOfMonth, 1, 31);
        return this;
    }

    public CronBuilder setMonth(String month) {
        this.month = validate(month, 1, 12);
        return this;
    }

    public CronBuilder setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = validate(dayOfWeek, 0, 7);
        return this;
    }

    public CronBuilder setTimeZone(String timeZone) {
        if (TimeZone.getTimeZone(timeZone).getID().equals("GMT") && !timeZone.equals("GMT")) {
            throw new IllegalArgumentException("Invalid time zone ID: " + timeZone);
        }
        this.timeZone = timeZone;
        return this;
    }

    private String validate(String value, int min, int max) {
        String[] parts = value.split(",");
        
        for (String part : parts) {
            if (part.equals("*")) {
                continue; // 支持全部值
            }
            // 支持范围语法，如 1-5
            if (part.contains("-")) {
                String[] rangeParts = part.split("-");
                if (rangeParts.length != 2) {
                    throw new IllegalArgumentException("Invalid range format: " + part);
                }
                int start = Integer.parseInt(rangeParts[0]);
                int end = Integer.parseInt(rangeParts[1]);
                if (start < min || start > max || end < min || end > max || start > end) {
                    throw new IllegalArgumentException("Range values are out of bounds or invalid: " + part);
                }
                continue;
            }
            // 支持步进语法，如 */15 或 0/15
            if (part.contains("/")) {
                String[] stepParts = part.split("/");
                if (stepParts.length != 2) {
                    throw new IllegalArgumentException("Invalid step format: " + part);
                }
                if (!stepParts[0].equals("*")) {
                    int start = Integer.parseInt(stepParts[0]);
                    if (start < min || start > max) {
                        throw new IllegalArgumentException("Step starting value out of bounds: " + part);
                    }
                }
                int step = Integer.parseInt(stepParts[1]);
                if (step <= 0) {
                    throw new IllegalArgumentException("Step must be positive: " + part);
                }
                continue;
            }

            // 普通单个数字
            int num = Integer.parseInt(part);
            if (num < min || num > max) {
                throw new IllegalArgumentException("Value out of bounds: " + part);
            }
        }
        return value;
    }

    public String build() {
        return String.join(" ",
                seconds != null ? seconds : "0",        // 默认秒为0
                minutes != null ? minutes : "*",
                hours != null ? hours : "*",
                dayOfMonth != null ? dayOfMonth : "*",
                month != null ? month : "*",
                dayOfWeek != null ? dayOfWeek : "*") + " # TZ=" + this.timeZone;
    }

    // public static void main(String[] args) {
    //     // 示例: 设置了自定义时间和时区
    //     String cronWithTimeZone = new CronBuilder()
    //             .setMinutes("0/15")
    //             .setHours("9-18")
    //             .setTimeZone("UTC")
    //             .build();
    //     System.out.println(cronWithTimeZone); // 输出: 0 0/15 9-18 * * * # TZ=UTC
    // }
}