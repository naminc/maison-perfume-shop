# Luồng bảo mật Auth, Session và Refresh Token

Tài liệu này giải thích đầy đủ luồng bảo mật đăng nhập hiện tại của Maison Perfume Shop, gồm:

- Access token
- Refresh token
- Login session
- Refresh token rotation
- Refresh token reuse detection
- Đăng xuất từng thiết bị
- Đăng xuất các thiết bị khác
- Các tình huống bảo mật thường gặp

Mục tiêu của thiết kế này là cân bằng giữa trải nghiệm người dùng và bảo mật:

- Người dùng có thể đăng nhập nhiều thiết bị cùng lúc.
- Mỗi thiết bị có một phiên đăng nhập riêng.
- Refresh token được xoay vòng sau mỗi lần sử dụng.
- Nếu phát hiện refresh token cũ bị dùng lại, backend coi đó là dấu hiệu token bị đánh cắp và revoke toàn bộ phiên của user.

## 1. Các khái niệm chính

### Access token

Access token dùng để gọi các API cần đăng nhập.

Ví dụ:

```http
Authorization: Bearer <access_token>
```

Đặc điểm:

- Thời gian sống ngắn.
- Được gửi kèm trong hầu hết request API.
- Nếu bị lộ, kẻ tấn công có thể gọi API cho đến khi token hết hạn hoặc bị revoke.
- Không dùng để xin access token mới.
- Không có reuse detection.

Access token nên được xem là token dùng hằng ngày, có rủi ro thấp hơn refresh token vì nó sống ngắn hơn.

### Refresh token

Refresh token dùng để xin access token mới khi access token hết hạn.

Đặc điểm:

- Thời gian sống dài hơn access token.
- Không nên gửi trong mọi request API.
- Chỉ dùng ở endpoint refresh token.
- Mỗi lần refresh thành công, refresh token cũ sẽ bị revoke và backend cấp refresh token mới.
- Nếu refresh token cũ đã bị revoke mà vẫn bị dùng lại, backend coi đó là dấu hiệu bất thường nghiêm trọng.

Refresh token là phần quan trọng nhất trong flow này. Nếu refresh token bị đánh cắp, hacker có thể xin access token mới cho đến khi backend phát hiện hoặc token bị revoke.

Backend lưu thêm lý do revoke của refresh token. Điểm này rất quan trọng:

- Refresh token bị revoke do rotation: nếu bị dùng lại thì kích hoạt reuse detection.
- Refresh token bị revoke do logout, xoá session hoặc đăng xuất thiết bị khác: nếu bị dùng lại thì chỉ báo phiên hết hạn, không revoke toàn bộ user.

### Login session

Login session đại diện cho một lần đăng nhập trên một thiết bị hoặc client.

Ví dụ:

- Chrome trên laptop: session A
- Safari trên điện thoại: session B
- Postman: session C

Khi user đăng nhập thành công, backend tạo một `login_session`. Access token và refresh token được gắn với `login_session_id`.

Nhờ đó backend biết:

- Token này thuộc thiết bị nào.
- Logout thiết bị nào thì revoke đúng token của thiết bị đó.
- Khi user chọn đăng xuất thiết bị khác, session hiện tại vẫn được giữ lại.

Frontend lưu `session_id` và gửi thêm header:

```http
X-Session-Id: <login_session_id>
```

Header này giúp backend xác định request đang đến từ phiên đăng nhập nào.

## 2. Luồng đăng nhập

Khi user login:

```text
User nhập email/password
  -> Backend xác thực thông tin đăng nhập
  -> Backend tạo access token
  -> Backend tạo refresh token
  -> Backend tạo login session
  -> Backend gắn access token và refresh token vào login session
  -> Frontend lưu access token, refresh token, session id và user
```

Điểm quan trọng:

- Login mới không revoke các session cũ.
- User có thể đăng nhập cùng lúc trên nhiều thiết bị.
- Web login không làm Postman hoặc điện thoại bị đá ra.
- Mỗi lần login tạo một session riêng.

Ví dụ:

```text
08:00 User login trên laptop
  -> Session A
  -> Access token A1
  -> Refresh token R1

08:05 User login trên điện thoại
  -> Session B
  -> Access token B1
  -> Refresh token R2

Kết quả:
  -> Laptop vẫn đăng nhập
  -> Điện thoại vẫn đăng nhập
  -> Hai session độc lập với nhau
```

