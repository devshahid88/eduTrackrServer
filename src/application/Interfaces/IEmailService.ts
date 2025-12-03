export interface IEmailService {
    sendEmail(options: {
        from: string;
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
}