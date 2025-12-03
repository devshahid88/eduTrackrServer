import nodemailer from 'nodemailer';
import { IEmailService } from "../../application/Interfaces/IEmailService";

export class EmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(options: {
        from: string;
        to: string;
        subject: string;
        html: string;
    }): Promise<void> {
        await this.transporter.sendMail(options);
    }
}