
/**
 * Class representing the result of a validation operation.
 */
export default class Validation {
    success: boolean;
    message: string;

    /**
     * Create a new Validation result.
     * @param success - Whether the validation was successful.
     * @param message - An optional message providing more details.
     */
    constructor(success: boolean = true, message: string = "") {
        this.success = success;
        this.message = message;
    }
}