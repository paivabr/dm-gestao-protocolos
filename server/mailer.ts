import nodemailer from "nodemailer";

// Configuração do transportador de e-mail
// O usuário precisará configurar as variáveis de ambiente no Railway
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.APP_URL || "https://dm-gestao-protocolos-production.up.railway.app"}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"DM Gestão de Protocolos" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperação de Senha - DM Gestão de Protocolos",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recuperação de Senha</h2>
        <p>Olá, ${name},</p>
        <p>Você solicitou a recuperação de senha para sua conta no sistema DM Gestão de Protocolos.</p>
        <p>Clique no botão abaixo para redefinir sua senha. Este link expira em 1 hora.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; rounded: 5px; font-weight: bold;">Redefinir Minha Senha</a>
        </div>
        <p>Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático, por favor não responda.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("[Mailer] Error sending password reset email:", error);
    return { success: false, error };
  }
}
