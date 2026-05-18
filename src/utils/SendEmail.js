import nodemailer from "nodemailer";
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
export async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ask Professional" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT SUCCESSFULLY");

  } catch (error) {
    console.log("EMAIL ERROR:", error);
    throw error;
  }
}