Đây là hành vi phù hợp với một hệ thống e-commerce, vì người dùng thường đăng nhập trên nhiều thiết bị.

## 3. Luồng gọi API bình thường

Khi frontend gọi API cần đăng nhập:

```text
Frontend gọi API
  -> Gửi Authorization: Bearer <access_token>
  -> Backend kiểm tra access token
  -> Nếu hợp lệ: xử lý request
  -> Nếu hết hạn hoặc không hợp lệ: frontend thử refresh token
```

Ví dụ:

```http
GET /v1/account/profile
Authorization: Bearer A1
X-Session-Id: 10
```

Nếu access token `A1` còn hợp lệ, backend trả về thông tin tài khoản.

Nếu access token `A1` hết hạn, frontend sẽ gọi refresh token để xin cặp token mới.

## 4. Luồng refresh token rotation

Khi access token hết hạn, frontend gọi endpoint refresh token.

Luồng xử lý:

```text
Frontend gửi refresh token hiện tại
  -> Backend tìm refresh token trong database
  -> Nếu token hợp lệ:
       - revoke refresh token cũ
       - revoke access token cũ trong cùng session
       - cấp access token mới
       - cấp refresh token mới
       - giữ nguyên login session
  -> Frontend lưu token mới
```

Ví dụ:

```text
Trước refresh:
Session A
  Access token: A1
  Refresh token: R1

Sau refresh thành công:
Session A
  Access token: A2
  Refresh token: R2

Trạng thái:
  A1 bị revoke
  R1 bị revoke
  A2 đang active
  R2 đang active
```

Điểm quan trọng:

- Refresh token cũ chỉ được dùng một lần.
- Sau khi refresh thành công, token cũ không được phép dùng lại.
- Đây là refresh token rotation.

## 5. Reuse detection là gì?

Reuse detection là cơ chế phát hiện refresh token cũ đã bị revoke nhưng vẫn bị dùng lại.

Ví dụ:

```text
1. User có refresh token R1.
2. Hacker đánh cắp được R1.
3. User refresh trước.
4. Backend revoke R1 và cấp R2 cho user.
5. Hacker tiếp tục dùng R1.
6. Backend thấy R1 đã bị revoke nhưng vẫn bị dùng lại.
7. Backend kết luận có khả năng refresh token đã bị đánh cắp.
8. Backend revoke toàn bộ session/token của user.
```

Tại sao phải revoke toàn bộ?

Vì khi một refresh token đã bị dùng lại, backend không thể chắc chắn bên nào là user thật và bên nào là hacker. Cách xử lý an toàn là kết thúc toàn bộ phiên đăng nhập, buộc user đăng nhập lại.

Khi detect reuse, backend sẽ:

```text
Revoke toàn bộ access token của user
Revoke toàn bộ refresh token của user
Revoke toàn bộ login session của user
```

Đây là hành vi bảo mật chủ động.

## 6. Luồng logout

### Logout thiết bị hiện tại

Khi user bấm đăng xuất trên web, frontend gửi request logout kèm `X-Session-Id`.

```text
Frontend logout
  -> Gửi access token
  -> Gửi X-Session-Id
  -> Backend revoke đúng login session hiện tại
  -> Backend revoke access token của session hiện tại
  -> Backend revoke refresh token của session hiện tại
  -> Các session khác không bị ảnh hưởng
```

Ví dụ:

```text
User đang login trên:
  Laptop: Session A
  Điện thoại: Session B

User logout trên laptop:
  Session A bị revoke
  Session B vẫn active
```

### Logout từng thiết bị trong tab Bảo mật

Trong tab Bảo mật, user có thể xem danh sách session.

Ví dụ:

```text
Thiết bị hiện tại
  Chrome - Windows

Thiết bị khác
  Safari - iPhone
  Postman
```

Khi user bấm nút xoá/đăng xuất ở một session:

```text
Frontend gọi DELETE /v1/account/sessions/{session}
  -> Backend kiểm tra session có thuộc user không
  -> Backend mark session revoked
  -> Backend revoke access token và refresh token của session đó
```

