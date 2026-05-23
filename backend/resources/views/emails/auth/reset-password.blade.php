<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Đặt lại mật khẩu Maison</title>
</head>
<body style="margin:0;background:#f5f1eb;color:#1c1917;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Maison đã nhận yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1eb;margin:0;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
                    <tr>
                        <td align="center" style="padding:10px 0 24px;">
                            <div style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:20px;font-weight:700;text-align:center;">
                                M
                            </div>
                            <div style="margin-top:10px;font-size:18px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#1c1917;">
                                Maison
                            </div>
                            <div style="margin-top:4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a16207;">
                                Perfume
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="overflow:hidden;border:1px solid #e7e5e4;border-radius:18px;background:#ffffff;box-shadow:0 18px 45px rgba(28,25,23,0.08);">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="background:#1c1917;padding:28px 32px;text-align:center;">
                                        <div style="font-size:22px;font-weight:700;color:#ffffff;">
                                            Đặt lại mật khẩu
                                        </div>
                                        <div style="margin-top:8px;font-size:14px;line-height:22px;color:#d6d3d1;">
                                            Hoàn tất trong vài phút để tiếp tục sử dụng tài khoản Maison.
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:34px 36px 30px;">
                                        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1c1917;">
                                            Xin chào,
                                        </p>

                                        <p style="margin:0 0 18px;font-size:15px;line-height:24px;color:#57534e;">
                                            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản
                                            <strong style="color:#1c1917;">{{ $email }}</strong>.
                                        </p>

                                        <p style="margin:0 0 28px;font-size:15px;line-height:24px;color:#57534e;">
                                            Nhấn vào nút bên dưới để tạo mật khẩu mới. Vì lý do bảo mật, liên kết này sẽ hết hạn sau
                                            <strong style="color:#1c1917;">{{ $expiresIn }} phút</strong>.
                                        </p>

                                        <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 28px;">
                                            <tr>
                                                <td align="center" style="border-radius:12px;background:#1c1917;">
                                                    <a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 28px;border-radius:12px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
                                                        Đặt lại mật khẩu
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="border-radius:14px;background:#fafaf9;padding:16px 18px;border:1px solid #e7e5e4;">
                                            <p style="margin:0;font-size:13px;line-height:21px;color:#78716c;">
                                                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn và mật khẩu hiện tại không thay đổi.
                                            </p>
                                        </div>

                                        <div style="margin-top:26px;padding-top:22px;border-top:1px solid #e7e5e4;">
                                            <p style="margin:0 0 8px;font-size:12px;line-height:19px;color:#78716c;">
                                                Nếu nút không hoạt động, sao chép liên kết này và dán vào trình duyệt:
                                            </p>
                                            <p style="margin:0;word-break:break-all;font-size:12px;line-height:19px;">
                                                <a href="{{ $resetUrl }}" style="color:#92400e;text-decoration:underline;">{{ $resetUrl }}</a>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:22px 12px 0;">
                            <p style="margin:0;font-size:12px;line-height:20px;color:#78716c;">
                                Maison Perfume Shop<br>
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
