import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// Tạo transporter với error handling
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Thêm timeout và retry options
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error('Email service configuration error');
  }
};
//Hàm gửi link verify Email
export const sendVerificationLink = async (to, token, userName = null) => {
    try {
        const transporter = createTransporter();
        console.log('Transporter verified:', await transporter.verify());
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        console.log('Verification URL:', verificationUrl);
        const mailOptions = {
          from: `"VieVerse Support" <${process.env.MAIL_USER}>`,
          to,
          subject: '🔗 Xác minh email VieVerse',
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Xác minh email VieVerse</title>
            <style>
              body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 40px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .logo {
          font-size: 28px;
          color: #07e32b;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          margin: 24px 0;
        }
        .footer {
          font-size: 14px;
          color: #888888;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VieVerse</div>
        <h2>Xác minh email của bạn</h2>
        <p>Chào ${userName || 'bạn'},</p>
        <p>Vui lòng nhấp vào nút bên dưới để xác minh địa chỉ email của bạn:</p>
        <a href="${verificationUrl}" class="button">Xác minh email</a>
        <p>Liên kết sẽ hết hạn trong vòng 24 giờ.</p>
        <p class="footer">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
      </div>
    </body>
    </html>
  `,
  text: `
    Xác minh email VieVerse

    Chào ${userName || 'bạn'},

    Vui lòng nhấp vào liên kết sau để xác minh email của bạn:
    ${verificationUrl}

    Liên kết này sẽ hết hạn trong 24 giờ.

    Trân trọng,
    Đội ngũ VieVerse
  `
};

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending verification email:', error.message, error.stack);
        throw new Error('Failed to send verification email.' + error.message);
    }
};

// Template email OTP 
const getOTPEmailTemplate = (otp, userName = 'Bạn') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác minh tài khoản VieVerse</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #07e32b; margin: 0; font-size: 28px;">VieVerse</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Nền tảng kết nối sinh viên</p>
        </div>
        
        <!-- Main Content -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Xác minh tài khoản của bạn</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Chào ${userName},<br>
            Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:
          </p>
          
          <!-- OTP Code -->
          <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h1 style="color: #2563eb; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          
          <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
            ⚠️ Mã OTP này sẽ hết hạn trong <strong>10 phút</strong>
          </p>
        </div>
        
        <!-- Security Warning -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <h4 style="color: #92400e; margin: 0 0 10px 0;">🔒 Lưu ý bảo mật:</h4>
          <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
            <li>Không chia sẻ mã OTP này với bất kỳ ai</li>
            <li>VieVerse sẽ không bao giờ yêu cầu mã OTP qua điện thoại</li>
            <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email</li>
          </ul>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Cảm ơn bạn đã sử dụng VieVerse!<br>
            Đội ngũ phát triển VieVerse
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0;">
            © 2025 VieVerse. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Hàm gửi OTP với error handling
export const sendOTP = async (to, otp, userName = null) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter trước khi gửi
    await transporter.verify();
    
    const mailOptions = {
      from: `"VieVerse Support" <${process.env.MAIL_USER}>`,
      to,
      subject: '🔐 Xác minh tài khoản VieVerse - Mã OTP',
      html: getOTPEmailTemplate(otp, userName),
      // Thêm text version cho email clients không hỗ trợ HTML
      text: `
        Xác minh tài khoản VieVerse
        
        Chào ${userName || 'bạn'},
        
        Mã OTP xác minh của bạn là: ${otp}
        
        Mã này sẽ hết hạn trong 10 phút.
        
        Vui lòng không chia sẻ mã này với bất kỳ ai.
        
        Trân trọng,
        Đội ngũ VieVerse
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('OTP email sent successfully:', {
      messageId: info.messageId,
      to,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // Throw custom error với message rõ ràng
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check email credentials.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Cannot connect to email server. Please try again later.');
    } else {
      throw new Error('Failed to send OTP email. Please try again.');
    }
  }
};

// Hàm gửi email chào mừng sau khi verify thành công
export const sendWelcomeEmail = async (to, userName, userRole) => {
  try {
    const transporter = createTransporter();
    
    const welcomeTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng đến với VieVerse</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Chào mừng đến với VieVerse!</h1>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1e293b;">Chào ${userName},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã xác minh thành công tài khoản ${userRole === 'student' ? 'sinh viên' : 'công ty'} trên VieVerse!
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Bây giờ bạn có thể:
            </p>
            <ul style="color: #475569; font-size: 16px; line-height: 1.6;">
              ${userRole === 'student' ? 
                `<li>Tìm kiếm và ứng tuyển các dự án thú vị</li>
                <li>Kết nối với sinh viên khác</li>
                <li>Xây dựng hồ sơ năng lực</li>` :
                `<li>Đăng tải các dự án cần tuyển dụng</li>
                <li>Tìm kiếm nhân tài sinh viên</li>
                <li>Quản lý quy trình tuyển dụng</li>`
              }
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Bắt đầu khám phá →
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: `"VieVerse Team" <${process.env.MAIL_USER}>`,
      to,
      subject: '🎉 Chào mừng đến với VieVerse!',
      html: welcomeTemplate
    });
    
    console.log('Welcome email sent successfully to:', to);
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Không throw error vì welcome email không quan trọng bằng OTP
  }
};