Nếu user xoá chính session hiện tại:

```text
Session hiện tại bị revoke
  -> Frontend clear token
  -> Điều hướng về trang login
```

Nếu user xoá session khác:

```text
Session khác bị revoke
  -> User vẫn ở lại trang hiện tại
  -> Session hiện tại vẫn active
```

### Logout tất cả thiết bị khác

Khi user chọn đăng xuất các thiết bị khác:

```text
Frontend gọi POST /v1/account/sessions/revoke-others
  -> Backend giữ lại session hiện tại
  -> Backend revoke tất cả session còn lại
```

Ví dụ:

```text
Trước khi revoke:
  Session A: Chrome laptop, hiện tại
  Session B: iPhone
  Session C: Postman

Sau khi revoke thiết bị khác:
  Session A vẫn active
  Session B bị revoke
  Session C bị revoke
```

## 7. Các tình huống bảo mật cụ thể

### Tình huống 1: User login trên web rồi login trên Postman

```text
User login web
  -> Session A
  -> Access A1
  -> Refresh R1

User login Postman
  -> Session B
  -> Access B1
  -> Refresh R2
```

Kết quả:

- Web không bị đá ra.
- Postman không làm web mất session.
- Hai bên có token riêng.
- Nếu một bên logout, bên còn lại vẫn đăng nhập.

Đây là đúng với flow hiện tại.

### Tình huống 2: Web login sau Postman

```text
Postman login trước
  -> Session A
  -> Access A1
  -> Refresh R1

Web login sau
  -> Session B
  -> Access B1
  -> Refresh R2
```

Kết quả:

- Session Postman không bị revoke chỉ vì web login.
- Nếu Postman dùng access token `A1` còn hạn, request vẫn hợp lệ.
- Nếu Postman logout hoặc bị revoke trong tab Bảo mật, token Postman mới mất hiệu lực.

Nếu trước đây bạn thấy Postman bị đá khi web login, đó là do flow cũ revoke toàn bộ session khi login mới. Flow hiện tại không làm vậy nữa.

### Tình huống 3: Hacker chỉ có access token

```text
Hacker đánh cắp được access token A1
Hacker không có refresh token R1
```

Hacker có thể:

- Gọi API bằng `A1` nếu token còn hạn.

Hacker không thể:

- Xin access token mới.
- Kích hoạt reuse detection.

Khi `A1` hết hạn hoặc bị revoke, hacker mất quyền truy cập.

Kết luận:

Access token nên có thời gian sống ngắn để giảm rủi ro.

### Tình huống 4: Hacker có cả access token và refresh token

```text
Hacker đánh cắp được:
  Access token A1
  Refresh token R1
```

Nếu `R1` vẫn còn hợp lệ và chưa bị rotate:

- Hacker có thể dùng `A1` để gọi API.
- Hacker có thể dùng `R1` để xin token mới.
- Backend chưa có đủ dấu hiệu để biết đây là hacker.

Đây là giới hạn thực tế của mọi hệ thống token-based auth nếu refresh token đã bị đánh cắp trước khi bị rotate.

### Tình huống 5: User và hacker cùng giữ một refresh token

Giả sử cả user và hacker đều có `R1`.

Trường hợp user refresh trước:

```text
User dùng R1
  -> Backend cấp R2
  -> Backend revoke R1

Hacker dùng lại R1
  -> Backend phát hiện R1 đã revoked
  -> Reuse detection kích hoạt
  -> Revoke toàn bộ session của user
```

Trường hợp hacker refresh trước:

```text
Hacker dùng R1
  -> Backend cấp R2 cho hacker
  -> Backend revoke R1

User dùng lại R1
  -> Backend phát hiện R1 đã revoked
  -> Reuse detection kích hoạt
  -> Revoke toàn bộ session của user
```

Kết luận:

Bên nào dùng refresh token cũ sau sẽ kích hoạt reuse detection. Khi đã detect reuse, backend revoke toàn bộ session vì không thể tin tưởng bất kỳ phiên nào nữa.

Lưu ý:

Reuse detection chỉ áp dụng với refresh token cũ bị revoke do rotation. Nếu token bị revoke vì user chủ động đăng xuất thiết bị đó, request refresh sau đó chỉ bị từ chối với lỗi hết phiên.

