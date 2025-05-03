import nodemailer from "nodemailer";
export async function sendEmail(to,subject,html){
    const transporter= nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.SENDER_EMAIL ,
            pass: process.env.SENDER_EMAIL_PASS 
        }
    });
    const info = await transporter.sendMail({
        from:`"Node 10"<${process.env.sender_email}>`,
        to,
        subject,
        html,
    });
}