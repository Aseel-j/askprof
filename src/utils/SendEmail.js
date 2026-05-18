//import nodemailer from "nodemailer";
/*export async function sendEmail(to,subject,html){
    const transporter= nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.SENDER_EMAIL ,
            pass: process.env.SENDER_EMAIL_PASS 
        }
    });
    const info = await transporter.sendMail({
        from:`"Ask Pofessional "<${process.env.SENDER_EMAIL}>`,
        to,
        subject,
        html,
    });
}*/
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html) {
  try {
    const response = await resend.emails.send({
      from: "Ask Professional <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT SUCCESSFULLY:", response.id);
    return response;

  } catch (error) {
    console.log("EMAIL ERROR:", error.message);
    // ما نكسر التطبيق
    return null;
  }
}