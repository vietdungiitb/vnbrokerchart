# RUN_SPEC_AUDIT

## Council of Three

Ba lượt audit độc lập, không chia sẻ kết quả cho nhau trước khi triage:

1. Auditor A: tập trung data flow và SSOT
2. Auditor B: tập trung UI/runtime behavior và i18n
3. Auditor C: tập trung architecture drift và widget-readiness

## Tài liệu phải đọc trước audit

- `AGENTS.md`
- `quality/QUALITY.md`
- `docs/project-delivery/TECH_SPEC.md`
- `docs/project-delivery/PROJECT_GOVERNANCE.md`
- `docs/planning/INDICATOR_SSOT_POLICY.md`

## Prompt chuẩn cho từng auditor

```text
Audit code against the referenced specs and governance docs.
Do not invent findings.
Every finding must include severity, exact file path, exact line, why behavior violates the spec, and the smallest regression test that would catch it.
If uncertain, mark QUESTION instead of BUG.
Ignore style-only issues.
```

## Triage rules

- Nếu 2/3 auditor đồng ý: ưu tiên xử lý ngay.
- Nếu chỉ 1 auditor nêu ra: kiểm tra lại bằng grep/read trước khi ghi bug.
- Nếu finding đụng SSOT hoặc data correctness: tự động nâng mức review.

## Batch fix rules

1. Chỉ fix theo từng subsystem nhỏ.
2. Sau edit đầu tiên của mỗi batch phải validation ngay.
3. Không trộn cùng lúc fix SSOT sâu với fix UX bề mặt nếu chưa cần.
