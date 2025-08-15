export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_PATTERN_MESSAGE = "メールアドレス形式で入力してください";

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
export const PASSWORD_PATTERN_MESSAGE =
  "パスワードは大文字小文字の英数字を含む6文字以上で入力してください";
