# RUN_CODE_REVIEW

## Bootstrap

Đọc lần lượt:

1. `AGENTS.md`
2. `quality/QUALITY.md`
3. `docs/project-delivery/TECH_SPEC.md`
4. `docs/planning/INDICATOR_SSOT_POLICY.md`

## Focus areas

1. Pane reducer và layout sync
2. Dynamic chart series mapping
3. Indicator registry/accessor logic
4. Demo i18n usage và hardcoded strings mới
5. Demo-to-core dependency direction

## Guardrails bắt buộc

1. Không có line number thì không được ghi finding.
2. Phải đọc thân hàm trước khi khẳng định bug.
3. Nếu chưa chắc, gắn nhãn `QUESTION`, không gắn `BUG`.
4. Trước khi nói “thiếu xử lý X”, phải grep xác nhận.
5. Không flag style-only changes.

## Severity model

- Critical: sai dữ liệu, sai SSOT, crash runtime chính
- High: mixed theme/locale, pane actions sai trạng thái, chart control không dùng được
- Medium: label/aria/title sai hoặc thiếu nhất quán
- Low: docs drift hoặc cleanup còn sót

## Regression test rule

Sau mỗi finding mức `BUG`, phải:

1. Chỉ ra file và line.
2. Mô tả điều kiện tái hiện.
3. Đề xuất test regression cho đúng slice bị lỗi.

## Output format

```text
Finding:
Severity:
File:
Why it is wrong:
How to reproduce:
Suggested regression test:
```
