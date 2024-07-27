import nodemailer from 'nodemailer';

const sendEmail = async (
  to: string,
  subject: string,
  text?: string,
  html?: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;
