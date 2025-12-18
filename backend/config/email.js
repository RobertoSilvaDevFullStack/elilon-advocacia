const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.elilonlopesadvogados.com.br",
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER || "contato@elilonlopesadvogados.com.br",
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (to, resetToken) => {
  const resetLink = `https://elilonlopesadvogados.com.br/admin/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: '"Elilon Lopes Advogados" <contato@elilonlopesadvogados.com.br>',
    to,
    subject: "Recuperação de Senha - Área Administrativa",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B1538;">Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de senha para a área administrativa.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #8B1538; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
        <p style="color: #666; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