Ngoài ra, project có xử lý riêng cho race nhiều tab/cửa sổ cùng session. Khi access token hết hạn, nếu hai tab cùng lúc refresh một refresh token, request đầu tiên có thể rotate token trước, request còn lại sẽ nhìn thấy token cũ đã bị revoke. Trường hợp này không được xem ngay là tấn công nếu cùng `login_session_id` và xảy ra trong một khoảng rất ngắn.

### Tình huống 6: Hai thiết bị đều có reuse detection

```text
Laptop:
  Session A
  Refresh R1

Điện thoại:
  Session B
  Refresh R2
```

Cả hai refresh token đều được bảo vệ bằng reuse detection.

Ví dụ laptop bị lộ `R1`:

```text
Laptop refresh R1 thành R3
Hacker dùng lại R1
  -> Detect reuse
  -> Revoke toàn bộ session của user
  -> Laptop và điện thoại đều bị đăng xuất
```

Ví dụ điện thoại bị lộ `R2`:

```text
Điện thoại refresh R2 thành R4
Hacker dùng lại R2
  -> Detect reuse
  -> Revoke toàn bộ session của user
  -> Laptop và điện thoại đều bị đăng xuất
```

Kết luận:

Reuse detection áp dụng cho mọi refresh token của mọi session. Nhưng nó chỉ kích hoạt khi refresh token cũ đã bị revoke rồi bị dùng lại.

Chính xác hơn:

- Token bị revoke do rotation rồi bị dùng lại: kích hoạt reuse detection.
- Token bị revoke do logout/session revoke rồi bị dùng lại: chỉ báo phiên hết hạn.

Ví dụ hợp lệ:

```text
Chrome: Session A
Edge: Session B

Chrome bấm "Đăng xuất thiết bị khác"
  -> Session B của Edge bị revoke
  -> Refresh token của Edge bị revoke với lý do session

Edge còn giữ token cũ và gọi API
  -> API trả 401
  -> Edge thử refresh token cũ
  -> Backend thấy token đã revoke vì session
  -> Backend trả "Phiên đăng nhập đã hết hạn"
  -> Edge clear token và về login
  -> Chrome vẫn active
```

Đây là hành vi đúng. Edge bị đăng xuất, nhưng Chrome không bị đá ra.

### Tình huống 6.1: Nhiều tab cùng hết hạn sau 15 phút

Access token hiện tại sống 15 phút. Sau 15 phút, nhiều request có thể cùng nhận `401` và cùng muốn refresh token.

Ví dụ:

```text
Chrome đang mở 2 tab Maison
Cả 2 tab dùng chung localStorage
Access token hết hạn sau 15 phút

Tab 1 gọi API -> nhận 401 -> refresh R1
Tab 2 gọi API gần như cùng lúc -> cũng nhận 401
```

Nếu không xử lý race:

```text
Tab 1 dùng R1 thành công
  -> Backend revoke R1
  -> Backend cấp R2

Tab 2 vẫn gửi R1
  -> Backend thấy R1 đã bị revoke do rotation
  -> Có thể bị hiểu nhầm là reuse attack
```

Flow hiện tại xử lý bằng 2 lớp:

- Frontend dùng refresh lock qua localStorage để chỉ một tab được refresh tại một thời điểm.
- Backend có grace ngắn cho refresh token vừa bị rotate trong cùng session, để tránh false positive do race.

Kết quả mong muốn:

```text
Tab 1 refresh thành công và lưu token mới
Tab 2 chờ token mới rồi retry request
User không bị logout sau 15 phút
```

### Tình huống 7: Hacker có refresh token nhưng user không online

```text
Hacker có R1
User không mở web trong 15 phút
```

Nếu hacker dùng `R1` trước khi user refresh:

```text
Hacker dùng R1
  -> Backend thấy R1 còn hợp lệ
  -> Backend cấp token mới
```

Backend chưa thể biết đó là hacker, vì token vẫn hợp lệ.

Nếu sau đó user quay lại và dùng `R1` cũ:

```text
User dùng R1
  -> Backend thấy R1 đã revoked
  -> Detect reuse
  -> Revoke toàn bộ session
```

Kết luận:

