/**
 * Represents the title of an employee.
 * This enum defines the possible titles an employee can have,
 * such as Manager, Analyst, and Developer.
 *
 * @enum {string}
 * @property {string} Manager - Represents a managerial position.
 * @property {string} Analyst - Represents an analytical position.
 * @property {string} Developer - Represents a development position.
 */
export var Title;
(function (Title) {
    Title["Manager"] = "Manager";
    Title["Analyst"] = "Analyst";
    Title["Developer"] = "Developer";
})(Title || (Title = {}));
