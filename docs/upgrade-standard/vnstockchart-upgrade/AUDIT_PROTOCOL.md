# Audit Protocol — VNStockChart Upgrade CE14→CE21

> **Tham chiếu:** [QUALITY.md](../../../quality/QUALITY.md)  
> **Áp dụng cho:** Mỗi sprint kết thúc trong chuỗi CE14→CE21.

---

## Gate commands bắt buộc (chạy theo thứ tự)

```powershell
# Gate 1 — Type-check
npm run type-check
# Expected: 0 errors

# Gate 2 — Test suite
npm test
# Expected: All tests PASS, 0 failures
# Min count: hiện tại 37 files, 159 tests — KHÔNG được giảm

# Gate 3 — Docs build
npm run build:docs
# Expected: Build success, no webpack errors

# Gate 4 — Module tree
python scripts/generate_module_tree.py
# Expected: module_tree_full.md updated, module count ≥ current

# Gate 5 — Ledger update
# Manual: Thêm entry vào docs/upgrade-standard/AUDIT_LEDGER.md (xem template bên dưới)
```

---

## Template entry AUDIT_LEDGER.md

```markdown
## CE1X-YY — [Tên slice ngắn gọn]

**Ngày hoàn tất:** YYYY-MM-DD  
**Sprint:** CE1X  
**Engineer:** [Tên]

### Thay đổi
- `src/lib/...` — mô tả ngắn
- `src/demo/...` — mô tả ngắn

### Gate evidence
| Gate | Kết quả |
|---|---|
| type-check | 0 errors |
| npm test | XX tests PASS (0 fail) |
| build:docs | OK |
| module_tree | YYY modules |

### Ghi chú
[Bất kỳ deviation hoặc known issue]
```

---

## Checklist per slice

Trước khi mark `DONE` trên TASKBOARD, cần xác nhận:

- [ ] Code pass `npm run type-check` (0 errors)
- [ ] Code pass `npm test` (không giảm test count)
- [ ] `npm run build:docs` thành công
- [ ] `module_tree_full.md` đã regenerate
- [ ] `AUDIT_LEDGER.md` có entry mới
- [ ] Không thêm hardcoded UI text (phải có i18n key)
- [ ] `src/lib/**` không import từ `src/demo/**`
- [ ] Nếu thêm indicator: pass SSOT policy (qua `enrichData.ts` + `SeriesRegistry`)
- [ ] Nếu thêm file mới: file được mention trong ledger entry
- [ ] Nếu thêm npm dependency: cần approval riêng (tránh bloat)

---

## Quy trình xử lý lỗi type-check

Nếu gate 1 fail:

1. Đọc error message đầy đủ — không bỏ qua.
2. Không dùng `// @ts-ignore` để bypass.
3. Không dùng `any` để bypass.
4. Fix đúng kiểu — nếu không biết kiểu, hỏi team lead.
5. Sau fix, chạy lại type-check từ đầu.

---

## Quy trình xử lý test fail

Nếu gate 2 fail:

1. Đọc test failure output — locate file + line.
2. Không xóa test để vượt gate.
3. Nếu test bị outdated do API change: update test **và** document lý do trong ledger.
4. Nếu là regression: fix code (không fix test để che regression).

---

## Sprint-specific review

Ngoài gate commands, mỗi sprint có review focus riêng:

| Sprint | Review focus |
|---|---|
| CE14 | Không còn React `removeChild` crash, left-scroll load thực sự hoạt động |
| CE15 | SSOT compliance: compute qua plugin, register qua SeriesRegistry |
| CE16 | Compute accuracy: so sánh output với reference values (TradingView / ThinkorSwim) |
| CE17 | HeikinAshi transform formula đúng theo definition; không transform trong enrichData |
| CE18 | Override persist đúng, không mutate registry global state |
| CE19 | `registerDrawingTool()` không expose internal state; groupId không conflict |
| CE20 | DataAdapter interface không breaking change; BinanceAdapter parity với trước |
| CE21 | Test trên real device hoặc Chrome DevTools device emulator 375px |

---

## Audit trail commit convention

Sau khi close mỗi sprint:

```bash
git add -A
git commit -m "feat(CE1X): sprint close — [tên sprint]

- [bullet tóm tắt thay đổi chính]
- Gates: type-check OK | tests XX PASS | build OK | YYY modules

Ledger: docs/upgrade-standard/AUDIT_LEDGER.md#CE1X"

git push origin dev
```

**Không** push lên `main` trực tiếp — phải qua `dev` và PR review.
