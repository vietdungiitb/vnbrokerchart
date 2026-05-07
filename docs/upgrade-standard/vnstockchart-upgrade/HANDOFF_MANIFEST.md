# Handoff Manifest — VNStockChart Upgrade CE14→CE21

> **Trạng thái package:** Approved · Sẵn sàng thực thi  
> **Phiên bản:** 1.0 · 2026-05-07  
> **Entry point repo:** [docs/project-delivery/README.md](../../project-delivery/README.md)  
> **Governance:** [docs/project-delivery/PROJECT_GOVERNANCE.md](../../project-delivery/PROJECT_GOVERNANCE.md)  
> **Change control:** [docs/CHANGE_CONTROL_STANDARD.md](../../CHANGE_CONTROL_STANDARD.md)

---

## 1. Mục tiêu của package này

Đây là bộ tài liệu bàn giao chính thức cho **lộ trình nâng cấp VNStockCharts lên ngang bằng và vượt KLineCharts** — 8 sprint (CE14→CE21) được thiết kế để đội code thực thi độc lập mà không cần hỏi lại bất kỳ quyết định kiến trúc nào.

Khi hoàn tất CE14→CE21:
- 30 indicators (ngang bằng KLineCharts) thay vì 7 hiện tại.
- 6 candle types (ngang bằng KLineCharts).
- Formal data adapter abstraction (vượt KLineCharts).
- Mobile/touch support (ngang bằng KLineCharts).
- Drawing overlay API extensible (vượt KLineCharts).

---

## 2. Bối cảnh — Trạng thái hiện tại trước CE14

### Đã có (KHÔNG được đổi)
| Layer | Trạng thái |
|---|---|
| Drawing engine CE11-CE13 (pane-aware, clipboard, undo-redo) | ✅ DONE |
| Indicator SSOT pipeline (IC-1, IC-2, IC-3) | ✅ DONE |
| i18n VI/EN (`src/demo/i18n.tsx`) | ✅ DONE |
| SeriesRegistry với Candlestick, HollowCandle, OHLC, HeikinAshi, Area đã register | ✅ DONE |
| `requestOlderHistoryPage` callback cho left-scroll backfill | ✅ EXISTS — nhưng chưa có trigger UI đủ |
| ErrorBoundary đã có trong app | ✅ DONE |

### Gap chính cần giải quyết
| Nhóm | Gap |
|---|---|
| Stability | `removeChild` React crash từ legacy component; left-scroll trigger chưa đủ mạnh |
| Indicators | Chỉ có 7 / cần 30 (thiếu MA, BBI, SAR, OBV, WR, VR, KDJ, CCI, DMI, BIAS, BRAR, MTM, EMV, AO, ROC, TRIX, DMA, PVT, PSY, CR) |
| Candle switcher | SeriesRegistry đã có HollowCandle/OHLC/HeikinAshi/Area nhưng toolbar chưa có switcher UI |
| Style API | Không có `overrideIndicator()` / per-instance style |
| Drawing API | Không có `registerDrawingTool()` public, không có groupId |
| Data adapter | Binance hard-coded, không pluggable |
| Mobile | Không có pinch/swipe touch events |

---

## 3. Quyết định đã chốt — Không được thay đổi

1. **SSOT nghiêm ngặt**: mọi indicator mới phải đi qua `enrichData.ts` và `SeriesRegistry`, không được compute cục bộ. Xem `docs/planning/INDICATOR_SSOT_POLICY.md`.
2. **i18n bắt buộc**: mọi label UI mới phải có key VI+EN trong `src/demo/i18n.tsx`. Không hardcode chuỗi tiếng Việt hoặc tiếng Anh trực tiếp trong component.
3. **No lib→demo import**: `src/lib/**` không được import từ `src/demo/**`.
4. **Plugin pattern cho indicator mới**: thêm file trong `src/lib/indicators/builtin/`, đăng ký trong `src/lib/indicators/index.ts`, thêm `RegistryEntry` vào `SeriesRegistry.ts`. Không viết thêm vào thân `enrichData.ts`.
5. **Candle types phải dùng SeriesRegistry**: `HollowCandle`, `OHLC`, `HeikinAshi`, `Area` đã register — chỉ cần thêm UI switcher và xử lý data transform cho HeikinAshi.
6. **Data adapter từ CE20**: `LibraryShowcaseDemo` sẽ dùng `DataAdapter` interface; Binance logic chuyển vào `BinanceAdapter`. Không xóa Binance code cho đến khi adapter sẵn sàng.
7. **Mobile CE21**: không được thêm dependency mới (không dùng hammerjs, use-gesture, etc.); xử lý touch events native với `pointer events` API hoặc `Touch API` thuần.
8. **Thứ tự thực thi bắt buộc**: CE14 → CE15 → CE16 → CE17 → CE18 → CE19 → CE20 → CE21. Mỗi sprint là điều kiện tiên quyết của sprint sau trừ CE18 (có thể song song với CE17) và CE20 (có thể song song với CE19).

---

## 4. Tài liệu giao kèm

| File | Vai trò |
|---|---|
| `HANDOFF_MANIFEST.md` *(file này)* | Entry point, scope, quyết định |
| `TECH_SPEC.md` | Đặc tả kỹ thuật chi tiết kiến trúc target |
| `IMPLEMENTATION_PLAN.md` | Lộ trình 8 sprint với DoD từng sprint |
| `TASKBOARD.md` | Bảng task tác chiến với trạng thái và file đích |
| `AUDIT_PROTOCOL.md` | Gate commands, evidence template, smoke checklist |
| `CE14_BRIEF.md` | Hướng dẫn chi tiết Sprint CE14 — Stability |
| `CE15_BRIEF.md` | Hướng dẫn chi tiết Sprint CE15 — Indicators Pack 1 |
| `CE16_BRIEF.md` | Hướng dẫn chi tiết Sprint CE16 — Indicators Pack 2 |
| `CE17_BRIEF.md` | Hướng dẫn chi tiết Sprint CE17 — Candle Types |
| `CE18_BRIEF.md` | Hướng dẫn chi tiết Sprint CE18 — Style Override API |
| `CE19_BRIEF.md` | Hướng dẫn chi tiết Sprint CE19 — Drawing Overlay API |
| `CE20_BRIEF.md` | Hướng dẫn chi tiết Sprint CE20 — Data Adapter |
| `CE21_BRIEF.md` | Hướng dẫn chi tiết Sprint CE21 — Mobile/Touch |

---

## 5. Tiêu chí chấp nhận chung (áp dụng cho tất cả sprint)

Một sprint chỉ được đóng khi:
- `npm run type-check` → PASS (0 errors)
- `npm test -- --run` → PASS (tất cả tests)
- `npm run build:docs` → compiled successfully
- `python scripts/generate_module_tree.py` → PASS
- `docs/upgrade-standard/AUDIT_LEDGER.md` có entry đủ evidence
- `module_tree_full.md` đã regenerate
- Không còn i18n text hardcoded mới
- Smoke check UI trong trình duyệt qua `npm run watch` (http://localhost:8080)