Reuse detection không phải cơ chế ngăn hacker ngay lập tức trong mọi trường hợp. Nó là cơ chế phát hiện khi có dấu hiệu refresh token bị dùng lại bất thường.

### Tình huống 8: User đổi mật khẩu

Khi user đổi mật khẩu thành công:

```text
Backend revoke toàn bộ session/token của user
Frontend clear token
Frontend điều hướng về login
```

Lý do:

Đổi mật khẩu là hành động bảo mật nhạy cảm. Sau khi đổi mật khẩu, tất cả thiết bị nên đăng nhập lại.

### Tình huống 9: Reset password

Khi user reset password thành công:

```text
Backend revoke toàn bộ session/token của user
User đăng nhập lại bằng mật khẩu mới
```

Lý do:

Nếu tài khoản bị nghi ngờ mất quyền kiểm soát, reset password phải làm mất hiệu lực các phiên cũ.

## 8. Vì sao không revoke tất cả session khi login mới?

Nếu mỗi lần user login đều revoke tất cả session cũ:

- User login trên điện thoại sẽ làm laptop bị đá ra.
- User login trên web sẽ làm Postman mất token.
- User đang checkout trên thiết bị khác có thể bị gián đoạn.
- Trải nghiệm không tốt cho e-commerce.

Flow hiện tại chọn cách:

- Login mới tạo session mới.
- Session cũ vẫn giữ nguyên.
- User có thể tự quản lý session trong tab Bảo mật.
- Khi có dấu hiệu refresh token reuse, backend mới revoke toàn bộ.

Đây là cách cân bằng tốt hơn giữa UX và bảo mật.

## 9. Khi nào revoke một session, khi nào revoke toàn bộ?

### Revoke một session

Dùng khi:

- User bấm logout trên thiết bị hiện tại.
- User xoá một thiết bị cụ thể trong tab Bảo mật.
- User chọn đăng xuất thiết bị lạ.

Ảnh hưởng:

- Chỉ session đó mất hiệu lực.
- Các thiết bị khác không bị ảnh hưởng.

### Revoke các session khác

Dùng khi:

- User muốn giữ thiết bị hiện tại.
- User muốn đăng xuất khỏi mọi thiết bị khác.

Ảnh hưởng:

- Session hiện tại vẫn active.
- Tất cả session khác bị revoke.

### Revoke toàn bộ session

Dùng khi:

- Detect refresh token reuse.
- User đổi mật khẩu.
- User reset password.
- Backend fallback logout trong client không gửi `X-Session-Id`.

Ảnh hưởng:

- Tất cả thiết bị bị đăng xuất.
- User phải login lại.

## 10. API liên quan

### Auth

```http
POST /v1/auth/login
POST /v1/auth/register
POST /v1/auth/refresh
POST /v1/auth/logout
```

### Session trong tài khoản

```http
GET /v1/account/sessions
DELETE /v1/account/sessions/{session}
POST /v1/account/sessions/revoke-others
POST /v1/account/sessions/revoke-all
```

### Header quan trọng

```http
Authorization: Bearer <access_token>
X-Session-Id: <login_session_id>
```

`Authorization` dùng để xác thực user.

`X-Session-Id` dùng để xác định request thuộc phiên đăng nhập nào.

## 11. Luồng hiện tại của project

Tổng quan:

```text
Login/Register
  -> Tạo access token
  -> Tạo refresh token
  -> Tạo login session
  -> Gắn token vào login session

Call API
  -> Dùng access token

Access token hết hạn
  -> Dùng refresh token
  -> Rotate refresh token
  -> Cấp access token mới
  -> Giữ nguyên login session

Refresh token đã revoked bị dùng lại
  -> Detect reuse
  -> Revoke toàn bộ access token của user
  -> Revoke toàn bộ refresh token của user
  -> Revoke toàn bộ login session của user

Logout thiết bị hiện tại
  -> Revoke đúng session hiện tại

Đăng xuất thiết bị khác
  -> Revoke session được chọn

Đăng xuất tất cả thiết bị khác
  -> Giữ session hiện tại
  -> Revoke các session còn lại
```

## 12. Giới hạn của flow hiện tại

Flow hiện tại không thể phát hiện ngay lập tức mọi trường hợp token bị đánh cắp.

