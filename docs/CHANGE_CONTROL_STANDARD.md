# Change Control & Approval Standard

## 1. Mục đích

Tài liệu này định nghĩa khung phê duyệt và kiểm soát thay đổi cho toàn bộ repo. Mục tiêu là để các slice, feature mở rộng, cleanup, và sửa lỗi có thể đi theo cùng một quy trình, đủ rõ để đội code thực hiện ngay khi đã được duyệt và không cần hỏi lại những quyết định đã chốt.

## 2. Phạm vi áp dụng

Quy phạm này áp dụng cho mọi thay đổi trong `src/`, `docs/`, `quality/`, `scripts/`, và các tài liệu bàn giao có ảnh hưởng đến runtime, contract, dữ liệu, hoặc cách audit.

## 3. Thứ bậc hiệu lực

Nếu có xung đột giữa tài liệu, thứ bậc hiệu lực là:

1. `docs/README.md`
2. `docs/CHANGE_CONTROL_STANDARD.md`
3. `docs/project-delivery/README.md`
4. `docs/upgrade-standard/README.md`
5. `docs/project-delivery/PROJECT_GOVERNANCE.md`
6. `quality/QUALITY.md`
7. `docs/project-delivery/TECH_SPEC.md`
8. `docs/upgrade-standard/TECH_SPEC.md`
9. `docs/project-delivery/IMPLEMENTATION_PLAN.md`
10. `docs/upgrade-standard/IMPLEMENTATION_PLAN.md`
11. `docs/project-delivery/TASKBOARD.md`
12. `docs/upgrade-standard/TASKBOARD.md`
13. `docs/project-delivery/AUDIT_PROTOCOL.md`
14. `docs/upgrade-standard/AUDIT_LEDGER.md`

## 4. Phân loại thay đổi

| Loại thay đổi | Khi được làm | Tài liệu bắt buộc | Cần hỏi lại người dùng? | Được code ngay sau duyệt? |
| --- | --- | --- | --- | --- |
| Docs-only | Chỉ chỉnh tài liệu, không đổi behavior | `docs/README.md`, docs đích, `AUDIT_LEDGER.md` nếu là quy phạm | Không, nếu không đổi policy hiệu lực | Có |
| Narrow bugfix | Có anchor kỹ thuật gần nhất và giả thuyết local rõ ràng | `TECH_SPEC.md` liên quan, `AUDIT_PROTOCOL.md`, `AUDIT_LEDGER.md` | Không, nếu nằm trong plan hiện có | Có |
| Approved slice work | Task đã nằm trong slice/board được duyệt | `IMPLEMENTATION_PLAN.md`, `TASKBOARD.md`, `TECH_SPEC.md`, `AUDIT_PROTOCOL.md` | Không | Có |
| Contract / API change | Đổi props, export, data contract, or public shape | `TECH_SPEC.md` + plan + audit | Có, trừ khi tài liệu đã chốt rõ phạm vi | Chỉ khi duyệt xong |
| Data-source / market-fidelity change | Đổi nguồn dữ liệu, ticker, backfill, range math | `TECH_SPEC.md`, `QUALITY.md`, `AUDIT_PROTOCOL.md` | Có | Chỉ khi duyệt xong |
| Repo-wide cleanup | Scope vượt một subsystem | Plan cập nhật, ledger, module tree nếu chạm source | Có nếu plan chưa có | Chỉ khi duyệt xong |

## 5. Trạng thái phê duyệt

| Trạng thái | Ý nghĩa | Có được code không |
| --- | --- | --- |
| `Draft` | Đang soạn, scope chưa khóa | Không |
| `Review` | Đang được đối chiếu với spec/governance/quality | Không |
| `Approved` | Tài liệu đã đủ rõ, scope đã chốt, có thể giao thực thi | Có |
| `In progress` | Đang code trong phạm vi đã duyệt | Có |
| `Ready for audit` | Đã xong code, chờ validation / audit | Không thêm scope mới |
| `Closed` | Slice hoặc change đã đóng với evidence | Không |

## 6. Điều kiện code-ready

Một thay đổi chỉ được coi là `Approved` để code khi đồng thời đúng các điều kiện sau:

1. Scope được nêu rõ bằng file, directory, subsystem, hoặc slice ID.
2. Mục tiêu và non-goals đã ghi thành câu rõ ràng.
3. Có tài liệu hiệu lực cao hơn chỉ ra behavior mong muốn nếu thay đổi chạm runtime, data, hoặc contract.
4. Có `TASKBOARD.md` hoặc plan tương ứng cho task đó.
5. Có `AUDIT_PROTOCOL.md` hoặc template audit tương ứng.
6. Có nghĩa vụ `AUDIT_LEDGER.md` và, nếu chạm source, nghĩa vụ regenerate `module_tree_full.md`.
7. Không có xung đột chưa giải quyết với governance hoặc quality standard.

Khi các điều kiện trên đã được ghi rõ, đội code có thể tiến hành trực tiếp theo bộ tài liệu đã duyệt mà không cần hỏi lại từng bước nhỏ. Tín hiệu thực thi sau duyệt có thể là lệnh ngắn gọn của người dùng như `code đi`.

## 7. Khi nào phải hỏi lại

Phải hỏi lại người dùng trước khi code nếu xảy ra một trong các tình huống sau:

- Thay đổi public API hoặc contract chưa có trong plan.
- Thay đổi data source production-facing hoặc historical fidelity.
- Cần thêm dependency nền tảng mới cho i18n, state, data, hoặc rendering.
- Scope vượt slice đã chốt hoặc đụng nhiều subsystem mà chưa có plan tương ứng.
- Tài liệu hiệu lực có xung đột mà thứ bậc hiệu lực không giải được.

## 8. Bằng chứng bắt buộc

Mỗi thay đổi đã duyệt phải có tối thiểu:

- Danh sách file đã đổi.
- Validation command và kết quả.
- Risk còn lại nếu có.
- Liên kết tới ledger canonical.
- Nếu chạm runtime/UI, phải có smoke note có thể tái chạy.
- Nếu chạm source code, phải ghi rõ `module_tree_full.md` đã được regenerate.

## 9. Quy tắc điều phối

1. Nếu task đã nằm trong tài liệu `Approved`, không cần hỏi lại các quyết định đã chốt.
2. Nếu task chưa nằm trong plan hoặc có thay đổi contract/data-source, phải cập nhật tài liệu trước khi code.
3. Không dùng build pass làm bằng chứng duy nhất nếu behavior còn lệch spec.
4. Không cho phép scope creep trong cùng một change request nếu không có cập nhật chính thức.

## 10. Cập nhật tiêu chuẩn

Nếu thay đổi tiêu chuẩn này, phải đồng bộ ít nhất các file sau:

- `docs/README.md`
- `docs/project-delivery/README.md`
- `docs/upgrade-standard/README.md`
- `docs/project-delivery/PROJECT_GOVERNANCE.md`
- `quality/QUALITY.md`
- `docs/upgrade-standard/AUDIT_LEDGER.md`
