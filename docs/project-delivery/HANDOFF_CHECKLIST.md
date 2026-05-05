# Handoff Checklist

## Trước khi bàn giao cho đội code

- [ ] Slice đã khớp với `IMPLEMENTATION_PLAN.md`
- [ ] Không còn hardcoded text mới trên bề mặt vừa sửa
- [ ] Không còn code chết rõ ràng liên quan slice
- [ ] `AUDIT_LEDGER.md` đã có entry mới
- [ ] `module_tree_full.md` đã regenerate
- [ ] `npm run type-check` pass
- [ ] `npm test` pass
- [ ] `npm run build:docs` pass

## Trước khi bàn giao cho đội QA/Audit

- [ ] Có modified file list rõ ràng
- [ ] Có note risk còn tồn đọng
- [ ] Có chỉ dẫn smoke check UI nếu change có ảnh hưởng runtime
- [ ] Có link đến spec/governance/quality docs liên quan

## Không được đóng task nếu

- thiếu evidence validation
- thiếu ledger update
- thay đổi runtime nhưng không có smoke note
- có regression đã biết mà không ghi rõ trong audit