Ví dụ:

```text
Hacker có refresh token R1
R1 vẫn còn hợp lệ
User chưa refresh R1
Hacker dùng R1 trước
```

Trong trường hợp này, backend chỉ thấy một refresh token hợp lệ được sử dụng. Backend chưa có đủ bằng chứng để biết request đến từ hacker.

Reuse detection chỉ phát hiện khi:

```text
Refresh token đã bị revoke do rotation
Nhưng vẫn bị dùng lại
```

Đây là giới hạn tự nhiên của token-based authentication.

## 13. Cách giảm rủi ro token bị đánh cắp

Các biện pháp đang có:

- Access token sống ngắn.
- Refresh token rotation.
- Reuse detection.
- Quản lý session trong tab Bảo mật.
- Đăng xuất từng thiết bị.
- Đăng xuất các thiết bị khác.
- Đổi mật khẩu/reset password revoke toàn bộ session.

Các hướng nâng cấp trong tương lai:

- Lưu refresh token trong HttpOnly Secure SameSite cookie.
- Chỉ giữ access token trong memory thay vì localStorage.
- Thêm Content Security Policy để giảm rủi ro XSS.
- Audit các chỗ render HTML động.
- Thêm thông báo email khi có thiết bị mới đăng nhập.
- Thêm cảnh báo khi phát hiện login từ IP hoặc quốc gia lạ.
- Cho user đặt tên thiết bị hoặc xem lịch sử đăng nhập chi tiết hơn.

## 14. Lưu ý về localStorage

Nếu token được lưu trong localStorage, rủi ro lớn nhất là XSS.

Nếu một script độc hại chạy được trong trang, script đó có thể đọc token trong localStorage.

Vì vậy:

- Không render HTML không tin cậy.
- Không dùng `dangerouslySetInnerHTML` nếu không sanitize.
- Cẩn thận với package bên thứ ba.
- Nên có CSP khi project lên production.

Nâng cấp bảo mật tốt hơn là chuyển refresh token sang HttpOnly cookie. Khi đó JavaScript không đọc được refresh token, giảm đáng kể rủi ro token bị đánh cắp qua XSS.

## 15. File backend liên quan

Các file chính:

```text
backend/app/Services/AuthService.php
backend/app/Services/RefreshTokenService.php
backend/app/Services/LoginSessionService.php
backend/app/Http/Controllers/Api/V1/Auth/AuthController.php
backend/app/Http/Controllers/Api/V1/Account/SessionController.php
backend/app/Models/LoginSession.php
backend/app/Models/RefreshToken.php
backend/routes/v1/account.php
```

Migration liên quan:

```text
backend/database/migrations/2026_05_25_010000_add_login_session_mapping_to_tokens.php
```

Migration này thêm liên kết giữa token và login session.

## 16. File frontend liên quan

Các file chính:

```text
frontend/src/contexts/AuthContext.tsx
frontend/src/lib/api.ts
frontend/src/api/auth.ts
frontend/src/api/account.ts
frontend/src/hooks/useAccount.ts
frontend/src/pages/account/Security.tsx
frontend/src/types/account.ts
```

Frontend chịu trách nhiệm:

- Lưu access token.
- Lưu refresh token.
- Lưu session id.
- Gửi `X-Session-Id`.
- Tự refresh token khi access token hết hạn.
- Clear token khi logout.
- Điều hướng về login khi session hiện tại bị revoke.

## 17. Kết luận

Flow bảo mật hiện tại hoạt động theo nguyên tắc:

- Một user có thể có nhiều login session.
- Mỗi session có access token và refresh token riêng.
- Login mới không đá session cũ.
- Refresh token được rotate sau mỗi lần sử dụng.
- Refresh token cũ bị dùng lại sẽ kích hoạt reuse detection.
- Khi detect reuse, backend revoke toàn bộ session của user.
- User có thể đăng xuất từng thiết bị hoặc đăng xuất tất cả thiết bị khác trong tab Bảo mật.

Đây là flow hợp lý cho e-commerce: không gây khó chịu cho user khi dùng nhiều thiết bị, nhưng vẫn có cơ chế xử lý mạnh khi phát hiện dấu hiệu token bị đánh cắp.
